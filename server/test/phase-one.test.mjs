import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { openStore } from '../database.mjs';
import { createApp } from '../app.mjs';
import { tokenVault } from '../auth.mjs';
import { syncSelectedFiles } from '../folders.mjs';
import { inventorySuggestions, classifyAlert } from '../../shared/operations.mjs';

const json = body => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
async function fixture(t, provider = 'google') {
  const store = openStore(':memory:');
  const env = { APP_URL: 'http://phase-one.local', HUB_PASSWORD: 'phase-one-local-fixture-password', TOKEN_ENCRYPTION_KEY: randomBytes(32).toString('base64'), GOOGLE_CLIENT_ID: 'fixture-google', GOOGLE_CLIENT_SECRET: 'fixture-google-secret', MICROSOFT_CLIENT_ID: 'fixture-ms', MICROSOFT_CLIENT_SECRET: 'fixture-ms-secret' };
  const server = createApp(store, env, { disableRateLimits: true }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  const request = (path, method = 'GET', body, headers = {}) => fetch(`${origin}/api${path}`, { method, headers: { 'Content-Type': 'application/json', Origin: env.APP_URL, Cookie: cookie, ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  cookie = (await request('/auth/login', 'POST', { password: env.HUB_PASSWORD })).headers.get('set-cookie').split(';')[0];
  const account = provider === 'google' ? 'bracer38@gmail.com' : 'local-owner@example.com';
  store.db.prepare('INSERT INTO connections (id,provider,account,tokens) VALUES (?,?,?,?)').run('c1', provider, account, tokenVault(env.TOKEN_ENCRYPTION_KEY).encrypt({ access_token: 'synthetic-local-token', expires_at: Date.now() + 3600000 }));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); store.db.close(); });
  const select = folders => store.db.prepare('INSERT INTO folder_settings (connectionId,folders,updatedAt) VALUES (?,?,?) ON CONFLICT(connectionId) DO UPDATE SET folders=excluded.folders,updatedAt=excluded.updatedAt').run('c1', JSON.stringify(folders), new Date().toISOString());
  const mock = handler => {
    const original = globalThis.fetch;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      if (String(url).startsWith(origin)) return original(url, options);
      assert.equal(options.method || 'GET', 'GET');
      return json(await handler(new URL(url), options));
    });
  };
  return { store, request, select, mock, account };
}

test('bulk suggestions are explicit, atomic and stale-safe, preserving unapproved fields', async t => {
  const { store, request } = await fixture(t);
  const item = store.put('inventory', { title: 'Blouse Size Large Navy/White', brand: 'akaria', price: 88, notes: 'Synthetic keep-me description', sku: 'BULK-1' }, 'i1', { updatedAt: '2026-01-01T12:00:00.000Z' });
  const other = store.put('inventory', { title: 'Medium top', size: 'S' });
  const approvals = inventorySuggestions(item).map(s => ({ id: item.id, field: s.field, value: s.value, expectedUpdatedAt: item.updatedAt }));
  assert.equal(store.get('inventory', item.id).size, '');
  assert.equal((await request('/inventory/suggestions/approve', 'POST', { approvals: [...approvals, { id: other.id, field: 'size', value: 'Medium', expectedUpdatedAt: '2000-01-01T00:00:00.000Z' }] })).status, 409);
  assert.equal(store.get('inventory', item.id).size, '');
  assert.equal((await request('/inventory/suggestions/approve', 'POST', { approvals: [approvals[0], approvals[0]] })).status, 400);
  assert.equal((await request('/inventory/suggestions/approve', 'POST', { approvals: [approvals[0]] }, { Cookie: '' })).status, 401);
  assert.deepEqual(await (await request('/inventory/suggestions/approve', 'POST', { approvals })).json(), { updated: 1, approved: 3 });
  const saved = store.get('inventory', item.id);
  for (const key of ['sku', 'price', 'notes', 'id', 'createdAt', 'imageUrl']) assert.equal(saved[key], item[key]);
  assert.equal(saved.size, 'Large'); assert.equal(saved.color, 'Navy/White'); assert.equal(saved.brand, 'AKIRA');
  assert.equal((await request('/inventory/suggestions/approve', 'POST', { approvals })).status, 409);
  assert.equal(store.get('inventory', other.id).size, 'S');
});

test('Google folder selection verifies folders, business and ancestry without deleting records', async t => {
  const { store, request, mock } = await fixture(t);
  const old = store.put('files', { name: 'Keep prior metadata' });
  mock(url => {
    if (url.pathname.endsWith('/root')) return { id: 'root-id', name: 'My Drive', mimeType: 'application/vnd.google-apps.folder' };
    if (url.pathname.endsWith('/business')) return { id: 'business', name: 'Actual business name', mimeType: 'application/vnd.google-apps.folder', parents: ['root-id'] };
    if (url.pathname.endsWith('/root-id')) return { id: 'root-id', name: 'My Drive', mimeType: 'application/vnd.google-apps.folder' };
    if (url.pathname.endsWith('/not-folder')) return { id: 'not-folder', name: 'A file', mimeType: 'text/plain' };
    assert.match(url.searchParams.get('q'), /mimeType.*folder/);
    return { files: [{ id: 'business', name: 'Business', parents: ['root-id'] }] };
  });
  assert.equal((await request('/connectors/c1/folders', 'GET', undefined, { Cookie: '' })).status, 401);
  assert.equal((await (await request('/connectors/c1/folders')).json()).folders[0].id, 'business');
  assert.equal((await request('/connectors/c1/folders', 'PUT', { folders: [{ id: 'business', name: 'Bad', business: 'Dual Business' }] })).status, 400);
  assert.equal((await request('/connectors/c1/folders', 'PUT', { folders: [{ id: 'not-folder', name: 'File', business: "Kim's Closet" }] })).status, 400);
  assert.equal((await request('/connectors/c1/folders', 'PUT', { folders: [{ id: 'root-id', name: 'My Drive', business: "Kim's Closet" }] })).status, 400);
  const response = await request('/connectors/c1/folders', 'PUT', { folders: [{ id: 'business', name: 'Spoofed name', business: "Kim's Closet", ancestorIds: ['spoofed'] }] });
  assert.equal(response.status, 200);
  const { folders } = await response.json();
  assert.equal(folders[0].name, 'Actual business name'); assert.deepEqual(folders[0].ancestorIds, ['root-id']);
  assert.equal((await (await request('/connectors')).json()).connections[0].folders[0].id, 'business');
  assert.deepEqual(store.get('files', old.id), old);
  assert.equal((await request('/connectors/c1/folders', 'PUT', { folders: [] })).status, 200);
  assert.deepEqual(store.get('files', old.id), old);
});

test('cleanup confirms exact current counts, protects selected ancestors, unknown metadata, other accounts and manual records', async t => {
  const { store, request, select, account, mock } = await fixture(t);
  mock(() => { throw new Error('Cleanup must never call or modify the provider'); });
  select([{ id: 'business', name: 'Business', business: "Kim's Closet" }]);
  const file = (name, values = {}) => store.put('files', { name, account, cloud: 'Google Drive', source: 'Google Drive sync', ...values });
  const keep = file('Selected descendant', { folderId: 'child', folderPathIds: '["child","business","root-id"]' });
  const excluded = file('Excluded', { folderId: 'personal', folderPathIds: '["personal","root-id"]' });
  const unknown = file('Old metadata', { folder: 'legacy-id' });
  const manual = file('Manual', { source: 'Manual', folderId: 'personal', folderPathIds: '["personal"]' });
  const other = file('Other account', { account: 'someone@example.com', folderPathIds: '["personal"]' });
  const preview = await (await request('/connectors/c1/prune-preview')).json();
  assert.equal(preview.count, 1); assert.equal(preview.unknown, 1);
  const confirmation = { includeUnknown: false, revision: preview.revision, expectedCount: preview.count };
  assert.equal((await request('/connectors/c1/prune', 'POST', confirmation)).status, 400);
  const headers = { 'X-Confirm-Excluded-Records': 'remove-excluded-records' };
  assert.equal((await request('/connectors/c1/prune', 'POST', { ...confirmation, expectedCount: 2 }, headers)).status, 409);
  const extra = file('Added since preview', { folderPathIds: '["personal"]' });
  assert.equal((await request('/connectors/c1/prune', 'POST', confirmation, headers)).status, 409);
  const current = await (await request('/connectors/c1/prune-preview')).json();
  assert.deepEqual(await (await request('/connectors/c1/prune', 'POST', { ...confirmation, revision: current.revision, expectedCount: 2 }, headers)).json(), { removed: 2, providerFilesUntouched: true });
  assert.equal(store.get('files', excluded.id), undefined); assert.equal(store.get('files', extra.id), undefined);
  for (const row of [keep, unknown, manual, other]) assert.deepEqual(store.get('files', row.id), row);
  const withUnknown = await (await request('/connectors/c1/prune-preview?includeUnknown=true')).json();
  assert.equal(withUnknown.count, 1);
  assert.equal((await request('/connectors/c1/prune', 'POST', { includeUnknown: true, revision: withUnknown.revision, expectedCount: 1 }, headers)).status, 200);
  assert.equal(store.get('files', unknown.id), undefined);
});

for (const provider of ['google', 'onedrive']) test(`${provider} sync stays in selected folders, handles nested overrides and records safe ancestry`, async () => {
  let calls = 0;
  const get = async value => {
    calls++;
    const url = new URL(value), parent = provider === 'google' ? url.searchParams.get('q').match(/^'([^']+)'/)[1] : url.pathname.split('/').at(-2);
    const items = parent === 'business' ? [{ id: 'child', name: 'Child', mimeType: 'application/vnd.google-apps.folder', folder: {} }, { id: 'root-file', name: 'Root file', file: {}, webUrl: 'https://example.com/root' }] : [{ id: 'child-file', name: 'Child file', file: {}, webUrl: 'https://example.com/child' }];
    assert.ok(['business', 'child'].includes(parent));
    return provider === 'google' ? { files: items } : { value: items };
  };
  const rows = await syncSelectedFiles({ provider, account: 'fixture@example.com' }, [{ id: 'business', name: 'Business', business: "Kim's Closet", ancestorIds: ['root-id'] }, { id: 'child', name: 'Child', business: 'Over50FitLife', ancestorIds: ['business', 'root-id'] }], get);
  assert.equal(calls, 2); assert.equal(rows.length, 2);
  assert.equal(rows.find(r => r.externalId === 'child-file').business, 'Over50FitLife');
  assert.deepEqual(JSON.parse(rows.find(r => r.externalId === 'child-file').folderPathIds), ['child', 'business', 'root-id']);
  assert.equal(rows.find(r => r.externalId === 'root-file').business, "Kim's Closet");
  assert.deepEqual(await syncSelectedFiles({ provider }, [], async () => { throw new Error('No root sync allowed'); }), []);
});

test('OneDrive folder browsing and file pagination reject off-origin links before credentials leave the provider', async t => {
  const { request, mock } = await fixture(t, 'onedrive');
  let calls = 0;
  mock(url => { calls++; assert.equal(url.origin, 'https://graph.microsoft.com'); return { value: [], '@odata.nextLink': 'https://untrusted.example/collect' }; });
  assert.equal((await request('/connectors/c1/folders')).status, 502); assert.equal(calls, 1);
  await assert.rejects(syncSelectedFiles({ provider: 'onedrive', account: 'fixture@example.com' }, [{ id: 'business', name: 'Business', business: 'NutriPlanPro' }], async () => ({ value: [], '@odata.nextLink': 'https://untrusted.example/collect' })), /Unexpected cloud response URL/);
});

test('folder traversal is bounded, cycle-safe, and will not follow a changed pagination collection', async () => {
  const record = { provider: 'google', account: 'fixture@example.com' }, folders = [{ id: 'business', name: 'Business', business: "Kim's Closet" }];
  let pages = 0;
  await assert.rejects(syncSelectedFiles(record, folders, async () => { pages++; return { files: [], nextPageToken: 'repeated' }; }), /Too many items/);
  assert.equal(pages, 5);
  const many = await syncSelectedFiles(record, folders, async () => ({ files: Array.from({ length: 300 }, (_, i) => ({ id: `f${i}`, name: `File ${i}` })) }));
  assert.equal(many.length, 200);
  let cycles = 0;
  assert.deepEqual(await syncSelectedFiles(record, folders, async () => { cycles++; return { files: [{ id: 'business', name: 'Cycle', mimeType: 'application/vnd.google-apps.folder' }] }; }), []);
  assert.equal(cycles, 1);
  await assert.rejects(syncSelectedFiles({ ...record, provider: 'onedrive' }, folders, async () => ({ value: [], '@odata.nextLink': 'https://graph.microsoft.com/v1.0/me/drive/root/children' })), /Unexpected cloud response URL/);
});

test('Gmail sync captures promo metadata, applies business/action rules and preserves owner-reviewed overrides on re-sync', async t => {
  const { store, request, mock } = await fixture(t);
  mock(url => {
    if (url.pathname.endsWith('/messages')) return { messages: [{ id: 'm1' }, { id: 'm2' }] };
    assert.ok(url.searchParams.getAll('metadataHeaders').includes('List-Unsubscribe'));
    const id = url.pathname.split('/').at(-1);
    return { id, snippet: 'Bob&#39;s &amp; Kim&apos;s update', labelIds: id === 'm2' ? ['CATEGORY_UPDATES'] : ['INBOX'], payload: { headers: [{ name: 'Subject', value: id === 'm1' ? 'You made a sale!' : 'Weekly news' }, { name: 'From', value: id === 'm1' ? 'Poshmark' : 'newsletter@example.com' }, ...(id === 'm2' ? [{ name: 'List-Unsubscribe', value: '<https://example.com/unsubscribe>' }] : [])] } };
  });
  assert.equal((await request('/connectors/c1/sync', 'POST', {})).status, 200);
  const sale = store.list('alerts').items.find(a => a.externalId === 'm1'), marketing = store.list('alerts').items.find(a => a.externalId === 'm2');
  assert.equal(sale.business, "Kim's Closet"); assert.equal(sale.actionRequired, true); assert.equal(sale.summary, "Bob's & Kim's update");
  assert.equal(marketing.listUnsubscribe, true); assert.equal(classifyAlert(marketing).promotional, true); assert.equal(marketing.priority, 'Low');
  const override = await request(`/alerts/${sale.id}`, 'PATCH', { actionRequired: false, priority: 'Low', business: 'App Studio' });
  assert.equal((await override.json()).classificationOverride, true);
  await request('/connectors/c1/sync', 'POST', {});
  const reviewed = classifyAlert(store.get('alerts', sale.id));
  assert.equal(reviewed.actionRequired, false); assert.equal(reviewed.priority, 'Low'); assert.equal(reviewed.business, 'App Studio');
});
