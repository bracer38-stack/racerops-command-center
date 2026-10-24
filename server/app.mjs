import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { z, ZodError } from 'zod';
import { schemas, idSchema, backupSchema, HttpError } from './schema.mjs';
import { configure, authMiddleware, hash } from './auth.mjs';
import { connectors } from './connectors.mjs';
import { parseVendoo, importVendoo } from './csv.mjs';
import { answer } from './assistant.mjs';

export function createApp(store, env, { staticDir, disableRateLimits = false } = {}) {
  const config = configure(env), app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], frameAncestors: ["'self'"] } },
    strictTransportSecurity: config.production ? undefined : false,
  }));
  const limit = (windowMs, count) => disableRateLimits ? (_req, _res, next) => next() : rateLimit({ windowMs, limit: count, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Try again shortly.' } });
  app.get('/api/health', (_req, res) => {
    store.db.prepare('SELECT 1').get();
    res.json({ status: 'healthy' });
  });
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  app.post('/api/webhooks/n8n', limit(60000, 60), express.raw({ type: 'application/json', limit: '1mb' }), (req, res) => {
    if (!config.WEBHOOK_SECRET) throw new HttpError(503, 'Webhook is not configured.');
    const timestamp = req.get('X-RacerOps-Timestamp') || '', signature = req.get('X-RacerOps-Signature') || '';
    if (!/^\d{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 || !/^sha256=[a-f0-9]{64}$/.test(signature) || !Buffer.isBuffer(req.body)) throw new HttpError(401, 'Invalid webhook signature or timestamp.');
    const expected = `sha256=${createHmac('sha256', config.WEBHOOK_SECRET).update(`${timestamp}.`).update(req.body).digest('hex')}`;
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new HttpError(401, 'Invalid webhook signature or timestamp.');
    let payload;
    try { payload = JSON.parse(req.body.toString('utf8')); } catch { throw new HttpError(400, 'Invalid JSON.'); }
    const event = z.object({ eventId: idSchema, type: z.enum(['alert', 'file', 'inventory', 'todo', 'notification']), data: z.record(z.string(), z.unknown()) }).strict().parse(payload);
    const table = { alert: 'alerts', file: 'files', inventory: 'inventory', todo: 'todos', notification: 'notifications' }[event.type];
    const data = schemas[table].parse(event.data), digest = hash(req.body);
    const previous = store.db.prepare('SELECT hash FROM webhook_events WHERE id = ?').get(event.eventId);
    if (previous) {
      if (previous.hash !== digest) throw new HttpError(409, 'Event ID already exists with different content.');
      return res.json({ received: true, duplicate: true });
    }
    const record = store.db.transaction(() => {
      let old;
      if (table === 'inventory' && data.sku) old = store.db.prepare('SELECT id FROM inventory WHERE sku = ? COLLATE NOCASE').get(data.sku);
      if (table === 'alerts' && data.externalId) old = store.db.prepare('SELECT id FROM alerts WHERE account = ? AND externalId = ?').get(data.account, data.externalId);
      if (table === 'files' && data.externalId) old = store.db.prepare('SELECT id FROM files WHERE cloud = ? AND account = ? AND externalId = ?').get(data.cloud, data.account, data.externalId);
      const saved = store.put(table, data, old?.id || randomUUID());
      store.db.prepare('INSERT INTO webhook_events VALUES (?, ?, ?)').run(event.eventId, digest, new Date().toISOString());
      return saved;
    })();
    res.status(201).json({ received: true, duplicate: false, recordId: record.id });
  });

  const auth = authMiddleware(store, config), cloud = connectors(store, config);
  app.use('/api', express.json({ limit: '10mb' }), auth.sameOrigin);
  app.post('/api/auth/login', limit(15 * 60000, 10), auth.login);
  app.use('/api', auth.authenticate, limit(60000, 240));
  app.get('/api/auth/session', (_req, res) => res.json({ authenticated: true }));
  app.post('/api/auth/logout', auth.logout);
  app.get('/api/connectors', (_req, res) => res.json(cloud.status()));
  app.get('/api/connectors/:provider/authorize', cloud.authorize);
  app.get('/api/connectors/:provider/callback', cloud.oauthCallback);
  app.post('/api/connectors/:id/sync', limit(60000, 10), cloud.sync);
  app.delete('/api/connectors/:id', cloud.disconnect);
  app.post('/api/assistant', limit(60000, 15), async (req, res) => res.json(await answer(store, config, req.body)));
  app.get('/api/backup', (_req, res) => res.json({ version: 1, exportedAt: new Date().toISOString(), ...store.snapshot() }));
  app.post('/api/backup/restore', (req, res) => {
    if (req.get('X-Confirm-Restore') !== 'replace-business-data') throw new HttpError(400, 'Explicit restore confirmation required.');
    const payload = backupSchema.parse(req.body);
    for (const name of Object.keys(schemas)) if (new Set(payload[name].map(row => row.id)).size !== payload[name].length) throw new HttpError(400, `Duplicate IDs in ${name}.`);
    store.restore(payload);
    res.json({ restored: true });
  });
  const csvBody = z.object({ csv: z.string().max(5 * 1024 * 1024), filename: z.string().trim().min(1).max(255), mode: z.enum(['skip', 'update']).default('skip') }).strict();
  app.post('/api/inventory/import/preview', (req, res) => {
    const body = csvBody.parse(req.body), parsed = parseVendoo(body.csv, body.filename);
    const existing = parsed.items.filter(i => store.db.prepare('SELECT id FROM inventory WHERE sku = ? COLLATE NOCASE').get(i.sku)).length;
    res.json({ items: parsed.items.slice(0, 20), rowCount: parsed.items.length, existing, errors: parsed.errors });
  });
  app.post('/api/inventory/import', (req, res) => {
    const body = csvBody.parse(req.body), parsed = parseVendoo(body.csv, body.filename);
    res.json(importVendoo(store, parsed, body.filename, body.mode));
  });
  for (const [name, schema] of Object.entries(schemas)) {
    app.get(`/api/${name}`, (req, res) => {
      const query = z.object({ q: z.string().max(200).default(''), limit: z.coerce.number().int().min(1).max(200).default(100), offset: z.coerce.number().int().min(0).default(0) }).parse(req.query);
      res.json(store.list(name, query));
    });
    app.get(`/api/${name}/:id`, (req, res) => {
      const record = store.get(name, idSchema.parse(req.params.id));
      if (!record) throw new HttpError(404, 'Record not found.');
      res.json(record);
    });
    app.post(`/api/${name}`, (req, res) => res.status(201).json(store.put(name, schema.parse(req.body))));
    app.patch(`/api/${name}/:id`, (req, res) => {
      const id = idSchema.parse(req.params.id), old = store.get(name, id);
      if (!old) throw new HttpError(404, 'Record not found.');
      const patch = schema.partial().parse(req.body);
      const { id: _id, createdAt: _created, updatedAt: _updated, ...data } = old;
      const supplied = Object.fromEntries(Object.keys(req.body).map(key => [key, patch[key]]));
      res.json(store.put(name, { ...data, ...supplied }, id));
    });
    app.delete(`/api/${name}/:id`, (req, res) => { store.remove(name, idSchema.parse(req.params.id)); res.status(204).end(); });
  }
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  if (staticDir && existsSync(join(staticDir, 'index.html'))) {
    app.use(express.static(staticDir, { setHeaders(res, path) { if (path.endsWith('sw.js') || path.endsWith('.html')) res.set('Cache-Control', 'no-cache'); } }));
    app.get(['/', '/legacy'], (_req, res) => res.sendFile(join(staticDir, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Validation failed.', details: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).slice(0, 20) });
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ error: 'Duplicate SKU/external ID, or missing parent app. No changes were saved.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Upload is too large.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
    res.status(error.status || 500).json({ error: error instanceof HttpError ? error.message : 'The request could not be completed. Check server configuration and try again.' });
  });
  return app;
}
