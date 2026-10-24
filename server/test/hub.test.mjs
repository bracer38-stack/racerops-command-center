import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHmac, randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../database.mjs';
import { createApp } from '../app.mjs';
import { configure, tokenVault, hash } from '../auth.mjs';
import { parseVendoo, importVendoo } from '../csv.mjs';

const env = { HUB_PASSWORD: 'local-test-password-only', WEBHOOK_SECRET: 'local-test-webhook-signing-key-not-for-production' };
let store, server, origin, cookie;
beforeEach(async () => {
  store = openStore(':memory:');
  server = createApp(store, env, { disableRateLimits: true }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
  const result = await request('/auth/login', 'POST', { password: env.HUB_PASSWORD });
  cookie = result.headers.get('set-cookie').split(';')[0];
});
afterEach(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.db.close(); cookie = ''; });
async function request(path, method = 'GET', body, headers = {}) {
  return fetch(`${origin}/api${path}`, { method, headers: { Origin: origin, Cookie: cookie || '', 'Content-Type': 'application/json', ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
const fixtures = {
  inventory: { title: 'Blue denim jacket', sku: 'JKT-1', brand: 'Levi', price: 20, notes: 'Needs measurements', status: 'Needs Measurements' },
  alerts: { account: 'bracer38@gmail.com', subject: 'Buyer question', summary: 'Confirm the size' },
  files: { name: 'Product photos', url: 'https://drive.google.com/example' },
  apps: { name: 'NutriPlanPro', version: '0.1' },
  todos: { text: 'Check product measurements' },
  notifications: { title: 'Order imported', message: 'Saved by automation' },
};

test('private APIs require login and sessions are hashed, expiring HTTP-only cookies', async () => {
  assert.equal((await request('/inventory', 'GET', undefined, { Cookie: '' })).status, 401);
  assert.equal((await request('/backup', 'GET', undefined, { Cookie: '' })).status, 401);
  const login = await request('/auth/login', 'POST', { password: env.HUB_PASSWORD });
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.headers.get('set-cookie'), /SameSite=Lax/);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM sessions WHERE hash = ?').get(cookie.split('=')[1]).n, 0);
  store.db.prepare('UPDATE sessions SET expiresAt = 0').run();
  assert.equal((await request('/auth/session')).status, 401);
});
test('login, mutation, and logout reject foreign or missing Origins', async () => {
  for (const source of ['https://evil.example', '']) assert.equal((await request('/auth/login', 'POST', { password: env.HUB_PASSWORD }, { Origin: source })).status, 403);
  assert.equal((await request('/inventory', 'POST', fixtures.inventory, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await request('/auth/login', 'POST', { password: 'incorrect password' })).status, 401);
  assert.equal((await request('/auth/logout', 'POST', {})).status, 200);
  assert.equal((await request('/auth/session')).status, 401);
});
test('safe server configuration rejects weak passwords, invalid keys, and HTTP production', () => {
  assert.throws(() => configure({ HUB_PASSWORD: 'short' }));
  assert.throws(() => configure({ ...env, NODE_ENV: 'production', APP_URL: 'http://localhost' }));
  assert.throws(() => configure({ ...env, TOKEN_ENCRYPTION_KEY: 'invalid' }));
  assert.throws(() => configure({ ...env, WEBHOOK_SECRET: 'short' }));
  assert.equal(configure({ ...env, NODE_ENV: 'production', APP_URL: 'https://example.com' }).appUrl, 'https://example.com');
});
for (const [resource, data] of Object.entries(fixtures)) test(`${resource} CRUD persists only validated fields; PATCH preserves omitted defaults`, async () => {
  const create = await request(`/${resource}`, 'POST', data);
  assert.equal(create.status, 201);
  const row = await create.json();
  assert.ok(row.id); assert.ok(row.createdAt);
  const update = resource === 'inventory' ? { price: 25 } : resource === 'todos' ? { done: true } : resource === 'alerts' ? { actionRequired: false } : resource === 'notifications' ? { read: true } : { business: 'Dual Business' };
  const patch = await request(`/${resource}/${row.id}`, 'PATCH', update);
  assert.equal(patch.status, 200);
  const changed = await patch.json();
  assert.deepEqual(changed, { ...row, ...update, updatedAt: changed.updatedAt });
  assert.equal((await request(`/${resource}/${row.id}`)).status, 200);
  const list = await (await request(`/${resource}?limit=1&offset=0`)).json();
  assert.equal(list.total, 1); assert.equal(list.items.length, 1);
  assert.equal((await request(`/${resource}/${row.id}`, 'PATCH', { id: 'injected' })).status, 400);
  assert.equal((await request(`/${resource}/${row.id}`, 'DELETE')).status, 204);
  assert.equal((await request(`/${resource}/${row.id}`)).status, 404);
});
test('database enforces SKU uniqueness, parent references, and cascade deletion', async () => {
  const app = store.put('apps', fixtures.apps);
  store.put('todos', { ...fixtures.todos, appId: app.id });
  assert.equal((await request('/todos', 'POST', { ...fixtures.todos, appId: 'missing' })).status, 409);
  store.remove('apps', app.id); assert.equal(store.list('todos').total, 0);
  store.put('inventory', fixtures.inventory);
  assert.equal((await request('/inventory', 'POST', { ...fixtures.inventory, sku: 'jkt-1' })).status, 409);
});
test('search escapes SQL wildcards and rejects SQL-like resource IDs', async () => {
  store.put('inventory', { title: '100% wool _ sweater' }); store.put('inventory', { title: 'Other item' });
  assert.equal(store.list('inventory', { q: '%' }).total, 1);
  assert.equal(store.list('inventory', { q: '_' }).total, 1);
  assert.equal(store.list('inventory', { q: "' OR 1=1--" }).total, 0);
  assert.equal((await request('/inventory/invalid%20id')).status, 400);
  assert.equal((await request('/files', 'POST', { name: 'Unsafe', url: 'javascript:alert(1)' })).status, 400);
});
test('records and login sessions survive closing and reopening the SQLite database', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'racerops-test-')), path = join(dir, 'hub.sqlite');
  try {
    let persistent = openStore(path);
    const record = persistent.put('inventory', fixtures.inventory);
    persistent.db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run('hashed-value', Date.now() + 1000, 'credential');
    persistent.db.close(); persistent = openStore(path);
    assert.equal(persistent.get('inventory', record.id).title, fixtures.inventory.title);
    assert.equal(persistent.db.prepare('SELECT COUNT(*) n FROM sessions').get().n, 1);
    persistent.db.close();
  } finally { rmSync(dir, { recursive: true }); }
});
test('Vendoo parsing handles BOM, quoted commas/newlines, money, and deterministic fallback SKUs', () => {
  const csv = '\uFEFFTitle,SKU,Price,Notes\r\n"Denim, jacket",J-2,"$1,234.50","Chest: 20\nLength: 30"\r\nShirt,,,No measurements\r\n';
  const parsed = parseVendoo(csv, 'vendoo.csv');
  assert.deepEqual(parsed.errors, []); assert.equal(parsed.items.length, 2);
  assert.equal(parsed.items[0].price, 1234.5); assert.match(parsed.items[0].notes, /\n/);
  assert.equal(parsed.items[1].price, null);
  assert.equal(parsed.items[1].sku, parseVendoo(csv, 'another.csv').items[1].sku);
});
test('CSV preview never persists; duplicate SKUs skip or update explicitly', async () => {
  const body = { filename: 'vendoo.csv', csv: 'Title,SKU,Price\nJacket,J-1,25' };
  assert.equal((await request('/inventory/import/preview', 'POST', body)).status, 200);
  assert.equal(store.list('inventory').total, 0);
  assert.equal((await (await request('/inventory/import', 'POST', body)).json()).inserted, 1);
  assert.equal((await (await request('/inventory/import', 'POST', body)).json()).skipped, 1);
  const update = { ...body, mode: 'update', csv: 'Title,SKU,Price\nNew title,J-1,30' };
  assert.equal((await (await request('/inventory/import', 'POST', update)).json()).updated, 1);
  assert.equal(store.list('inventory').items[0].title, 'New title');
  assert.equal(store.list('files').total, 2);
});
test('invalid CSV rows reject the whole import, not a partial batch', async () => {
  for (const csv of ['Title,SKU,Price\nValid,A,2\nBad,B,-1', 'Title,SKU\nFirst,A\nSecond,a', 'Title,SKU\n,A']) {
    const body = { csv, filename: 'bad.csv' };
    const preview = await (await request('/inventory/import/preview', 'POST', body)).json();
    assert.ok(preview.errors.length);
    assert.equal((await request('/inventory/import', 'POST', body)).status, 422);
    assert.equal(store.list('inventory').total, 0);
  }
  for (const csv of ['Name,Name\nA,B', 'OnlySku\nA', 'Title,Price\n"unterminated,3']) assert.throws(() => parseVendoo(csv, 'bad.csv'));
  assert.throws(() => parseVendoo(`Title\n${'Item\n'.repeat(5001)}`, 'large.csv'));
  assert.throws(() => importVendoo(store, { items: [], errors: [{ row: 2 }] }, 'bad.csv', 'skip'));
});
async function webhook(payload, options = {}) {
  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const timestamp = options.timestamp || String(Math.floor(Date.now() / 1000));
  const signature = `sha256=${createHmac('sha256', env.WEBHOOK_SECRET).update(`${timestamp}.${raw}`).digest('hex')}`;
  return fetch(`${origin}/api/webhooks/n8n`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-RacerOps-Timestamp': timestamp, 'X-RacerOps-Signature': options.signature || signature }, body: raw });
}
test('n8n accepts signed deliveries once and detects conflicting event IDs', async () => {
  const event = { eventId: 'n8n-order-1', type: 'notification', data: fixtures.notifications };
  assert.equal((await webhook(event)).status, 201);
  assert.equal((await (await webhook(event)).json()).duplicate, true);
  assert.equal(store.list('notifications').total, 1);
  assert.equal((await webhook({ ...event, data: { title: 'Changed' } })).status, 409);
  assert.equal(store.list('notifications').items[0].title, fixtures.notifications.title);
});
test('n8n rejects forged, stale, malformed and invalid deliveries without persistence', async () => {
  const event = { eventId: 'event-1', type: 'notification', data: fixtures.notifications };
  assert.equal((await webhook(event, { signature: `sha256=${'0'.repeat(64)}` })).status, 401);
  assert.equal((await webhook(event, { timestamp: String(Math.floor(Date.now() / 1000) - 301) })).status, 401);
  assert.equal((await webhook('{broken')).status, 400);
  assert.equal((await webhook({ ...event, type: 'unknown' })).status, 400);
  assert.equal((await webhook({ ...event, data: {} })).status, 400);
  assert.equal(store.list('notifications').total, 0);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM webhook_events').get().n, 0);
});
test('n8n upserts inventory by SKU and rejects missing parent to-dos atomically', async () => {
  await webhook({ eventId: 'i-1', type: 'inventory', data: fixtures.inventory });
  await webhook({ eventId: 'i-2', type: 'inventory', data: { ...fixtures.inventory, price: 28 } });
  assert.equal(store.list('inventory').total, 1); assert.equal(store.list('inventory').items[0].price, 28);
  assert.equal((await webhook({ eventId: 't-1', type: 'todo', data: { text: 'Missing parent', appId: 'absent' } })).status, 409);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM webhook_events WHERE id = ?').get('t-1').n, 0);
});
test('backups omit credentials and restore business records only with explicit confirmation', async () => {
  for (const [name, data] of Object.entries(fixtures)) store.put(name, data);
  store.db.prepare('INSERT INTO connections (id,provider,account,tokens) VALUES (?,?,?,?)').run('c-1', 'google', 'account', 'opaque-encrypted-value');
  const exported = await request('/backup');
  assert.equal(exported.headers.get('cache-control'), 'no-store');
  const backup = await exported.json();
  assert.equal(backup.inventory.length, 1); assert.equal(backup.sessions, undefined); assert.equal(backup.connections, undefined);
  const confirmation = { 'X-Confirm-Restore': 'replace-business-data' };
  assert.equal((await request('/backup/restore', 'POST', backup)).status, 400);
  store.put('inventory', { title: 'Added after backup' });
  assert.equal((await request('/backup/restore', 'POST', backup, confirmation)).status, 200);
  assert.equal(store.list('inventory').total, 1);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM connections').get().n, 1);
  assert.equal((await request('/auth/session')).status, 200);
});
test('failed restores roll back all business deletes and reject duplicate record IDs', async () => {
  store.put('inventory', fixtures.inventory);
  const backup = await (await request('/backup')).json();
  backup.todos.push({ ...fixtures.todos, id: 'broken', appId: 'nonexistent', done: false, business: 'App Studio', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  const confirm = { 'X-Confirm-Restore': 'replace-business-data' };
  assert.equal((await request('/backup/restore', 'POST', backup, confirm)).status, 409);
  assert.equal(store.list('inventory').total, 1);
  backup.todos = []; backup.inventory.push(backup.inventory[0]);
  assert.equal((await request('/backup/restore', 'POST', backup, confirm)).status, 400);
});
test('assistant queries saved inventory and open to-dos with exact totals and citations', async () => {
  const inventory = store.put('inventory', fixtures.inventory);
  store.put('todos', fixtures.todos); store.put('todos', { text: 'Already completed', done: true });
  const reply = await (await request('/assistant', 'POST', { question: 'What Vendoo items need measurements?' })).json();
  assert.equal(reply.mode, 'database'); assert.equal(reply.totals.inventory, 1);
  assert.equal(reply.totals.openTodos, 1); assert.match(reply.text, /Blue denim jacket/);
  assert.ok(reply.citations.some(c => c.id === inventory.id)); assert.match(reply.scope, /not live provider checks/);
  const todos = await (await request('/assistant', 'POST', { question: 'Show open to-dos' })).json();
  assert.equal(todos.rows.todos.length, 1); assert.equal(todos.rows.todos[0].done, false);
  assert.equal((await request('/assistant', 'POST', { question: '' })).status, 400);
});
test('OAuth vault encryption is authenticated and detects token tampering', () => {
  const vault = tokenVault(randomBytes(32).toString('base64'));
  const input = { access_token: 'fixture-access-token', refresh_token: 'fixture-refresh-token' };
  const sealed = vault.encrypt(input); assert.ok(!sealed.includes(input.access_token));
  assert.deepEqual(vault.decrypt(sealed), input);
  const damaged = Buffer.from(sealed, 'base64'); damaged[damaged.length - 1] ^= 1;
  assert.throws(() => vault.decrypt(damaged.toString('base64')));
});
test('unconfigured cloud providers do not pretend to be connected', async () => {
  const status = await (await request('/connectors')).json();
  assert.deepEqual(status.connections, []); assert.equal(status.googleConfigured, false); assert.equal(status.onedriveConfigured, false);
  assert.equal((await request('/connectors/google/authorize')).status, 503);
  assert.equal((await request('/connectors/missing/sync', 'POST', {})).status, 404);
});
test('OAuth authorization uses PKCE with state bound to the authenticated session', async () => {
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  const config = { ...env, APP_URL: origin, TOKEN_ENCRYPTION_KEY: randomBytes(32).toString('base64'), GOOGLE_CLIENT_ID: 'fixture-id', GOOGLE_CLIENT_SECRET: 'fixture-secret' };
  server = createApp(store, config, { disableRateLimits: true }).listen(Number(new URL(origin).port), '127.0.0.1');
  await once(server, 'listening');
  const authorize = await fetch(`${origin}/api/connectors/google/authorize`, { headers: { Cookie: cookie }, redirect: 'manual' });
  assert.equal(authorize.status, 302);
  const target = new URL(authorize.headers.get('location'));
  assert.equal(target.origin, 'https://accounts.google.com'); assert.equal(target.searchParams.get('code_challenge_method'), 'S256');
  const state = target.searchParams.get('state');
  const saved = store.db.prepare('SELECT * FROM oauth_states WHERE hash = ?').get(hash(state));
  assert.ok(saved); assert.equal(saved.sessionHash, hash(cookie.split('=')[1]));
  assert.equal((await request('/connectors/google/callback?state=not-valid&code=fixture')).status, 400);
  store.db.prepare('UPDATE oauth_states SET expiresAt = 0').run();
  assert.equal((await request(`/connectors/google/callback?state=${state}&code=fixture`)).status, 400);
});
