import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { InventoryDescription } from '../live/InventoryDescription';
import { FolderSettings } from '../live/FolderSettings';
import { RecordEditor } from '../live/RecordEditor';

describe('Phase 1 review-first markup', () => {
  it('starts descriptions collapsed and exposes accessible expansion without injecting HTML', () => {
    const html = renderToStaticMarkup(<InventoryDescription notes={'A long synthetic description. '.repeat(20) + '<script>unsafe</script>'}/>);
    expect(html).toContain('hub-description-clamp');
    expect(html).toContain('Show more');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('&lt;script&gt;');
    expect(renderToStaticMarkup(<InventoryDescription notes=""/>)).toBe('');
  });
  it('keeps folder settings explicitly opt-in and exposes the selected folder count', () => {
    const html = renderToStaticMarkup(<FolderSettings connection={{ id: 'fixture', provider: 'google', account: 'fixture@example.com', lastSync: null, error: null, folders: [] }} disabled={false} refreshed={async () => {}}/>);
    expect(html).toContain('Choose business folders (0)');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('Remove 0 saved records');
  });
  it('offers NutriPlanPro in the editable business taxonomy', () => {
    expect(renderToStaticMarkup(<RecordEditor resource="alerts" close={() => {}} saved={async () => {}}/>)).toContain('NutriPlanPro');
  });
});
