import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import { hash, tokenVault } from './auth.mjs';
import { HttpError } from './schema.mjs';
import { classifyAlert, decodeText } from '../shared/operations.mjs';
import { folderService, selectedFolders, syncSelectedFiles } from './folders.mjs';

const allowedGoogleAccounts = ['bracer38@gmail.com', 'robert@over50fitlife.com'];
const tokenEndpoints = {
  google: 'https://oauth2.googleapis.com/token',
  onedrive: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};
const scopes = {
  google: 'openid email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
  onedrive: 'offline_access User.Read Files.Read',
};

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new HttpError(502, 'Cloud provider rejected the request. Check consent and reconnect if needed.');
  return response.json();
}

export function connectors(store, config) {
  const vault = config.TOKEN_ENCRYPTION_KEY ? tokenVault(config.TOKEN_ENCRYPTION_KEY) : null;
  const inFlight = new Set();
  function credentials(provider) {
    return provider === 'google'
      ? { client_id: config.GOOGLE_CLIENT_ID, client_secret: config.GOOGLE_CLIENT_SECRET }
      : { client_id: config.MICROSOFT_CLIENT_ID, client_secret: config.MICROSOFT_CLIENT_SECRET };
  }
  function enabled(provider) {
    const c = credentials(provider);
    return Boolean(vault && config.appUrl && c.client_id && c.client_secret);
  }
  function callback(provider) { return `${config.appUrl}/api/connectors/${provider}/callback`; }
  function status() {
    return {
      googleConfigured: enabled('google'), onedriveConfigured: enabled('onedrive'),
      webhookConfigured: Boolean(config.WEBHOOK_SECRET), aiConfigured: Boolean(config.OPENAI_API_KEY),
      connections: store.db.prepare('SELECT id, provider, account, lastSync, error FROM connections ORDER BY account').all().map(connection => ({ ...connection, folders: selectedFolders(store, connection.id) })),
      syncScope: 'Each sync reads the newest 25 Gmail messages from the past 30 days and up to 200 files within explicitly selected business folders per cloud account. No personal root-folder sync, background sync, or provider file writes.',
    };
  }
  function authorize(req, res) {
    const provider = z.enum(['google', 'onedrive']).parse(req.params.provider);
    if (!enabled(provider)) throw new HttpError(503, 'Configure this provider’s OAuth credentials, APP_URL, and TOKEN_ENCRYPTION_KEY on the server first.');
    const state = randomBytes(32).toString('base64url'), verifier = randomBytes(32).toString('base64url');
    store.db.prepare('DELETE FROM oauth_states WHERE expiresAt < ?').run(Date.now());
    store.db.prepare('INSERT INTO oauth_states VALUES (?, ?, ?, ?, ?)').run(hash(state), provider, req.sessionHash, verifier, Date.now() + 10 * 60000);
    const authUrl = new URL(provider === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    const params = { client_id: credentials(provider).client_id, redirect_uri: callback(provider), response_type: 'code', scope: scopes[provider], state, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256', prompt: 'consent' };
    if (provider === 'google') params.access_type = 'offline';
    authUrl.search = new URLSearchParams(params).toString();
    res.redirect(authUrl.href);
  }
  async function oauthCallback(req, res) {
    const provider = z.enum(['google', 'onedrive']).parse(req.params.provider);
    const { state, code } = z.object({ state: z.string().min(1).max(200), code: z.string().min(1).max(3000) }).parse(req.query);
    const record = store.db.prepare('SELECT * FROM oauth_states WHERE hash = ?').get(hash(state));
    store.db.prepare('DELETE FROM oauth_states WHERE hash = ?').run(hash(state));
    if (!enabled(provider) || !record || record.provider !== provider || record.sessionHash !== req.sessionHash || record.expiresAt < Date.now()) throw new HttpError(400, 'OAuth consent expired or was invalid. Try connecting again.');
    const tokens = await jsonFetch(tokenEndpoints[provider], { method: 'POST', body: new URLSearchParams({ ...credentials(provider), code, code_verifier: record.verifier, redirect_uri: callback(provider), grant_type: 'authorization_code' }) });
    const profile = await jsonFetch(provider === 'google' ? 'https://openidconnect.googleapis.com/v1/userinfo' : 'https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const account = String(provider === 'google' ? profile.email : (profile.mail || profile.userPrincipalName)).toLowerCase();
    if (provider === 'google' && (!profile.email_verified || !allowedGoogleAccounts.includes(account))) throw new HttpError(403, 'Connect bracer38@gmail.com or robert@over50fitlife.com.');
    const previous = store.db.prepare('SELECT * FROM connections WHERE provider = ? AND account = ?').get(provider, account);
    if (!tokens.refresh_token && previous) tokens.refresh_token = vault.decrypt(previous.tokens).refresh_token;
    tokens.expires_at = Date.now() + tokens.expires_in * 1000;
    store.db.prepare('INSERT INTO connections (id, provider, account, tokens) VALUES (?, ?, ?, ?) ON CONFLICT(provider, account) DO UPDATE SET tokens = excluded.tokens, error = NULL').run(previous?.id || randomUUID(), provider, account, vault.encrypt(tokens));
    res.redirect('/?connected=1');
  }
  async function accessToken(connection) {
    let tokens = vault.decrypt(connection.tokens);
    if (tokens.expires_at < Date.now() + 60000) {
      if (!tokens.refresh_token) throw new HttpError(409, 'Consent expired. Reconnect the account.');
      const refreshed = await jsonFetch(tokenEndpoints[connection.provider], { method: 'POST', body: new URLSearchParams({ ...credentials(connection.provider), grant_type: 'refresh_token', refresh_token: tokens.refresh_token }) });
      tokens = { ...tokens, ...refreshed, expires_at: Date.now() + refreshed.expires_in * 1000 };
      store.db.prepare('UPDATE connections SET tokens = ? WHERE id = ?').run(vault.encrypt(tokens), connection.id);
    }
    return tokens.access_token;
  }
  async function sync(req, res) {
    const connection = store.db.prepare('SELECT * FROM connections WHERE id = ?').get(req.params.id);
    if (!connection) throw new HttpError(404, 'Connection not found.');
    if (!enabled(connection.provider)) throw new HttpError(503, 'Server OAuth configuration is missing.');
    if (inFlight.has(connection.id)) throw new HttpError(409, 'Sync is already running for this account.');
    inFlight.add(connection.id);
    try {
      const token = await accessToken(connection);
      const get = url => jsonFetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const alerts = [], files = [];
      if (connection.provider === 'google') {
        const messageList = await get('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=newer_than%3A30d');
        for (let i = 0; i < (messageList.messages || []).length; i += 5) {
          const messages = await Promise.all(messageList.messages.slice(i, i + 5).map(m => get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(m.id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date&metadataHeaders=List-Unsubscribe`)));
          for (const m of messages) {
            const header = key => m.payload?.headers?.find(h => h.name.toLowerCase() === key)?.value || '';
            const old = store.db.prepare('SELECT id FROM alerts WHERE account = ? AND externalId = ?').get(connection.account, m.id);
            const previous = old ? store.get('alerts', old.id) : null;
            const raw = { externalId: m.id, account: connection.account, subject: decodeText(header('subject')).slice(0, 300) || '(No subject)', from: decodeText(header('from')).slice(0, 1000), date: header('date').slice(0, 1000), summary: decodeText(m.snippet || ''), business: 'Dual Business', priority: 'Low', actionRequired: false, mailLabels: (m.labelIds || []).join(' ').slice(0, 2000), listUnsubscribe: Boolean(header('list-unsubscribe')), classificationOverride: Boolean(previous?.classificationOverride), source: 'Gmail sync', url: `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(connection.account)}#all/${m.id}` };
            const { promotional: _promotional, ...classified } = classifyAlert(raw);
            alerts.push(previous?.classificationOverride ? { ...classified, business: previous.business, priority: previous.priority, actionRequired: previous.actionRequired } : classified);
          }
        }
      }
      files.push(...await syncSelectedFiles(connection, selectedFolders(store, connection.id), get));
      store.db.transaction(() => {
        for (const alert of alerts) {
          const old = store.db.prepare('SELECT id FROM alerts WHERE account = ? AND externalId = ?').get(alert.account, alert.externalId);
          store.put('alerts', alert, old?.id || randomUUID());
        }
        for (const file of files) {
          const old = store.db.prepare('SELECT id FROM files WHERE cloud = ? AND account = ? AND externalId = ?').get(file.cloud, file.account, file.externalId);
          store.put('files', file, old?.id || randomUUID());
        }
        store.db.prepare('UPDATE connections SET lastSync = ?, error = NULL WHERE id = ?').run(new Date().toISOString(), connection.id);
      })();
      res.json({ alerts: alerts.length, files: files.length });
    } catch (error) {
      store.db.prepare('UPDATE connections SET error = ? WHERE id = ?').run('Sync failed. Check permissions and reconnect if necessary.', connection.id);
      throw error;
    } finally { inFlight.delete(connection.id); }
  }
  function disconnect(req, res) {
    if (inFlight.has(req.params.id)) throw new HttpError(409, 'Wait for the running sync before disconnecting.');
    store.db.prepare('DELETE FROM connections WHERE id = ?').run(req.params.id);
    res.json({ disconnected: true });
  }
  return { status, authorize, oauthCallback, sync, disconnect, folders: folderService(store, { enabled, accessToken, inFlight }) };
}
