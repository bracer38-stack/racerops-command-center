import { createHash } from 'node:crypto';
import { z } from 'zod';
import { HttpError } from './schema.mjs';

const folderSchema = z.array(z.object({ id: z.string().min(1).max(300), name: z.string().min(1).max(300), business: z.enum(["Kim's Closet", 'Over50FitLife', 'NutriPlanPro', 'App Studio']), ancestorIds: z.array(z.string().min(1).max(300)).max(100).default([]) }).strict()).max(20);
const googleBase = 'https://www.googleapis.com/drive/v3/files';
const graphBase = 'https://graph.microsoft.com/v1.0/me/drive';

export function selectedFolders(store, id) {
  const row = store.db.prepare('SELECT folders FROM folder_settings WHERE connectionId = ?').get(id);
  return row ? folderSchema.parse(JSON.parse(row.folders)) : [];
}

export function folderService(store, { enabled, accessToken, inFlight }) {
  function connection(id) {
    const record = store.db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
    if (!record) throw new HttpError(404, 'Connection not found.');
    return record;
  }
  async function providerGet(record, url) {
    if (!enabled(record.provider)) throw new HttpError(503, 'Cloud OAuth is not configured.');
    const target = new URL(url);
    const base = record.provider === 'google' ? googleBase : graphBase;
    if (target.origin !== new URL(base).origin || (record.provider === 'google' ? target.pathname !== '/drive/v3/files' && !target.pathname.startsWith('/drive/v3/files/') : !target.pathname.startsWith('/v1.0/me/drive/'))) {
      throw new HttpError(502, 'Unexpected cloud response URL.');
    }
    const token = await accessToken(record);
    const response = await fetch(target.href, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new HttpError(502, 'Cloud provider rejected the folder request.');
    return response.json();
  }
  async function candidates(req, res) {
    const record = connection(req.params.id);
    const parent = z.object({ parent: z.string().min(1).max(300).optional() }).parse(req.query).parent;
    const folders = [];
    if (record.provider === 'google') {
      if (parent) throw new HttpError(400, 'Google folder search includes all accessible folders.');
      let pageToken;
      for (let page = 0; page < 5; page++) {
        const url = new URL(googleBase);
        url.search = new URLSearchParams({ q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false", fields: 'nextPageToken,files(id,name,parents)', pageSize: '1000', ...(pageToken ? { pageToken } : {}) }).toString();
        const result = await providerGet(record, url.href);
        for (const f of result.files || []) folders.push({ id: f.id, name: f.name, path: f.parents?.join(', ') || 'My Drive' });
        pageToken = result.nextPageToken;
        if (!pageToken) break;
      }
    } else {
      let url = `${graphBase}/${parent ? `items/${encodeURIComponent(parent)}` : 'root'}/children?$top=200&$select=id,name,folder,parentReference`;
      for (let page = 0; page < 5 && url; page++) {
        const result = await providerGet(record, url);
        for (const f of result.value || []) if (f.folder) folders.push({ id: f.id, name: f.name, path: f.parentReference?.path || '/' });
        url = result['@odata.nextLink'];
      }
    }
    res.json({ folders });
  }
  async function select(req, res) {
    const record = connection(req.params.id);
    if (inFlight.has(record.id)) throw new HttpError(409, 'Wait for the running sync or folder change.');
    inFlight.add(record.id);
    try {
      const requested = folderSchema.parse(req.body?.folders);
      if (new Set(requested.map(f => f.id)).size !== requested.length) throw new HttpError(400, 'Duplicate folder selections.');
      const folders = [], cache = new Map();
      const metadata = async id => {
        if (cache.has(id)) return cache.get(id);
        if (cache.size >= 100) throw new HttpError(422, 'Too many folder ancestors. Choose fewer or shallower business folders.');
        const url = record.provider === 'google' ? `${googleBase}/${encodeURIComponent(id)}?fields=id,name,mimeType,trashed,parents` : `${graphBase}/items/${encodeURIComponent(id)}?$select=id,name,folder,root,parentReference`;
        const result = await providerGet(record, url);
        cache.set(id, result); return result;
      };
      for (const folder of requested) {
        const result = await metadata(folder.id);
        if (folder.id === 'root' || result.id !== folder.id || (record.provider === 'google' ? result.trashed || result.mimeType !== 'application/vnd.google-apps.folder' : !result.folder || result.root)) throw new HttpError(400, 'Select a business folder, not the account root.');
        const parents = item => record.provider === 'google' ? item.parents || [] : item.parentReference?.id ? [item.parentReference.id] : [];
        const pending = [...parents(result)], ancestors = new Set();
        while (pending.length) {
          const id = pending.shift();
          if (id === folder.id || ancestors.has(id)) continue;
          ancestors.add(id);
          const parentItem = await metadata(id);
          pending.push(...parents(parentItem));
        }
        folders.push({ id: folder.id, name: String(result.name || folder.name).slice(0, 300), business: folder.business, ancestorIds: [...ancestors] });
      }
      store.db.prepare('INSERT INTO folder_settings (connectionId,folders,updatedAt) VALUES (?,?,?) ON CONFLICT(connectionId) DO UPDATE SET folders=excluded.folders, updatedAt=excluded.updatedAt')
        .run(record.id, JSON.stringify(folders), new Date().toISOString());
      res.json({ folders, syncedRecordsRetained: true });
    } finally { inFlight.delete(record.id); }
  }

  function deletionPlan(record, includeUnknown) {
    const selected = new Set(selectedFolders(store, record.id).map(f => f.id));
    const files = store.db.prepare('SELECT id, folder, folderId, folderPathIds, cloud FROM files WHERE account = ? AND source IN (?, ?)').all(record.account, 'Google Drive sync', 'OneDrive sync')
      .filter(f => f.cloud === (record.provider === 'google' ? 'Google Drive' : 'OneDrive'));
    const excluded = [], unknown = [];
    for (const file of files) {
      const oldGoogleParents = record.provider === 'google' && file.folder ? file.folder.split(/,\s*/).filter(Boolean) : [];
      const oldOneDriveRoot = record.provider === 'onedrive' && /^\/?(?:drive\/)?root:\/?$/i.test(file.folder || '');
      let pathIds = [];
      try { const parsed = JSON.parse(file.folderPathIds); if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) pathIds = parsed; } catch { /* Older metadata has no safe ancestry. */ }
      const ids = pathIds.length ? pathIds : file.folderId ? [file.folderId] : oldGoogleParents;
      if (ids.some(id => selected.has(id))) continue;
      if (pathIds.length || oldOneDriveRoot) excluded.push(file.id);
      else unknown.push(file.id);
    }
    const row = store.db.prepare('SELECT folders, updatedAt FROM folder_settings WHERE connectionId = ?').get(record.id);
    const revision = createHash('sha256').update(JSON.stringify([row, excluded, unknown])).digest('hex');
    return { excluded, unknown, revision, count: excluded.length + (includeUnknown ? unknown.length : 0) };
  }
  function preview(req, res) {
    const record = connection(req.params.id);
    const includeUnknown = req.query.includeUnknown === 'true';
    const plan = deletionPlan(record, includeUnknown);
    res.json({ excluded: plan.excluded.length, unknown: plan.unknown.length, count: plan.count, revision: plan.revision, includesUnknown: includeUnknown });
  }
  function prune(req, res) {
    const record = connection(req.params.id);
    if (inFlight.has(record.id)) throw new HttpError(409, 'Wait for the running sync or folder change.');
    if (req.get('X-Confirm-Excluded-Records') !== 'remove-excluded-records') throw new HttpError(400, 'Explicit removal confirmation required.');
    const input = z.object({ includeUnknown: z.boolean(), revision: z.string().length(64), expectedCount: z.number().int().min(0) }).strict().parse(req.body);
    const removed = store.db.transaction(() => {
      const plan = deletionPlan(record, input.includeUnknown);
      if (plan.revision !== input.revision || plan.count !== input.expectedCount) throw new HttpError(409, 'Selection or synced records changed. Preview removal again.');
      for (const id of [...plan.excluded, ...(input.includeUnknown ? plan.unknown : [])]) store.db.prepare('DELETE FROM files WHERE id = ?').run(id);
      return plan.count;
    })();
    res.json({ removed, providerFilesUntouched: true });
  }
  return { candidates, select, preview, prune };
}

export async function syncSelectedFiles(record, folders, get) {
  const roots = new Set(folders.map(f => f.id)), seen = new Set();
  const files = [], queue = folders.map(f => ({ id: f.id, name: f.name, business: f.business, pathIds: [f.id, ...(f.ancestorIds || [])] }));
  let visited = 0;
  while (queue.length && files.length < 200) {
    const folder = queue.shift();
    if (seen.has(folder.id)) continue;
    seen.add(folder.id);
    if (++visited > 100) throw new HttpError(422, 'More than 100 nested folders. Choose smaller business folders.');
    if (record.provider === 'google') {
      let pageToken;
      do {
        const url = new URL(googleBase);
        url.search = new URLSearchParams({ q: `'${folder.id.replaceAll("'", "\\'")}' in parents and trashed = false`, fields: 'nextPageToken,files(id,name,mimeType,webViewLink)', pageSize: '200', ...(pageToken ? { pageToken } : {}) }).toString();
        const result = await get(url.href);
        for (const f of result.files || []) {
          if (f.mimeType === 'application/vnd.google-apps.folder') { if (!roots.has(f.id)) queue.push({ ...folder, id: f.id, name: `${folder.name}/${f.name}`.slice(0, 1000), pathIds: [f.id, ...folder.pathIds] }); }
          else if (files.length < 200) files.push({ externalId: f.id, account: record.account, name: String(f.name).slice(0, 300), cloud: 'Google Drive', business: folder.business, folder: folder.name, folderId: folder.id, folderPathIds: JSON.stringify(folder.pathIds), status: 'Synced metadata', url: f.webViewLink || '', source: 'Google Drive sync' });
        }
        pageToken = result.nextPageToken;
      } while (pageToken && files.length < 200);
    } else {
      let url = `${graphBase}/items/${encodeURIComponent(folder.id)}/children?$top=200&$select=id,name,webUrl,parentReference,file,folder`;
      for (let page = 0; page < 5 && url && files.length < 200; page++) {
        const result = await get(url);
        for (const f of result.value || []) {
          if (f.folder) { if (!roots.has(f.id)) queue.push({ ...folder, id: f.id, name: `${folder.name}/${f.name}`.slice(0, 1000), pathIds: [f.id, ...folder.pathIds] }); }
          else if (f.file && files.length < 200) files.push({ externalId: f.id, account: record.account, name: String(f.name).slice(0, 300), cloud: 'OneDrive', business: folder.business, folder: folder.name, folderId: folder.id, folderPathIds: JSON.stringify(folder.pathIds), status: 'Synced metadata', url: f.webUrl || '', source: 'OneDrive sync' });
        }
        url = result['@odata.nextLink'];
        if (url && (new URL(url).origin !== 'https://graph.microsoft.com' || !new URL(url).pathname.startsWith('/v1.0/me/drive/'))) throw new HttpError(502, 'Unexpected cloud response URL.');
      }
    }
  }
  return files;
}
