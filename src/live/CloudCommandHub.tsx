import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Cloud, Search, Mail, ShoppingBag, FolderOpen, Smartphone, Link2, Sparkles, ArrowUpRight, Plus, Upload, Download, RefreshCw, LogOut, Send, Trash2, Pencil, Check, X, Bell, ShieldCheck, Database, ChevronRight, LayoutDashboard, Menu, CircleHelp } from 'lucide-react';
import { api, ApiError, downloadJSON } from './api';
import { RecordEditor, businesses } from './RecordEditor';
import { InventoryPhoto } from './InventoryPhoto';
import { N8nSetup } from './N8nSetup';
import { ThemeToggle } from './ThemeToggle';
import { useHubTheme } from './theme';
import type { Snapshot, ConnectorStatus, Resource, ChatMessage, Citation, CsvPreview, Inventory } from './types';
import './hub.css';
import './theme.css';

type Tab = 'morning' | 'inventory' | 'files' | 'apps' | 'connectors';
const tabs = [
  { id: 'morning' as Tab, label: 'Morning brief', icon: LayoutDashboard },
  { id: 'inventory' as Tab, label: "Kim’s Closet", icon: ShoppingBag },
  { id: 'files' as Tab, label: 'Cloud files', icon: FolderOpen },
  { id: 'apps' as Tab, label: 'App tracker', icon: Smartphone },
  { id: 'connectors' as Tab, label: 'Connections', icon: Link2 },
];
const tabForResource: Record<Resource, Tab> = { inventory: 'inventory', alerts: 'morning', files: 'files', apps: 'apps', todos: 'apps', notifications: 'morning' };
const freshChat: ChatMessage[] = [{ role: 'assistant', text: 'Your workspace, in one place. Ask about saved inventory, Gmail alerts, cloud files, or open to-dos. I only use records in this database; no mail or cloud account is connected until you authorize it.' }];
const date = (value?: string | null) => value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not yet synced';
const money = (value: number | null) => value === null ? 'Not priced' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function Empty({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="hub-empty"><div className="hub-empty-icon"><Database size={22}/></div><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

export default function CloudCommandHub() {
  const { theme, toggleTheme } = useHubTheme();
  const [auth, setAuth] = useState<'loading' | 'login' | 'ready'>('loading');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null), [connections, setConnections] = useState<ConnectorStatus | null>(null);
  const [tab, setTab] = useState<Tab>('morning'), [search, setSearch] = useState(''), [business, setBusiness] = useState('ALL');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [offline, setOffline] = useState(!navigator.onLine);
  const [password, setPassword] = useState(''), [inventoryFilter, setInventoryFilter] = useState('ALL');
  const [editor, setEditor] = useState<{ resource: Exclude<Resource, 'todos'>; record?: Record<string, unknown> } | null>(null);
  const [csv, setCsv] = useState<{ csv: string; filename: string; preview: CsvPreview } | null>(null), [importMode, setImportMode] = useState('skip');
  const [chat, setChat] = useState<ChatMessage[]>(freshChat), [question, setQuestion] = useState(''), [thinking, setThinking] = useState(false);
  const [todoText, setTodoText] = useState<Record<string, string>>({});
  const [installPrompt, setInstallPrompt] = useState<(Event & { prompt: () => Promise<void> }) | null>(null);
  const [installHelp, setInstallHelp] = useState(false), [navOpen, setNavOpen] = useState(false);
  const csvInput = useRef<HTMLInputElement>(null), restoreInput = useRef<HTMLInputElement>(null), chatEnd = useRef<HTMLDivElement>(null);
  const sessionVersion = useRef(0);
  const clearSession = useCallback(() => {
    sessionVersion.current++; setAuth('login'); setSnapshot(null); setConnections(null); setChat(freshChat); setCsv(null); setEditor(null); setQuestion(''); setPassword('');
  }, []);

  const load = useCallback(async () => {
    const version = sessionVersion.current;
    try {
      const [records, status] = await Promise.all([api<Snapshot>('/backup'), api<ConnectorStatus>('/connectors')]);
      if (version !== sessionVersion.current) return;
      setSnapshot(records); setConnections(status); setAuth('ready');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) clearSession();
      else throw e;
    }
  }, [clearSession]);

  useEffect(() => { load().catch(e => { setError(e.message); setAuth('login'); }); }, [load]);
  useEffect(() => {
    const online = () => setOffline(!navigator.onLine);
    const install = (e: Event) => { e.preventDefault(); setInstallPrompt(e as Event & { prompt: () => Promise<void> }); };
    window.addEventListener('online', online); window.addEventListener('offline', online); window.addEventListener('beforeinstallprompt', install);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', online); window.removeEventListener('beforeinstallprompt', install); };
  }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [chat, thinking]);
  useEffect(() => {
    if (auth !== 'ready' || offline) return;
    const timer = window.setInterval(() => { if (!document.hidden) load().catch(() => { setError('Workspace refresh failed. Your last loaded records are still displayed.'); }); }, 60000);
    return () => clearInterval(timer);
  }, [auth, offline, load]);
  useEffect(() => {
    if (new URLSearchParams(location.search).has('connected')) {
      setNotice('Account authorized. Open Connections and sync to load records.'); history.replaceState({}, '', '/');
    }
  }, []);

  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); }
    catch (e) { if (e instanceof ApiError && e.status === 401) clearSession(); setError(e instanceof Error ? e.message : 'Request failed.'); }
    finally { setBusy(false); }
  }
  async function login(e: FormEvent) { e.preventDefault(); await perform(async () => { await api('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }); setPassword(''); await load(); }); }
  async function mutate(resource: Resource, id: string, data?: unknown) {
    await api(`/${resource}/${id}`, { method: data === undefined ? 'DELETE' : 'PATCH', ...(data === undefined ? {} : { body: JSON.stringify(data) }) }); await load();
  }
  function remove(resource: Resource, id: string) {
    if (confirm(resource === 'apps' ? 'Delete this app and all its to-dos? This cannot be undone.' : 'Delete this saved record? This cannot be undone.')) void perform(() => mutate(resource, id));
  }
  function edit(resource: Exclude<Resource, 'todos'>, record: object) { setEditor({ resource, record: record as Record<string, unknown> }); }
  const matches = (row: { business: string }) => (business === 'ALL' || row.business === business) && (!search || JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  const controls = (resource: Exclude<Resource, 'todos'>, row: { id: string }) => <div className="hub-row-actions"><button className="hub-icon" aria-label={`Edit ${resource} record`} onClick={() => edit(resource, row)} disabled={busy || offline}><Pencil size={15}/></button><button className="hub-icon hub-danger" aria-label={`Delete ${resource} record`} onClick={() => remove(resource, row.id)} disabled={busy || offline}><Trash2 size={15}/></button></div>;
  const openCitation = (citation: Citation) => { setTab(tabForResource[citation.table]); setSearch(citation.label); setBusiness('ALL'); setInventoryFilter('ALL'); };

  async function previewCSV(file: File) {
    await perform(async () => {
      setCsv(null);
      if (file.size > 5 * 1024 * 1024) throw new Error('CSV files must be 5 MB or smaller.');
      const text = await file.text();
      const preview = await api<CsvPreview>('/inventory/import/preview', { method: 'POST', body: JSON.stringify({ csv: text, filename: file.name }) });
      setCsv({ csv: text, filename: file.name, preview });
    });
  }
  async function commitCSV() {
    if (!csv) return;
    await perform(async () => {
      const result = await api<{ inserted: number; updated: number; skipped: number }>('/inventory/import', { method: 'POST', body: JSON.stringify({ csv: csv.csv, filename: csv.filename, mode: importMode }) });
      await load(); setNotice(`Import saved: ${result.inserted} added, ${result.updated} updated, ${result.skipped} existing SKUs skipped.`); setCsv(null);
    });
  }
  async function restore(file: File) {
    if (!confirm('Replace ALL inventory, alerts, cloud files, apps, to-dos, and notifications with this backup? Download a current backup first. Connections are not changed.')) return;
    await perform(async () => {
      if (file.size > 10 * 1024 * 1024) throw new Error('Backup must be 10 MB or smaller.');
      let data; try { data = JSON.parse(await file.text()); } catch { throw new Error('This file is not valid JSON.'); }
      await api('/backup/restore', { method: 'POST', headers: { 'X-Confirm-Restore': 'replace-business-data' }, body: JSON.stringify(data) });
      await load(); setNotice('Backup restored. Connections and login credentials were not changed.');
    });
  }
  async function ask(e: FormEvent) {
    e.preventDefault(); const prompt = question.trim(); if (!prompt || thinking) return;
    const version = sessionVersion.current;
    setQuestion(''); setThinking(true); setChat(prev => [...prev, { role: 'user', text: prompt }]);
    try {
      const reply = await api<{ text: string; mode: string; citations: Citation[]; warning: string | null }>('/assistant', { method: 'POST', body: JSON.stringify({ question: prompt }) });
      if (version === sessionVersion.current) setChat(prev => [...prev, { role: 'assistant', text: reply.text + (reply.warning ? `\n\n${reply.warning}` : ''), mode: reply.mode, citations: reply.citations }]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) clearSession();
      else if (version === sessionVersion.current) setChat(prev => [...prev, { role: 'assistant', text: e instanceof Error ? e.message : 'Assistant unavailable.' }]);
    } finally { setThinking(false); }
  }

  if (auth === 'loading') return <main className="hub-login" data-hub-theme={theme}><Cloud size={32}/><p>Opening your command hub…</p></main>;
  if (auth === 'login') return <main className="hub-login" data-hub-theme={theme}>
    <div className="hub-login-theme"><ThemeToggle theme={theme} toggle={toggleTheme}/></div>
    <form onSubmit={login} className="hub-login-card">
      <div className="hub-logo"><Cloud size={25}/></div><span className="hub-eyebrow">RACEROPS / PRIVATE WORKSPACE</span>
      <h1>Everything you run.<br/><em>One command hub.</em></h1><p>Sign in to your business workspace. Your inventory, alerts, and to-dos stay in a protected server database.</p>
      <label>Hub password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Your private workspace password"/></label>
      {error && <p className="hub-error" role="alert">{error}</p>}
      <button className="hub-button hub-primary" disabled={busy || offline}>{busy ? 'Signing in…' : offline ? 'You’re offline' : 'Open command hub'}<ArrowUpRight size={17}/></button>
      <small><ShieldCheck size={14}/>Owner-only access · No public business data</small>
    </form>
  </main>;
  if (!snapshot || !connections) return null;
  const pending = snapshot.inventory.filter(i => /need/i.test(i.status)).length;
  const openTodos = snapshot.todos.filter(t => !t.done).length;
  const inventory = snapshot.inventory.filter(matches).filter(i => inventoryFilter === 'ALL' || (inventoryFilter === 'REVIEW' ? /need/i.test(i.status) : /ready|listed|active/i.test(i.status)));
  const alerts = snapshot.alerts.filter(matches), files = snapshot.files.filter(matches), apps = snapshot.apps.filter(app => matches(app) || snapshot.todos.some(todo => todo.appId === app.id && matches(todo)));
  const connectionCount = connections.connections.length;
  const currentTab = tabs.find(t => t.id === tab)!;
  const totalFilters = Boolean(search || business !== 'ALL');

  return <div className="hub-shell" data-hub-theme={theme}>
    <header className="hub-topbar"><a className="hub-brand" href="/"><span className="hub-logo"><Cloud size={24}/></span><span>RacerOps<span className="hub-brand-sub">LIVE COMMAND HUB</span></span></a>
      <div className="hub-topbar-right"><span className={`hub-status ${offline ? 'hub-status-warn' : ''}`} title={offline ? 'Offline · read-only view' : 'Database connected'}><span/>{offline ? 'Offline · read-only view' : 'Database connected'}</span><ThemeToggle theme={theme} toggle={toggleTheme}/><button className="hub-icon" aria-label="Sign out" disabled={busy} onClick={() => void perform(async () => { await api('/auth/logout', { method: 'POST' }); clearSession(); })}><LogOut size={18}/></button></div>
    </header>
    <main className="hub-main">
      <section className="hub-intro"><div><span className="hub-eyebrow">YOUR BUSINESSES. IN FOCUS.</span><h1>Ready for your next move.</h1><p>Over50FitLife <span>/</span> Kim’s Closet Boutique <span>/</span> App Studio</p></div>
        <div className="hub-intro-actions"><button className="hub-button" onClick={() => { if (installPrompt) void installPrompt.prompt(); else setInstallHelp(!installHelp); }}><Smartphone size={16}/>Install app</button><button className="hub-button" disabled={busy || offline} onClick={() => void perform(async () => { downloadJSON(await api<Snapshot>('/backup')); setNotice('Backup downloaded. Keep it private; it includes your business data, not login or OAuth secrets.'); })}><Download size={16}/>Backup</button><button className="hub-button hub-icon-button" aria-label="Refresh workspace" disabled={busy || offline} onClick={() => void perform(load)}><RefreshCw size={16} className={busy ? 'hub-spin' : ''}/></button></div>
      </section>
      {installHelp && <div className="hub-banner"><Smartphone size={18}/><p>On your Samsung S24 Ultra: open the deployed HTTPS URL in Chrome, tap the three-dot menu, then <strong>Add to Home screen → Install</strong>. An internet connection is required for private workspace data.</p><button className="hub-icon" onClick={() => setInstallHelp(false)} aria-label="Dismiss install help"><X size={16}/></button></div>}
      {offline && <div className="hub-banner hub-warning"><CircleHelp size={18}/><p>You’re offline. Changes are disabled. Private data is not cached by the PWA; reconnect to reload the workspace.</p></div>}
      {error && <div className="hub-banner hub-error" role="alert"><p>{error}</p><button className="hub-icon" onClick={() => setError('')} aria-label="Dismiss error"><X size={16}/></button></div>}
      {notice && <div className="hub-banner" role="status"><Check size={18}/><p>{notice}</p><button className="hub-icon" onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={16}/></button></div>}
      <section className="hub-metrics" aria-label="Workspace totals">
        {[
          { label: 'Inventory queue', value: snapshot.inventory.length, sub: `${pending} need review`, icon: ShoppingBag, color: 'pink', action: 'inventory' as Tab },
          { label: 'Gmail alerts', value: snapshot.alerts.length, sub: `${snapshot.alerts.filter(a => a.actionRequired).length} flagged for action`, icon: Mail, color: 'cyan', action: 'morning' as Tab },
          { label: 'Open to-dos', value: openTodos, sub: `Across ${snapshot.apps.length} tracked apps`, icon: Smartphone, color: 'violet', action: 'apps' as Tab },
          { label: 'Cloud connections', value: connectionCount, sub: connectionCount ? 'Authorized · sync on demand' : 'Connect Google or OneDrive', icon: Cloud, color: 'green', action: 'connectors' as Tab },
        ].map(metric => <button key={metric.label} className={`hub-metric hub-accent-${metric.color}`} onClick={() => setTab(metric.action)}><div><span>{metric.label}</span><metric.icon size={18}/></div><strong>{metric.value.toLocaleString()}</strong><small>{metric.sub}<ChevronRight size={14}/></small></button>)}
      </section>
      <div className="hub-toolbar"><div className="hub-search"><Search size={17}/><input aria-label="Search workspace" maxLength={200} placeholder="Search inventory, alerts, files, and to-dos…" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button className="hub-icon" aria-label="Clear search" onClick={() => setSearch('')}><X size={14}/></button>}</div><select aria-label="Filter by business" value={business} onChange={e => setBusiness(e.target.value)}><option value="ALL">All businesses</option>{businesses.map(b => <option key={b}>{b}</option>)}</select></div>
      <button className="hub-mobile-nav hub-button" onClick={() => setNavOpen(!navOpen)}><Menu size={17}/>{currentTab.label}</button>
      <nav className={`hub-tabs ${navOpen ? 'hub-tabs-open' : ''}`} aria-label="Workspace navigation">{tabs.map(t => <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} onClick={() => { setTab(t.id); setNavOpen(false); }} className={tab === t.id ? 'hub-tab-active' : ''}><t.icon size={17}/>{t.label}{t.id === 'inventory' && <span>{snapshot.inventory.length}</span>}</button>)}</nav>
      <div className="hub-workspace">
        <div className="hub-content" aria-busy={busy}>
          {tab === 'morning' && <>
            <section className="hub-panel"><div className="hub-panel-heading"><div><span className="hub-eyebrow">THE SIGNAL, WITHOUT THE NOISE</span><h2><Mail size={20}/>Dual-Gmail action stream</h2><p>Saved alerts from both accounts. Starred Gmail messages are flagged on sync.</p></div><button className="hub-button" disabled={offline} onClick={() => setEditor({ resource: 'alerts' })}><Plus size={15}/>Add alert</button></div>
              <div className="hub-account-strip">{['bracer38@gmail.com', 'robert@over50fitlife.com'].map(account => <span key={account}><i className={connections.connections.some(c => c.account === account && c.provider === 'google') ? 'is-connected' : ''}/>{account}</span>)}</div>
              {alerts.length ? <div className="hub-records">{alerts.map(alert => <article key={alert.id} className="hub-record"><div className="hub-record-top"><span className="hub-tag">{alert.account}</span><span className={`hub-tag ${alert.actionRequired ? 'hub-tag-amber' : ''}`}>{alert.actionRequired ? 'Action flagged' : 'Saved alert'}</span>{controls('alerts', alert)}</div><h3>{alert.subject}</h3><p className="hub-record-body">{alert.summary || 'No summary provided.'}</p><div className="hub-record-foot"><span>{alert.business} · {alert.priority} · {alert.source}</span>{alert.url && <a href={alert.url} target="_blank" rel="noreferrer">Open message<ArrowUpRight size={13}/></a>}</div><div className="hub-record-foot"><small>{alert.date || date(alert.createdAt)}</small><button disabled={busy || offline} onClick={() => void perform(() => mutate('alerts', alert.id, { actionRequired: !alert.actionRequired }))}>{alert.actionRequired ? 'Mark reviewed' : 'Flag for action'}</button></div></article>)}</div> : <Empty title={totalFilters ? 'No matching alerts' : 'Your morning starts here'} detail={totalFilters ? 'Try another search or business filter.' : 'Connect each Gmail account and sync, add an alert, or receive a signed n8n notification.'} action={<button className="hub-button" onClick={() => setTab('connectors')}>Set up connections<ArrowUpRight size={15}/></button>}/>}
            </section>
            <section className="hub-panel"><div className="hub-panel-heading"><div><h2><Bell size={19}/>Automation inbox</h2><p>Confirmed deliveries from your n8n workflows.</p></div><span className="hub-tag">{snapshot.notifications.filter(n => !n.read).length} unread</span></div>{snapshot.notifications.filter(matches).length ? <div className="hub-records">{snapshot.notifications.filter(matches).map(n => <article className={`hub-record ${n.read ? 'hub-muted' : ''}`} key={n.id}><div className="hub-record-top"><h3>{n.title}</h3><div className="hub-row-actions"><button className="hub-icon" disabled={busy || offline} aria-label={n.read ? 'Mark unread' : 'Mark read'} onClick={() => void perform(() => mutate('notifications', n.id, { read: !n.read }))}><Check size={16}/></button><button className="hub-icon hub-danger" aria-label="Delete notification" disabled={busy || offline} onClick={() => remove('notifications', n.id)}><Trash2 size={16}/></button></div></div><p>{n.message}</p><small>{n.business} · {date(n.createdAt)}</small></article>)}</div> : <p className="hub-inline-empty">No matching notifications. Webhook events appear here only after they’re saved.</p>}</section>
          </>}

          {tab === 'inventory' && <>
            <section className="hub-panel hub-import-panel"><div className="hub-panel-heading"><div><span className="hub-eyebrow">KIM’S CLOSET BOUTIQUE</span><h2>From CSV to ready-to-list.</h2><p>Import Vendoo exports with a preview, validation, and duplicate-SKU protection.</p></div><div className="hub-import-icon"><Upload size={24}/></div></div><div className="hub-upload-actions"><button className="hub-button hub-pink" disabled={busy || offline} onClick={() => csvInput.current?.click()}><Upload size={15}/>Import Vendoo CSV</button><button className="hub-button" disabled={offline} onClick={() => setEditor({ resource: 'inventory' })}><Plus size={15}/>Add item</button><small>CSV · up to 5 MB / 5,000 rows</small></div><input ref={csvInput} hidden type="file" accept=".csv,text/csv" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void previewCSV(file); }}/>
              {csv && <div className="hub-csv-preview"><h3>{csv.filename}</h3><p>{csv.preview.rowCount} valid rows · {csv.preview.existing} existing SKUs · {csv.preview.withPhotos} with photo links · {csv.preview.errors.length} errors</p>{csv.preview.errors.length > 0 && <div className="hub-error" role="alert">{csv.preview.errors.slice(0, 10).map(e => <p key={e.row}>Row {e.row}: {e.error}</p>)}<p>Nothing will be imported until all errors are fixed.</p></div>}<ul>{csv.preview.items.slice(0, 5).map((item: Inventory) => <li key={item.sku}><InventoryPhoto key={item.imageUrl} url={item.imageUrl} title={item.title}/><span>{item.sku} · {item.title} · {money(item.price)}</span></li>)}</ul><label>Import mode<select value={importMode} onChange={e => setImportMode(e.target.value)}><option value="skip">Keep saved item (skip duplicate)</option><option value="update">Replace saved item fields from CSV</option><option value="photos">Photos only — update matching SKUs, keep everything else</option></select></label><p>{importMode === 'photos' ? 'Only photo links on matching SKUs are updated. Prices, notes, statuses and other saved fields stay unchanged. Unmatched SKUs and blank photos are skipped.' : 'Image / Photo URL, numbered photo columns, and URL lists are supported. The first image is used. Blank photo fields do not erase saved photos.'}</p><div className="hub-upload-actions"><button className="hub-button hub-primary" disabled={busy || offline || csv.preview.errors.length > 0 || !csv.preview.rowCount} onClick={() => void commitCSV()}>Confirm import</button><button className="hub-button" disabled={busy} onClick={() => setCsv(null)}>Cancel</button></div></div>}
            </section>
            <section className="hub-panel"><div className="hub-panel-heading"><div><h2>Inventory board<span className="hub-count">{inventory.length}</span></h2><p>Prices and statuses are saved to your server, across devices.</p></div></div><div className="hub-filters">{[['ALL', 'All items'], ['REVIEW', 'Needs review'], ['ACTIVE', 'Active / ready']].map(([value, label]) => <button className={inventoryFilter === value ? 'is-active' : ''} key={value} onClick={() => setInventoryFilter(value)}>{label}</button>)}</div>
              {inventory.length ? <div className="hub-records">{inventory.map(item => <article className="hub-record hub-inventory-record" key={item.id}><div className="hub-record-top"><span className="hub-sku">{item.sku || 'NO SKU'}</span><span className={`hub-tag ${/need/i.test(item.status) ? 'hub-tag-amber' : ''}`}>{item.status}</span>{controls('inventory', item)}</div><div className="hub-inventory-body"><InventoryPhoto key={item.imageUrl} url={item.imageUrl} title={item.title}/><div className="hub-inventory-details"><h3>{item.title}</h3><div className="hub-item-meta"><span>{item.brand || 'Brand not set'}</span><span>Size {item.size || 'not set'}</span><span>{item.color || 'Color not set'}</span><strong>{money(item.price)}</strong></div>{item.notes && <p className="hub-item-notes">{item.notes}</p>}</div></div><div className="hub-record-foot"><span>{item.sourceBatch} · {item.platforms}</span><button onClick={() => edit('inventory', item)} disabled={offline}>Edit item<ChevronRight size={13}/></button></div></article>)}</div> : <Empty title={snapshot.inventory.length ? 'No matching inventory' : 'Make room for your first listing'} detail={snapshot.inventory.length ? 'Adjust your search, status, or business filters.' : 'Upload a Vendoo export or add an item. No sample listings are mixed into your business data.'}/>}
            </section>
          </>}

          {tab === 'files' && <section className="hub-panel"><div className="hub-panel-heading"><div><span className="hub-eyebrow">TWO CLOUDS. ONE INDEX.</span><h2>Unified cloud files<span className="hub-count">{files.length}</span></h2><p>Saved metadata from Google Drive, OneDrive, and CSV imports. File contents stay in your cloud.</p></div><button className="hub-button" disabled={offline} onClick={() => setEditor({ resource: 'files' })}><Plus size={15}/>Add file link</button></div>{files.length ? <div className="hub-records">{files.map(file => <article className="hub-record" key={file.id}><div className="hub-record-top"><span className="hub-tag">{file.cloud}</span><span className="hub-record-date">{date(file.updatedAt)}</span>{controls('files', file)}</div><h3><FolderOpen size={17}/>{file.name}</h3><p>{file.business} / {file.folder || 'No folder specified'}</p><div className="hub-record-foot"><span>{file.status}</span>{file.url && <a href={file.url} target="_blank" rel="noreferrer">Open file<ArrowUpRight size={14}/></a>}</div></article>)}</div> : <Empty title={totalFilters ? 'No matching files' : 'Bring your clouds together'} detail="Connect and sync Google Drive or OneDrive, save an HTTPS file link, or import a Vendoo CSV batch." action={<button className="hub-button" onClick={() => setTab('connectors')}>Connect a cloud<ArrowUpRight size={15}/></button>}/>}</section>}

          {tab === 'apps' && <>
            <div className="hub-section-heading"><div><span className="hub-eyebrow">SHIP THE NEXT THING</span><h2>App builder’s tracker</h2></div><button className="hub-button hub-primary" disabled={offline} onClick={() => setEditor({ resource: 'apps' })}><Plus size={15}/>Track an app</button></div>
            {!apps.length && <section className="hub-panel"><Empty title={totalFilters ? 'No matching apps' : 'A home for every build'} detail="Track NutriPlanPro, website updates, and automation projects with persistent to-dos."/></section>}
            {[...apps, { id: 'unassigned', name: 'Workspace to-dos', version: '', platform: '', status: 'General', url: '', business: 'App Studio' }].map(app => {
              const todos = snapshot.todos.filter(t => (app.id === 'unassigned' ? !t.appId : t.appId === app.id)).filter(matches);
              if (app.id === 'unassigned' && business !== 'ALL' && business !== 'App Studio' && !todos.length) return null;
              return <section className="hub-panel" key={app.id}><div className="hub-panel-heading"><div><h2>{app.name}</h2><p>{[app.version, app.platform].filter(Boolean).join(' · ') || 'Organize the next action.'}</p></div>{app.id !== 'unassigned' && controls('apps', app)}</div><div className="hub-app-status"><span className="hub-tag">{app.status}</span>{app.url && <a href={app.url} target="_blank" rel="noreferrer">Open app<ArrowUpRight size={14}/></a>}</div><div className="hub-todos">{todos.map(todo => <div className="hub-todo" key={todo.id}><label><input type="checkbox" checked={todo.done} disabled={busy || offline} onChange={e => void perform(() => mutate('todos', todo.id, { done: e.target.checked }))}/><span className={todo.done ? 'is-done' : ''}>{todo.text}</span></label><button className="hub-icon" aria-label="Edit to-do" disabled={busy || offline} onClick={() => { const text = prompt('Edit to-do', todo.text); if (text?.trim()) void perform(() => mutate('todos', todo.id, { text: text.trim() })); }}><Pencil size={14}/></button><button className="hub-icon hub-danger" aria-label="Delete to-do" disabled={busy || offline} onClick={() => remove('todos', todo.id)}><Trash2 size={14}/></button></div>)}</div><form className="hub-add-todo" onSubmit={e => { e.preventDefault(); const text = todoText[app.id]?.trim(); if (text) void perform(async () => { await api('/todos', { method: 'POST', body: JSON.stringify({ text, appId: app.id === 'unassigned' ? null : app.id, business: app.business }) }); setTodoText(prev => ({ ...prev, [app.id]: '' })); await load(); }); }}><input aria-label={`New to-do for ${app.name}`} placeholder="Add the next action…" maxLength={1000} required value={todoText[app.id] || ''} onChange={e => setTodoText({ ...todoText, [app.id]: e.target.value })}/><button className="hub-button" disabled={busy || offline}><Plus size={15}/>Add</button></form></section>;
            })}
          </>}

          {tab === 'connectors' && <>
            <section className="hub-panel"><div className="hub-panel-heading"><div><span className="hub-eyebrow">CONNECTED, NOT ASSUMED</span><h2>Cloud & automation connections</h2><p>Authorize each account separately. Adding a URL does not create a connection.</p></div><ShieldCheck size={22}/></div>
              <div className="hub-connector-grid">{[
                { provider: 'google', title: 'Dual Gmail + Google Drive', detail: 'Connect bracer38@gmail.com, then repeat for robert@over50fitlife.com. Read-only mail and Drive metadata.', configured: connections.googleConfigured, icon: Mail },
                { provider: 'onedrive', title: 'Microsoft OneDrive', detail: 'Authorize your Microsoft account to index file metadata from your OneDrive root.', configured: connections.onedriveConfigured, icon: Cloud },
              ].map(provider => <div className="hub-connector" key={provider.provider}><provider.icon size={23}/><h3>{provider.title}</h3><p>{provider.detail}</p><span className={`hub-tag ${!provider.configured ? 'hub-tag-amber' : ''}`}>{provider.configured ? 'OAuth ready' : 'Server setup required'}</span>{provider.configured ? <a className="hub-button" href={`/api/connectors/${provider.provider}/authorize`}>Connect account<ArrowUpRight size={14}/></a> : <small>Add provider client ID / secret, APP_URL, and token encryption key to the server environment. See the deployment guide.</small>}</div>)}</div>
              <div className="hub-connection-list">{connections.connections.map(c => <div className="hub-connection" key={c.id}><div><h3><span className="hub-dot"/>{c.account}</h3><p>{c.provider === 'google' ? 'Gmail + Drive' : 'OneDrive'} · {date(c.lastSync)}</p>{c.error && <p className="hub-error">{c.error}</p>}</div><div className="hub-row-actions"><button className="hub-button" disabled={busy || offline} onClick={() => void perform(async () => { const result = await api<{ alerts: number; files: number }>(`/connectors/${c.id}/sync`, { method: 'POST', body: '{}' }); await load(); setNotice(`Sync complete: ${result.alerts} messages, ${result.files} files processed.`); })}><RefreshCw size={14}/>Sync now</button><button className="hub-icon hub-danger" disabled={busy || offline} aria-label={`Disconnect ${c.account}`} onClick={() => { if (confirm('Remove saved access tokens for this account? Existing records stay. Revoke provider consent in Google/Microsoft settings to fully revoke access.')) void perform(async () => { await api(`/connectors/${c.id}`, { method: 'DELETE' }); await load(); }); }}><X size={16}/></button></div></div>)}</div><p className="hub-fine-print">{connections.syncScope} Remote deletions are not mirrored; saved records remain until you remove them.</p>
            </section>
            <N8nSetup configured={connections.webhookConfigured} origin={window.location.origin}/>
            <section className="hub-panel"><div className="hub-panel-heading"><div><h2><Database size={19}/>Data & recovery</h2><p>SQLite is the source of truth. OAuth secrets and sessions never appear in JSON backups.</p></div></div><div className="hub-upload-actions"><button className="hub-button" disabled={busy || offline} onClick={() => restoreInput.current?.click()}><Upload size={15}/>Restore JSON backup</button><a className="hub-button" href="/legacy">Open legacy dashboard<ArrowUpRight size={15}/></a></div><p className="hub-fine-print">Legacy localStorage data is separate and is not automatically migrated into this hub. Restores replace business records only.</p><input ref={restoreInput} hidden type="file" accept=".json,application/json" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void restore(file); }}/></section>
          </>}
        </div>

        <aside className="hub-assistant"><div className="hub-assistant-heading"><div className="hub-ai-icon"><Sparkles size={20}/></div><div><h2>Workspace assistant</h2><p>{connections.aiConfigured ? 'AI + saved database records' : 'Database search · AI not configured'}</p></div></div><div className="hub-assistant-scope"><ShieldCheck size={13}/>Read-only · Grounded in saved records</div><div className="hub-chat" role="log" aria-live="polite">{chat.map((msg, index) => <div key={index} className={`hub-message hub-message-${msg.role}`}>{msg.role === 'assistant' && <span className="hub-message-name">RACEROPS {msg.mode === 'database' ? '/ DATABASE' : msg.mode === 'ai' ? '/ AI' : ''}</span>}<p>{msg.text}</p>{msg.citations && msg.citations.length > 0 && <div className="hub-citations">{msg.citations.slice(0, 4).map(c => <button key={`${c.table}-${c.id}`} onClick={() => openCitation(c)}>{c.label}<ArrowUpRight size={11}/></button>)}</div>}</div>)}{thinking && <p className="hub-thinking">Reading your saved workspace…</p>}<div ref={chatEnd}/></div><div className="hub-prompts">{['What Vendoo items need measurements?', 'Summarize my Gmail alerts', 'Show open to-dos'].map(prompt => <button key={prompt} disabled={thinking} onClick={() => setQuestion(prompt)}>{prompt}<ChevronRight size={12}/></button>)}</div><form className="hub-chat-form" onSubmit={ask}><input aria-label="Ask workspace assistant" placeholder="Ask your workspace…" maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)}/><button disabled={thinking || offline || !question.trim()} aria-label="Send question"><Send size={17}/></button></form><p className="hub-ai-disclaimer">{connections.aiConfigured ? 'Selected records are sent to the configured AI provider. Verify important details.' : 'No external AI calls. Add an OpenAI key on the server to enable AI answers.'}</p></aside>
      </div>
      <footer className="hub-footer"><span>RACEROPS <b>/</b> LIVE COMMAND HUB</span><span>Last loaded {date(snapshot.exportedAt)} · Saved records, not live site monitoring</span></footer>
    </main>
    {editor && <RecordEditor resource={editor.resource} record={editor.record} close={() => setEditor(null)} saved={load}/>}
  </div>;
}
