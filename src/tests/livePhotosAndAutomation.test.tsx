import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { InventoryPhoto } from '../live/InventoryPhoto';
import { N8nSetup, webhookExamples } from '../live/N8nSetup';
import { RecordEditor } from '../live/RecordEditor';

describe('inventory photos and automation setup markup', () => {
  it('renders safe lazy thumbnails with accessible enlargement controls and a native modal', () => {
    const html = renderToStaticMarkup(<InventoryPhoto url="https://images.example.com/jacket.jpg" title="Denim jacket"/>);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('referrerPolicy="no-referrer"');
    expect(html).toContain('aria-label="Enlarge photo of Denim jacket"');
    expect(html).toContain('<dialog');
    expect(html).toContain('aria-label="Close photo"');
    expect(renderToStaticMarkup(<InventoryPhoto url="" title="Jacket"/>)).toContain('No photo yet');
  });
  it('exposes a manual photo URL field without requiring it', () => {
    const html = renderToStaticMarkup(<RecordEditor resource="inventory" close={() => {}} saved={async () => {}}/>);
    expect(html).toContain('Photo URL (HTTPS)'); expect(html).toContain('type="url"');
  });
  it('shows endpoint and output mapping without misrepresenting a configured secret as a live connection', () => {
    const html = renderToStaticMarkup(<N8nSetup configured={false} origin="https://hub.example.com"/>);
    expect(html).toContain('https://hub.example.com/api/webhooks/n8n');
    expect(html).toContain('Server secret required');
    expect(html).toContain('X-RacerOps-Signature');
    expect(html).toContain('not an embedded workflow editor');
    expect(html).toContain('Examples only');
    expect(webhookExamples.map(item => item.type)).toEqual(['notification', 'inventory', 'alert', 'file', 'todo']);
    const configured = renderToStaticMarkup(<N8nSetup configured origin="https://hub.example.com"/>);
    expect(configured).toContain('Server secret configured');
    expect(configured).not.toContain('Connected to n8n');
  });
});
