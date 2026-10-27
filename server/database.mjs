import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { schemas, HttpError } from './schema.mjs';

export function openStore(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new Database(path);
  const version = db.pragma('user_version', { simple: true });
  const populated = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' LIMIT 1").get();
  if (version !== 3 && (version !== 0 || populated)) {
    db.close();
    throw new Error(`Database version ${version} needs the explicitly approved Phase 1 upgrade after a verified backup. No migration was run.`);
  }
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  const bools = new Set(['actionRequired', 'done', 'read', 'listUnsubscribe', 'classificationOverride']);
  if (version === 0) db.transaction(() => {
    for (const [name, schema] of Object.entries(schemas)) {
      const columns = Object.keys(schema.shape).map(key => {
        const type = key === 'price' ? 'REAL' : bools.has(key) ? 'INTEGER NOT NULL' : 'TEXT';
        return `"${key}" ${type}${name === 'todos' && key === 'appId' ? ' REFERENCES apps(id) ON DELETE CASCADE' : ''}`;
      });
      db.exec(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT PRIMARY KEY, ${columns.join(',')}, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)`);
    }
    db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS inventory_sku ON inventory(sku COLLATE NOCASE) WHERE sku <> '';
    CREATE UNIQUE INDEX IF NOT EXISTS alerts_external ON alerts(account, externalId) WHERE externalId <> '';
    CREATE UNIQUE INDEX IF NOT EXISTS files_external ON files(cloud, account, externalId) WHERE externalId <> '';
    CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, expiresAt INTEGER NOT NULL, credential TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS oauth_states (hash TEXT PRIMARY KEY, provider TEXT NOT NULL, sessionHash TEXT NOT NULL, verifier TEXT NOT NULL, expiresAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS connections (id TEXT PRIMARY KEY, provider TEXT NOT NULL, account TEXT NOT NULL, tokens TEXT NOT NULL, lastSync TEXT, error TEXT, UNIQUE(provider, account));
    CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, hash TEXT NOT NULL, receivedAt TEXT NOT NULL, type TEXT NOT NULL DEFAULT '', recordId TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS folder_settings (connectionId TEXT PRIMARY KEY REFERENCES connections(id) ON DELETE CASCADE, folders TEXT NOT NULL DEFAULT '[]', updatedAt TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS webhook_received ON webhook_events(receivedAt DESC);
    PRAGMA user_version = 3;
    `);
  })();

  function table(name) { if (!Object.hasOwn(schemas, name)) throw new HttpError(404, 'Unknown resource'); return name; }
  function decode(row) {
    if (!row) return undefined;
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, bools.has(key) ? Boolean(value) : value]));
  }
  function get(name, id) { return decode(db.prepare(`SELECT * FROM ${table(name)} WHERE id = ?`).get(id)); }
  function list(name, { q = '', limit = 200, offset = 0 } = {}) {
    table(name);
    const keys = Object.keys(schemas[name].shape);
    const where = q ? ` WHERE (${keys.map(k => `LOWER(COALESCE("${k}", '')) LIKE ? ESCAPE '\\'`).join(' OR ')})` : '';
    const params = q ? keys.map(() => `%${q.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`) : [];
    const total = db.prepare(`SELECT COUNT(*) AS total FROM ${name}${where}`).get(...params).total;
    const items = db.prepare(`SELECT * FROM ${name}${where} ORDER BY createdAt DESC, id LIMIT ? OFFSET ?`).all(...params, limit, offset).map(decode);
    return { items, total, limit, offset };
  }
  function put(name, input, id = randomUUID(), metadata) {
    table(name);
    const previous = get(name, id);
    const data = schemas[name].parse(input);
    const now = new Date().toISOString();
    const row = { id, ...data, createdAt: metadata?.createdAt ?? previous?.createdAt ?? now, updatedAt: metadata?.updatedAt ?? now };
    const keys = Object.keys(row);
    db.prepare(`INSERT INTO ${name} (${keys.map(k => `"${k}"`).join(',')}) VALUES (${keys.map(() => '?').join(',')}) ON CONFLICT(id) DO UPDATE SET ${keys.filter(k => k !== 'id').map(k => `"${k}"=excluded."${k}"`).join(',')}`)
      .run(...keys.map(k => typeof row[k] === 'boolean' ? Number(row[k]) : row[k]));
    return get(name, id);
  }
  function remove(name, id) {
    if (!db.prepare(`DELETE FROM ${table(name)} WHERE id = ?`).run(id).changes) throw new HttpError(404, 'Record not found');
  }
  function snapshot() {
    return Object.fromEntries(Object.keys(schemas).map(name => [name, db.prepare(`SELECT * FROM ${name} ORDER BY createdAt DESC, id`).all().map(decode)]));
  }
  function restore(payload) {
    db.transaction(() => {
      for (const name of ['todos', 'apps', 'inventory', 'alerts', 'files', 'notifications']) db.prepare(`DELETE FROM ${name}`).run();
      for (const name of ['inventory', 'alerts', 'files', 'apps', 'todos', 'notifications']) {
        for (const { id, createdAt, updatedAt, ...record } of payload[name]) put(name, record, id, { createdAt, updatedAt });
      }
    })();
  }
  return { db, get, list, put, remove, snapshot, restore };
}
