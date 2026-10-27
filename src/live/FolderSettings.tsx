import { useState } from 'react';
import { api } from './api';
import { businesses } from './RecordEditor';
import type { Business, Connection, SelectedFolder, FolderCandidate } from './types';

type PrunePreview = { excluded: number; unknown: number; count: number; revision: string; includesUnknown: boolean };

export function FolderSettings({ connection, disabled, refreshed }: { connection: Connection & { folders: SelectedFolder[] }; disabled: boolean; refreshed: () => Promise<void> }) {
  const [open, setOpen] = useState(false), [folders, setFolders] = useState<SelectedFolder[]>(connection.folders);
  const [candidates, setCandidates] = useState<FolderCandidate[]>([]), [parent, setParent] = useState<{ id: string; name: string }[]>([]);
  const [assignment, setAssignment] = useState<Record<string, Business | ''>>({});
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [includeUnknown, setIncludeUnknown] = useState(false), [preview, setPreview] = useState<PrunePreview | null>(null);

  async function run(action: () => Promise<void>) {
    setError(''); setNotice(''); setLoading(true);
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Folder request failed.'); }
    finally { setLoading(false); }
  }
  async function browse(next: { id: string; name: string }[] = parent) {
    const result = await api<{ folders: FolderCandidate[] }>(`/connectors/${connection.id}/folders${next.length ? `?parent=${encodeURIComponent(next.at(-1)!.id)}` : ''}`);
    setParent(next); setCandidates(result.folders);
    if (!result.folders.length) setNotice('No folders found in this location. Try another parent folder.');
  }
  async function save() {
    const result = await api<{ folders: SelectedFolder[] }>(`/connectors/${connection.id}/folders`, { method: 'PUT', body: JSON.stringify({ folders }) });
    setFolders(result.folders); setPreview(null); await refreshed();
    setNotice('Folder selection saved. Sync now indexes only these business folders. Existing records remain until you explicitly remove them.');
  }
  async function dryRun(includingUnknown = includeUnknown) {
    const result = await api<PrunePreview>(`/connectors/${connection.id}/prune-preview?includeUnknown=${includingUnknown}`);
    setIncludeUnknown(includingUnknown); setPreview(result);
  }
  async function removeExcluded() {
    if (!preview?.count || !window.confirm(`Remove ${preview.count} saved cloud-file records from excluded folders${preview.includesUnknown ? ' including records with unknown folder metadata' : ''}? This does NOT delete files from Google Drive or OneDrive.`)) return;
    const result = await api<{ removed: number }>(`/connectors/${connection.id}/prune`, { method: 'POST', headers: { 'X-Confirm-Excluded-Records': 'remove-excluded-records' }, body: JSON.stringify({ includeUnknown: preview.includesUnknown, revision: preview.revision, expectedCount: preview.count }) });
    setPreview(null); await refreshed(); setNotice(`${result.removed} saved file records removed. Nothing was deleted from the cloud provider.`);
  }
  const changes = JSON.stringify(folders) !== JSON.stringify(connection.folders);
  return <div className="hub-folder-settings">
    <button className="hub-button" aria-expanded={open} onClick={() => { setOpen(!open); setFolders(connection.folders); setPreview(null); }}>Choose business folders ({connection.folders.length})</button>
    {open && <div className="hub-folder-content">
      <p>Only folders you select and assign to a business will sync; files inside their subfolders are included. Your cloud files are never deleted by RacerOps.</p>
      {folders.length ? <ul className="hub-folder-selected">{folders.map(folder => <li key={folder.id}><span>{folder.name} · {folder.business}</span><button type="button" disabled={loading || disabled} onClick={() => { setFolders(folders.filter(f => f.id !== folder.id)); setPreview(null); }}>Exclude</button></li>)}</ul> : <p>No folders selected. Sync will not index cloud files until you choose a business folder.</p>}
      <div className="hub-folder-actions"><button className="hub-button hub-primary" disabled={!changes || loading || disabled} onClick={() => void run(save)}>Save selected folders</button><button className="hub-button" disabled={loading || disabled} onClick={() => void run(() => browse([]))}>Browse {connection.provider === 'google' ? 'Drive' : 'OneDrive'} folders</button></div>
      {parent.length > 0 && <button className="hub-button" onClick={() => void run(() => browse(parent.slice(0, -1)))} disabled={loading || disabled}>Back to {parent.length > 1 ? parent.at(-2)!.name : 'root'}</button>}
      {candidates.length > 0 && <div className="hub-folder-candidates"><h4>Available folders {parent.length ? `in ${parent.at(-1)!.name}` : ''}</h4>{candidates.map(candidate => <div key={candidate.id} className="hub-folder-candidate"><span title={candidate.path}>{candidate.name}</span><select aria-label={`Business for ${candidate.name}`} value={assignment[candidate.id] || ''} onChange={e => setAssignment({ ...assignment, [candidate.id]: e.target.value as Business })}><option value="">Assign business…</option>{businesses.filter(b => b !== 'Dual Business').map(b => <option key={b}>{b}</option>)}</select><button disabled={!assignment[candidate.id] || folders.some(f => f.id === candidate.id) || disabled} onClick={() => { setFolders([...folders, { id: candidate.id, name: candidate.name, business: assignment[candidate.id] as SelectedFolder['business'] }]); setPreview(null); }}>Select</button>{connection.provider === 'onedrive' && <button onClick={() => void run(() => browse([...parent, { id: candidate.id, name: candidate.name }]))} disabled={loading || disabled}>Open</button>}</div>)}</div>}
      <div className="hub-prune-panel"><h4>Remove saved records from excluded folders</h4><p>Saving a selection never deletes records. Preview the count, then confirm removal. Provider files are untouched.</p><button className="hub-button" disabled={changes || loading || disabled} onClick={() => void run(() => dryRun())}>Preview removal</button>
        {preview && <div className="hub-prune-preview" role="status"><p>{preview.excluded} records from excluded folders. {preview.unknown} older records have unknown folder metadata.</p><label><input type="checkbox" checked={includeUnknown} onChange={e => void run(() => dryRun(e.target.checked))} disabled={loading || disabled}/>Also remove older records with unknown folder metadata</label><p>{preview.count} records would be removed from RacerOps; no cloud files will be deleted.</p><button className="hub-button hub-danger" disabled={!preview.count || loading || disabled} onClick={() => void run(removeExcluded)}>Remove {preview.count} saved records…</button></div>}
      </div>
      {notice && <p role="status">{notice}</p>}{error && <p className="hub-error" role="alert">{error}</p>}
    </div>}
  </div>;
}
