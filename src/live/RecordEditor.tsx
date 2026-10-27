import { useState, useEffect, useRef, type FormEvent } from 'react';
import { X, Save } from 'lucide-react';
import { api } from './api';
import type { Resource } from './types';

export const businesses = ["Kim's Closet", 'Over50FitLife', 'NutriPlanPro', 'App Studio', 'Dual Business'];
type Field = { key: string; label: string; required?: boolean; type?: 'number' | 'textarea' | 'url' | 'email'; options?: string[] };
const fields: Record<Exclude<Resource, 'todos'>, Field[]> = {
  inventory: [
    { key: 'title', label: 'Item title', required: true }, { key: 'sku', label: 'SKU (unique, optional)' },
    { key: 'brand', label: 'Brand' }, { key: 'size', label: 'Size' }, { key: 'color', label: 'Color' },
    { key: 'price', label: 'Listing price ($)', type: 'number' },
    { key: 'imageUrl', label: 'Photo URL (HTTPS)', type: 'url' },
    { key: 'status', label: 'Status', options: ['Needs Review', 'Needs Measurements', 'Ready for Vendoo', 'Listed on Vendoo', 'Sold'] },
    { key: 'season', label: 'Season', options: ['All-Season', 'Spring/Summer', 'Fall/Winter'] },
    { key: 'platforms', label: 'Platforms' }, { key: 'sourceBatch', label: 'Source batch' }, { key: 'notes', label: 'Notes & measurements', type: 'textarea' },
  ],
  alerts: [
    { key: 'account', label: 'Gmail account', options: ['bracer38@gmail.com', 'robert@over50fitlife.com'] },
    { key: 'subject', label: 'Subject', required: true }, { key: 'from', label: 'From' },
    { key: 'date', label: 'Original message date' }, { key: 'priority', label: 'Priority', options: ['High', 'Medium', 'Low'] },
    { key: 'summary', label: 'Summary', type: 'textarea' }, { key: 'url', label: 'Message link (HTTPS)', type: 'url' },
  ],
  files: [
    { key: 'name', label: 'File name', required: true }, { key: 'cloud', label: 'Cloud', options: ['Manual', 'Google Drive', 'OneDrive'] },
    { key: 'account', label: 'Account' }, { key: 'folder', label: 'Folder' }, { key: 'status', label: 'Status' }, { key: 'url', label: 'File link (HTTPS)', type: 'url' },
  ],
  apps: [
    { key: 'name', label: 'Application name', required: true }, { key: 'version', label: 'Version / build' },
    { key: 'platform', label: 'Platform' }, { key: 'status', label: 'Status' }, { key: 'url', label: 'App URL (HTTPS)', type: 'url' },
  ],
  notifications: [{ key: 'title', label: 'Title', required: true }, { key: 'message', label: 'Message', type: 'textarea' }],
};
const names = { inventory: 'inventory item', alerts: 'alert', files: 'cloud file', apps: 'application', notifications: 'notification' };

export function RecordEditor({ resource, record, close, saved }: { resource: Exclude<Resource, 'todos'>; record?: Record<string, unknown>; close: () => void; saved: () => Promise<void> }) {
  const [form, setForm] = useState<Record<string, string>>(() => Object.fromEntries([
    ...fields[resource].map(f => [f.key, record?.[f.key] === null ? '' : String(record?.[f.key] ?? f.options?.[0] ?? '')]),
    ['business', String(record?.business ?? (resource === 'apps' ? 'App Studio' : "Kim's Closet"))],
  ]));
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const modal = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const data: Record<string, unknown> = { ...form };
      if (resource === 'inventory') data.price = form.price === '' ? null : Number(form.price);
      await api(`/${resource}${record ? `/${record.id}` : ''}`, { method: record ? 'PATCH' : 'POST', body: JSON.stringify(data) });
      await saved(); close();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }
  return <div className="hub-modal-backdrop" onClick={busy ? undefined : close}>
    <section ref={modal} className="hub-modal" role="dialog" aria-modal="true" aria-labelledby="editor-heading" onClick={e => e.stopPropagation()} onKeyDown={e => {
      if (e.key === 'Escape' && !busy) close();
      if (e.key === 'Tab') {
        const nodes = [...(modal.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea') || [])];
        const target = e.shiftKey ? nodes.at(-1) : nodes[0];
        if (document.activeElement === (e.shiftKey ? nodes[0] : nodes.at(-1))) { e.preventDefault(); target?.focus(); }
      }
    }}>
      <header><div><span className="hub-eyebrow">PERSISTENT WORKSPACE</span><h2 id="editor-heading">{record ? 'Edit' : 'Add'} {names[resource]}</h2></div><button type="button" className="hub-icon" onClick={close} disabled={busy} aria-label="Close editor"><X size={19}/></button></header>
      <form onSubmit={submit}>
        <div className="hub-form-grid">
          {[...fields[resource], { key: 'business', label: 'Business', options: businesses }].map(field => <label key={field.key} className={field.type === 'textarea' ? 'hub-wide' : ''}>
            <span>{field.label}</span>
            {field.options ? <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}>
              {!field.options.includes(form[field.key]) && <option value={form[field.key]}>{form[field.key]}</option>}
              {field.options.map(v => <option key={v}>{v}</option>)}
            </select> : field.type === 'textarea' ? <textarea rows={4} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} /> : <input autoFocus={field.required} type={field.type || 'text'} required={field.required} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? '0.01' : undefined} maxLength={field.type === 'number' ? undefined : field.type === 'url' ? 2000 : 1000} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} />}
          </label>)}
        </div>
        {error && <p className="hub-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={close} disabled={busy} className="hub-button">Cancel</button><button className="hub-button hub-primary" disabled={busy}><Save size={15}/>{busy ? 'Saving…' : 'Save to workspace'}</button></footer>
      </form>
    </section>
  </div>;
}
