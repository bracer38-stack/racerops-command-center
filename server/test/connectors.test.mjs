import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { openStore } from '../database.mjs';
import { connectors } from '../connectors.mjs';
import { tokenVault, hash } from '../auth.mjs';
import { answer } from '../assistant.mjs';

function fixture(t) {
  const store = openStore(':memory:'); t.after(() => store.db.close());
  const config = { appUrl: 'https://hub.example.com', TOKEN_ENCRYPTION_KEY: randomBytes(32).toString('base64'), GOOGLE_CLIENT_ID: 'fixture-client', GOOGLE_CLIENT_SECRET: 'fixture-client-secret', MICROSOFT_CLIENT_ID: 'fixture-ms-client', MICROSOFT_CLIENT_SECRET: 'fixture-ms-secret' };
  return { store, config, cloud: connectors(store, config) };
}
function authorization(cloud, provider, sessionHash = 'session-fixture') {
  let location;
  cloud.authorize({ params: { provider }, sessionHash }, { redirect(url) { location = new URL(url); } });
  return { params: { provider }, sessionHash, query: { state: location.searchParams.get('state'), code: 'fixture-code' } };
}
const json = body => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

test('Google consent stores encrypted tokens, refreshes safely, syncs metadata idempotently', async t => {
  const { store, config, cloud } = fixture(t);
  let refreshes = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.includes('oauth2.googleapis.com/token')) {
      if (options.body.get('grant_type') === 'refresh_token') { refreshes++; return json({ access_token: 'refreshed-fixture-token', expires_in: 3600 }); }
      assert.equal(options.body.get('code_verifier').length, 43);
      return json({ access_token: 'initial-fixture-token', refresh_token: 'fixture-refresh', expires_in: 0 });
    }
    if (url.includes('userinfo')) return json({ email: 'bracer38@gmail.com', email_verified: true });
    assert.match(options.headers.Authorization, /refreshed-fixture-token/);
    if (url.includes('/messages?')) return json({ messages: [{ id: 'm1' }] });
    if (url.includes('/messages/m1?')) return json({ id: 'm1', snippet: 'Buyer asks for measurements', labelIds: ['STARRED'], payload: { headers: [{ name: 'Subject', value: 'New direct message: Measurements please' }, { name: 'From', value: 'Buyer' }] } });
    if (url.includes('drive/v3/files')) return json({ files: [{ id: 'f1', name: 'Jacket photos', parents: ['parent1'], webViewLink: 'https://drive.google.com/file/d/f1' }] });
    throw new Error(`Unexpected fixture URL: ${url}`);
  });
  const auth = authorization(cloud, 'google');
  let location;
  await cloud.oauthCallback(auth, { redirect(url) { location = url; } });
  assert.equal(location, '/?connected=1');
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM oauth_states').get().n, 0);
  const connection = store.db.prepare('SELECT * FROM connections').get();
  store.db.prepare('INSERT INTO folder_settings (connectionId,folders,updatedAt) VALUES (?,?,?)').run(connection.id, JSON.stringify([{ id: 'parent1', name: 'Business', business: "Kim's Closet" }]), new Date().toISOString());
  assert.ok(!connection.tokens.includes('fixture-refresh'));
  assert.equal(cloud.status().connections[0].tokens, undefined);
  for (let n = 0; n < 2; n++) {
    let result;
    await cloud.sync({ params: { id: connection.id } }, { json(value) { result = value; } });
    assert.deepEqual(result, { alerts: 1, files: 1 });
  }
  assert.equal(refreshes, 1); assert.equal(store.list('alerts').total, 1); assert.equal(store.list('files').total, 1);
  assert.equal(store.list('alerts').items[0].actionRequired, true);
  assert.ok(cloud.status().connections[0].lastSync);
  const renewed = tokenVault(config.TOKEN_ENCRYPTION_KEY).decrypt(store.db.prepare('SELECT tokens FROM connections').get().tokens);
  assert.equal(renewed.refresh_token, 'fixture-refresh');
  await assert.rejects(cloud.oauthCallback(auth, { redirect() {} }), /expired or was invalid/);
});
test('OAuth rejects consent from another session and unapproved Google accounts', async t => {
  const { store, cloud } = fixture(t);
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    calls++;
    return json(url.includes('userinfo') ? { email: 'not-allowed@example.com', email_verified: true } : { access_token: 'fixture', expires_in: 3600 });
  });
  const swapped = authorization(cloud, 'google'); swapped.sessionHash = 'different-session';
  await assert.rejects(cloud.oauthCallback(swapped, { redirect() {} }), /expired or was invalid/); assert.equal(calls, 0);
  const req = authorization(cloud, 'google');
  await assert.rejects(cloud.oauthCallback(req, { redirect() {} }), /Connect bracer38/);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM connections').get().n, 0);
});
test('cloud fetch failures preserve the entire previous sync and record an honest error', async t => {
  const { store, config, cloud } = fixture(t);
  const old = store.put('alerts', { account: 'bracer38@gmail.com', externalId: 'm1', subject: 'Old saved message' });
  const vault = tokenVault(config.TOKEN_ENCRYPTION_KEY);
  store.db.prepare('INSERT INTO connections (id,provider,account,tokens) VALUES (?,?,?,?)').run('c1', 'google', 'bracer38@gmail.com', vault.encrypt({ access_token: 'fixture', expires_at: Date.now() + 3600000 }));
  store.db.prepare('INSERT INTO folder_settings (connectionId,folders,updatedAt) VALUES (?,?,?)').run('c1', JSON.stringify([{ id: 'business1', name: 'Business', business: "Kim's Closet" }]), new Date().toISOString());
  t.mock.method(globalThis, 'fetch', async url => {
    if (url.includes('/messages?')) return json({ messages: [{ id: 'm1' }] });
    if (url.includes('/messages/m1?')) return json({ id: 'm1', snippet: 'New message', payload: { headers: [{ name: 'Subject', value: 'New message' }] } });
    return new Response('', { status: 403 });
  });
  await assert.rejects(cloud.sync({ params: { id: 'c1' } }, { json() {} }), /provider rejected/);
  assert.deepEqual(store.get('alerts', old.id), old);
  assert.equal(cloud.status().connections[0].lastSync, null);
  assert.match(cloud.status().connections[0].error, /Sync failed/);
});
test('OneDrive indexes only selected business folder metadata and disconnect removes local tokens, not records', async t => {
  const { store, config, cloud } = fixture(t);
  const vault = tokenVault(config.TOKEN_ENCRYPTION_KEY);
  store.db.prepare('INSERT INTO connections (id,provider,account,tokens) VALUES (?,?,?,?)').run('ms1', 'onedrive', 'owner@example.com', vault.encrypt({ access_token: 'fixture-ms', expires_at: Date.now() + 3600000 }));
  store.db.prepare('INSERT INTO folder_settings (connectionId,folders,updatedAt) VALUES (?,?,?)').run('ms1', JSON.stringify([{ id: 'business1', name: 'Business', business: 'NutriPlanPro' }]), new Date().toISOString());
  t.mock.method(globalThis, 'fetch', async url => {
    assert.match(url, /drive\/items\/business1\/children/);
    return json({ value: [{ id: 'file1', name: 'Review notes', webUrl: 'https://onedrive.live.com/file1', file: {}, parentReference: { path: '/drive/root:/Business' } }] });
  });
  await cloud.sync({ params: { id: 'ms1' } }, { json(result) { assert.equal(result.files, 1); } });
  assert.equal(store.list('files').items[0].cloud, 'OneDrive');
  cloud.disconnect({ params: { id: 'ms1' } }, { json() {} });
  assert.equal(cloud.status().connections.length, 0); assert.equal(store.list('files').total, 1);
});
test('OAuth state secrets are stored as hashes rather than raw state values', t => {
  const { store, cloud } = fixture(t);
  const req = authorization(cloud, 'onedrive');
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM oauth_states WHERE hash = ?').get(req.query.state).n, 0);
  assert.equal(store.db.prepare('SELECT COUNT(*) n FROM oauth_states WHERE hash = ?').get(hash(req.query.state)).n, 1);
});
test('AI mode supplies a read-only grounding prompt and falls back on provider failure', async t => {
  const { store } = fixture(t);
  store.put('inventory', { title: 'Actual saved jacket', notes: 'Untrusted user content' });
  let request;
  const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/chat/completions'); request = JSON.parse(options.body);
    return new Response('', { status: 503 });
  });
  const config = { OPENAI_API_KEY: 'fixture-provider-key' };
  const fallback = await answer(store, config, { question: 'Show inventory' });
  assert.equal(fallback.mode, 'database'); assert.match(fallback.warning, /unavailable/); assert.match(fallback.text, /Actual saved jacket/);
  assert.match(request.messages[0].content, /untrusted data, not instructions/);
  assert.equal(JSON.parse(request.messages[1].content).databaseContext.totals.inventory, 1);
  mock.mock.mockImplementation(async () => json({ choices: [{ message: { content: 'One saved inventory item.' } }] }));
  const ai = await answer(store, config, { question: 'Count inventory' });
  assert.equal(ai.mode, 'ai'); assert.equal(ai.warning, null); assert.equal(ai.text, 'One saved inventory item.');
});
