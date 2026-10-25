import { parse } from 'csv-parse/sync';
import { createHash, randomUUID } from 'node:crypto';
import { schemas, HttpError } from './schema.mjs';

const aliases = {
  title: ['title', 'itemtitle', 'producttitle', 'itemname', 'productname', 'name', 'item'],
  sku: ['sku', 'customsku', 'inventorysku'], externalId: ['vendooid', 'itemid', 'id'],
  brand: ['brand', 'designer', 'maker'], size: ['size'], color: ['color', 'colour'],
  price: ['listingprice', 'listedprice', 'price', 'askingprice'],
  status: ['status', 'listingstatus', 'state', 'stage'],
  notes: ['notes', 'description', 'conditiondescription', 'measurements'],
  platforms: ['platforms', 'platform', 'marketplaces', 'marketplace', 'channel'], season: ['season'],
};
const imageHeaders = ['primaryimageurl', 'primaryimage', 'mainimageurl', 'mainimage', 'imageurl', 'photourl', 'imageurls', 'photourls', 'images', 'photos', 'image', 'photo', 'pictureurl', 'picture'];

function firstImage(raw) {
  if (raw.startsWith('[')) {
    const values = JSON.parse(raw);
    if (!Array.isArray(values)) throw new Error('Expected an image URL array.');
    return String(values.map(value => typeof value === 'string' ? value : value?.url || value?.src || '').find(value => value.trim()) || '').trim();
  }
  return raw.split(/\r?\n|\s*[|;]\s*|,\s*(?=https?:\/\/)/)[0].trim();
}

export function parseVendoo(csv, filename) {
  let records;
  try { records = parse(csv, { bom: true, skip_empty_lines: true, trim: true, max_record_size: 100000 }); }
  catch { throw new HttpError(400, 'Malformed CSV: check quotes and column counts. Nothing was imported.'); }
  if (records.length < 2) throw new HttpError(400, 'CSV needs a header and at least one item.');
  if (records.length > 5001) throw new HttpError(400, 'Import at most 5,000 items per CSV.');
  const headers = records.shift().map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  if (new Set(headers).size !== headers.length) throw new HttpError(400, 'CSV has duplicate column names.');
  const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, names.map(n => headers.indexOf(n)).find(i => i >= 0) ?? -1]));
  const imageColumns = headers.map((header, index) => ({ header, index }))
    .filter(({ header }) => imageHeaders.includes(header) || /^(image|photo|picture)(url)?\d+(url)?$/.test(header))
    .sort((a, b) => (imageHeaders.indexOf(a.header) < 0 ? 100 : imageHeaders.indexOf(a.header)) - (imageHeaders.indexOf(b.header) < 0 ? 100 : imageHeaders.indexOf(b.header)) || a.header.localeCompare(b.header, undefined, { numeric: true }));
  if (columns.title === -1) throw new HttpError(400, 'A Title, Item Name, or Product Name column is required.');
  const items = [], errors = [], seen = new Set();
  records.forEach((cells, index) => {
    if (cells.every(c => !c.trim())) return;
    const value = (key) => columns[key] >= 0 ? cells[columns[key]].trim() : '';
    let imageUrl = '';
    try { imageUrl = firstImage(imageColumns.map(({ index }) => cells[index].trim()).find(Boolean) || ''); }
    catch { errors.push({ row: index + 2, error: 'Invalid image URL list: use an HTTPS URL or a JSON array of URLs.' }); return; }
    const rawPrice = value('price');
    const cleaned = rawPrice.replace(/^\$\s*/, '').replace(/,/g, '');
    if (rawPrice && (!/^\d+(\.\d{1,2})?$/.test(cleaned) || Number(cleaned) > 1e9)) {
      errors.push({ row: index + 2, error: 'Invalid listing price (use a nonnegative amount with at most two decimals).' }); return;
    }
    const sourceId = value('externalId');
    const sku = value('sku') || (sourceId ? `VN-${sourceId}` : `CSV-${createHash('sha256').update(JSON.stringify(cells)).digest('hex').slice(0, 20)}`);
    const key = sku.toLowerCase();
    if (seen.has(key)) { errors.push({ row: index + 2, error: `Duplicate SKU in this file: ${sku}` }); return; }
    seen.add(key);
    const result = schemas.inventory.safeParse({
      title: value('title'), sku, brand: value('brand'), size: value('size'), color: value('color'),
      price: rawPrice ? Number(cleaned) : null, status: value('status') || 'Needs Review',
      notes: value('notes'), platforms: value('platforms') || 'Vendoo', season: value('season') || 'All-Season',
      sourceBatch: filename, imageUrl,
    });
    if (!result.success) errors.push({ row: index + 2, error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
    else items.push(result.data);
  });
  return { items, errors };
}

export function importVendoo(store, parsed, filename, mode) {
  if (parsed.errors.length) throw new HttpError(422, 'Fix all CSV errors before importing. Nothing was imported.');
  let inserted = 0, updated = 0, skipped = 0;
  store.db.transaction(() => {
    for (const item of parsed.items) {
      const old = store.db.prepare('SELECT id FROM inventory WHERE sku = ? COLLATE NOCASE').get(item.sku);
      if (mode === 'photos') {
        if (!old || !item.imageUrl) { skipped++; continue; }
        const { id: _id, createdAt: _created, updatedAt: _updated, ...data } = store.get('inventory', old.id);
        store.put('inventory', { ...data, imageUrl: item.imageUrl }, old.id);
        updated++; continue;
      }
      if (old && mode === 'skip') { skipped++; continue; }
      store.put('inventory', { ...item, imageUrl: item.imageUrl || (old ? store.get('inventory', old.id).imageUrl : '') }, old?.id || randomUUID());
      if (old) updated++; else inserted++;
    }
    if (inserted || updated) store.put('files', { name: filename, cloud: 'Vendoo Import', business: "Kim's Closet", folder: 'Imported CSV batches', status: `${inserted} added; ${updated} updated`, source: 'CSV import' });
  })();
  return { inserted, updated, skipped };
}
