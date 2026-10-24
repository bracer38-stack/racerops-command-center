import { createHash, randomBytes, scryptSync, timingSafeEqual, createCipheriv, createDecipheriv } from 'node:crypto';
import { HttpError } from './schema.mjs';

export const hash = value => createHash('sha256').update(value).digest('hex');
export function configure(env) {
  if (!env.HUB_PASSWORD || env.HUB_PASSWORD.length < 16) throw new Error('Set HUB_PASSWORD to a unique password of at least 16 characters.');
  const production = env.NODE_ENV === 'production';
  const appUrl = env.APP_URL || env.RENDER_EXTERNAL_URL || '';
  if (production && (!appUrl || new URL(appUrl).protocol !== 'https:')) throw new Error('Production requires an HTTPS APP_URL.');
  if (env.WEBHOOK_SECRET && env.WEBHOOK_SECRET.length < 32) throw new Error('WEBHOOK_SECRET must be at least 32 characters.');
  if (env.TOKEN_ENCRYPTION_KEY && Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'base64').length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  return { ...env, production, appUrl: appUrl ? new URL(appUrl).origin : '', trustProxy: Number(env.TRUST_PROXY || 0) };
}

export function authMiddleware(store, config) {
  const salt = randomBytes(32);
  const expected = scryptSync(config.HUB_PASSWORD, salt, 64);
  const credential = hash(config.HUB_PASSWORD);
  function cookie(req) {
    return req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('racerops_session='))?.slice(17) || '';
  }
  function authenticate(req, res, next) {
    const sessionHash = hash(cookie(req));
    const row = store.db.prepare('SELECT * FROM sessions WHERE hash = ? AND expiresAt > ? AND credential = ?').get(sessionHash, Date.now(), credential);
    if (!row) return res.status(401).json({ error: 'Sign in to your command hub.' });
    req.sessionHash = sessionHash;
    next();
  }
  function sameOrigin(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const expectedOrigin = config.appUrl || `${req.protocol}://${req.get('host')}`;
    if (req.headers.origin !== expectedOrigin || req.headers['sec-fetch-site'] === 'cross-site') {
      return res.status(403).json({ error: 'Requests must come from this hub. Use the signed n8n endpoint for automation.' });
    }
    next();
  }
  function login(req, res) {
    const input = req.body?.password;
    if (typeof input !== 'string' || input.length > 500 || !timingSafeEqual(scryptSync(input, salt, 64), expected)) throw new HttpError(401, 'Incorrect hub password.');
    const token = randomBytes(32).toString('base64url');
    store.db.prepare('DELETE FROM sessions WHERE expiresAt <= ? OR credential <> ?').run(Date.now(), credential);
    store.db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(hash(token), Date.now() + 7 * 86400000, credential);
    res.cookie('racerops_session', token, { httpOnly: true, secure: config.production, sameSite: 'lax', path: '/', maxAge: 7 * 86400000 });
    res.json({ authenticated: true });
  }
  function logout(req, res) {
    store.db.prepare('DELETE FROM sessions WHERE hash = ?').run(req.sessionHash);
    res.clearCookie('racerops_session', { httpOnly: true, secure: config.production, sameSite: 'lax', path: '/' });
    res.json({ authenticated: false });
  }
  return { authenticate, sameOrigin, login, logout };
}

export function tokenVault(key) {
  const bytes = Buffer.from(key, 'base64');
  return {
    encrypt(tokens) {
      const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', bytes, iv);
      const data = Buffer.concat([cipher.update(JSON.stringify(tokens), 'utf8'), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
    },
    decrypt(value) {
      const bytesIn = Buffer.from(value, 'base64');
      const decipher = createDecipheriv('aes-256-gcm', bytes, bytesIn.subarray(0, 12));
      decipher.setAuthTag(bytesIn.subarray(12, 28));
      return JSON.parse(Buffer.concat([decipher.update(bytesIn.subarray(28)), decipher.final()]).toString('utf8'));
    },
  };
}
