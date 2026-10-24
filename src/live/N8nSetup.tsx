import { useEffect, useState } from 'react';
import { Copy, Link2, RefreshCw } from 'lucide-react';
import { api } from './api';
import type { WebhookStatus } from './types';

export const webhookExamples = [
  { type: 'notification', label: 'Notification → Morning brief / Automation inbox', data: { title: 'RacerOps test delivery', message: 'Your n8n workflow successfully delivered this message.', business: "Kim's Closet" } },
  { type: 'inventory', label: 'Inventory → Kim’s Closet', data: { title: 'Example inventory item', sku: 'EXAMPLE-ITEM-1', price: 25, status: 'Needs Review', business: "Kim's Closet" } },
  { type: 'alert', label: 'Alert → Morning brief / action stream', data: { account: 'owner@example.com', subject: 'Example action alert', summary: 'Review the result from your workflow.', externalId: 'example-message-1', business: 'Dual Business' } },
  { type: 'file', label: 'File → Cloud files', data: { name: 'Example file link', cloud: 'Manual', url: 'https://example.com/file', externalId: 'example-file-1', source: 'n8n', business: 'Dual Business' } },
  { type: 'todo', label: 'Task → App tracker / Unassigned tasks', data: { text: 'Review your workflow result', business: 'App Studio' } },
];

export function N8nSetup({ configured, origin }: { configured: boolean; origin: string }) {
  const [example, setExample] = useState('notification'), [status, setStatus] = useState<WebhookStatus | null>(null);
  const [error, setError] = useState(''), [copied, setCopied] = useState(''), [refresh, setRefresh] = useState(0), [loading, setLoading] = useState(true);
  const endpoint = new URL('/api/webhooks/n8n', origin).href;
  const selected = webhookExamples.find(item => item.type === example)!;
  const payload = JSON.stringify({ eventId: `example-${example}-1`, type: selected.type, data: selected.data }, null, 2);
  useEffect(() => {
    let active = true;
    async function load() {
      try { const result = await api<WebhookStatus>('/webhooks/n8n/deliveries'); if (active) { setStatus(result); setError(''); } }
      catch (error) { if (active) setError(error instanceof Error ? error.message : 'Could not load deliveries.'); }
      finally { if (active) setLoading(false); }
    }
    setLoading(true); void load();
    const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, [refresh]);
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopied(`${label} copied.`); }
    catch { setCopied('Copy unavailable. Select and copy the visible text instead.'); }
  }
  return <section className="hub-panel hub-n8n">
    <div className="hub-panel-heading"><div><h2><Link2 size={19}/>n8n automation setup</h2><p>Send workflow results into your existing views—not an embedded workflow editor.</p></div><span className={`hub-tag ${!configured ? 'hub-tag-amber' : ''}`}>{configured ? 'Server secret configured' : 'Server secret required'}</span></div>
    <div className="hub-n8n-content">
      <label className="hub-n8n-label">Delivery endpoint</label><div className="hub-copy-row"><code>{endpoint}</code><button className="hub-button" onClick={() => void copy(endpoint, 'Endpoint')}><Copy size={14}/>Copy URL</button></div>
      <ol className="hub-n8n-steps">
        <li>Set a random <strong>WEBHOOK_SECRET</strong> of at least 32 characters in Render and store the same secret securely in n8n. Never paste it into this page or send it in the JSON body.</li>
        <li>Choose a result type below. Give each new event a unique <strong>eventId</strong>; keep the same event ID and exact body when retrying it.</li>
        <li>In n8n, send an HTTP Request: <strong>POST</strong> to the endpoint above with <strong>Content-Type: application/json</strong> and the exact raw JSON body you signed.</li>
        <li>Add <strong>X-RacerOps-Timestamp</strong> (current Unix seconds) and <strong>X-RacerOps-Signature</strong> (the signature below). Then check recent accepted deliveries and the destination view.</li>
      </ol>
      <details><summary>How to sign a delivery securely</summary><p>Compute the HMAC over the timestamp, a period, and the exact raw body. Use n8n’s Crypto/HMAC node or a Code node if your host allows Node crypto. Keep the secret in your host’s credential/secret store.</p><pre>{`signature = "sha256=" + hex(HMAC_SHA256(secret, timestamp + "." + rawBody))\nX-RacerOps-Timestamp: <Unix seconds>\nX-RacerOps-Signature: <signature>`}</pre><p>Sign and send the same string—do not reserialize JSON afterward. Timestamps must be within five minutes; regenerate the timestamp/signature for a later retry, keeping eventId and rawBody unchanged. Never disable signature checking to fix a failed request.</p></details>
      <label className="hub-n8n-label" htmlFor="n8n-example">What should the workflow send?</label>
      <select id="n8n-example" value={example} onChange={event => setExample(event.target.value)}>{webhookExamples.map(item => <option key={item.type} value={item.type}>{item.label}</option>)}</select>
      <pre>{payload}</pre><button className="hub-button" onClick={() => void copy(payload, 'Example payload')}><Copy size={14}/>Copy example JSON</button><p className="hub-fine-print">Examples only—nothing is sent by this page. Replace example values before use. Inventory updates match by SKU and should include the full item fields you want saved. Tasks can target an existing app using its appId. Accepted records appear after refresh or the next one-minute dashboard update.</p>
      <p role="status" className="hub-copy-status">{copied}</p>
      <div className="hub-delivery-heading"><h3>Recent accepted deliveries {status && <span>({status.total} total)</span>}</h3><button className="hub-button" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={14}/>Refresh deliveries</button></div>
      {error && <p className="hub-error" role="alert">{error}</p>}
      {!status && loading ? <p>Loading delivery receipts…</p> : status && (status.deliveries.length ? <ul className="hub-deliveries">{status.deliveries.map(delivery => <li key={delivery.id}><span className="hub-tag">{delivery.type || 'Legacy event'}</span><code>{delivery.id}</code><time dateTime={delivery.receivedAt}>{new Date(delivery.receivedAt).toLocaleString()}</time><span>Saved</span></li>)}</ul> : <p>No accepted deliveries yet. A configured secret does not mean a workflow has sent anything.</p>)}
      <p className="hub-fine-print">Shows the latest 20 successfully saved events, not n8n’s workflow list or execution history. Rejected attempts are not saved here—check n8n’s HTTP response: 401 signature/timestamp, 400 invalid payload, 409 conflicting event ID or missing app, 503 server secret missing. A new accepted event returns 201; an identical retry returns 200 without creating another record. Receipts remain even if the business record is later deleted or restored.</p>
    </div>
  </section>;
}
