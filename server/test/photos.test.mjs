import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore } from '../database.mjs';
import { parseVendoo, importVendoo } from '../csv.mjs';
import { backupSchema, schemas } from '../schema.mjs';
import Database from 'better-sqlite3';

const photo = 'https://images.example.com/jacket.jpg';
const csvCell = value => `"${value.replaceAll('"', '""')}"`;

test('photo headers, numbered columns, JSON arrays and delimited lists select the first photo', () => {
  for (const [header, value] of [
    ['Image URL', photo], ['Photo 1', photo], ['Image 1 URL', photo], ['Image URL 1', photo],
    ['Images', JSON.stringify([photo, 'https://images.example.com/back.jpg'])],
    ['Photos', JSON.stringify([{ url: photo }])],
    ['Image URLs', `${photo}, https://images.example.com/back.jpg`],
    ['Photos', `${photo}|https://images.example.com/back.jpg`],
    ['Photos', `${photo}\nhttps://images.example.com/back.jpg`],
    ['Photos', `${photo};https://images.example.com/back.jpg`],
  ]) {
    const parsed = parseVendoo(`Title,SKU,${header}\nJacket,J-1,${csvCell(value)}`, 'photos.csv');
    assert.deepEqual(parsed.errors, [], header);
    assert.equal(parsed.items[0].imageUrl, photo, header);
  }
  const numbered = parseVendoo(`Title,Image 10,Image 2,Image 1\nJacket,https://example.com/10,${photo},`, 'photos.csv');
  assert.equal(numbered.items[0].imageUrl, photo);
  const comma = `${photo}?crop=10,20,30`;
  assert.equal(parseVendoo(`Title,Image\nJacket,${csvCell(comma)}`, 'photos.csv').items[0].imageUrl, comma);
});

test('unsafe or malformed photos are row errors and old CSVs remain valid', () => {
  for (const imageUrl of ['http://example.com/a.jpg', 'javascript:alert(1)', 'data:image/svg+xml,test', 'https://user:password@example.com/photo', '[broken']) {
    const result = parseVendoo(`Title,Image URL\nJacket,${csvCell(imageUrl)}`, 'bad.csv');
    assert.equal(result.errors.length, 1); assert.equal(result.errors[0].row, 2);
    assert.equal(result.items.length, 0);
  }
  assert.equal(parseVendoo('Title,SKU\nJacket,J-1', 'old.csv').items[0].imageUrl, '');
  assert.equal(schemas.inventory.safeParse({ title: 'Jacket', imageUrl: photo }).success, true);
});

test('photos-only backfill preserves all other fields, IDs and counts, skipping blanks and unmatched SKUs', () => {
  const store = openStore(':memory:');
  try {
    const saved = store.put('inventory', { title: 'Owner title', sku: 'J-1', price: 80, status: 'Sold', notes: 'Owner notes', business: 'Dual Business' });
    const csv = `Title,SKU,Price,Image URL\nChanged,j-1,2,${photo}\nUnmatched,NEW,3,${photo}`;
    const parsed = parseVendoo(csv, 'photos.csv');
    assert.deepEqual(importVendoo(store, parsed, 'photos.csv', 'photos'), { inserted: 0, updated: 1, skipped: 1 });
    const after = store.get('inventory', saved.id);
    assert.deepEqual(after, { ...saved, imageUrl: photo, updatedAt: after.updatedAt });
    assert.equal(store.list('inventory').total, 1);
    const blanks = parseVendoo('Title,SKU,Image URL\nChanged,J-1,', 'empty.csv');
    assert.equal(importVendoo(store, blanks, 'empty.csv', 'photos').skipped, 1);
    assert.equal(store.get('inventory', saved.id).imageUrl, photo);
    importVendoo(store, blanks, 'empty.csv', 'update');
    assert.equal(store.get('inventory', saved.id).imageUrl, photo);
    const backup = backupSchema.parse({ version: 1, exportedAt: new Date().toISOString(), ...store.snapshot() });
    store.restore(backup); assert.equal(store.get('inventory', saved.id).imageUrl, photo);
    delete backup.inventory[0].imageUrl;
    store.restore(backupSchema.parse(backup)); assert.equal(store.get('inventory', saved.id).imageUrl, '');
  } finally { store.db.close(); }
});

test('existing databases refuse an unapproved upgrade without changing records, tokens, sessions or receipts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'racerops-migration-')), path = join(dir, 'hub.sqlite');
  let store;
  try {
    store = openStore(path);
    const item = store.put('inventory', { title: 'Existing jacket', sku: 'J-1', price: 25 });
    store.db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run('session-hash', Date.now() + 60000, 'credential-hash');
    store.db.prepare('INSERT INTO connections (id,provider,account,tokens) VALUES (?,?,?,?)').run('google-1', 'google', 'owner@example.com', 'opaque-test-value');
    store.db.prepare('INSERT INTO webhook_events (id,hash,receivedAt) VALUES (?,?,?)').run('old-event', 'digest', '2026-01-01T00:00:00.000Z');
    store.db.pragma('user_version = 2');
    store.db.close();
    assert.throws(() => openStore(path), /explicitly approved Phase 1 upgrade/);
    const check = new Database(path, { readonly: true });
    try {
      assert.equal(check.pragma('user_version', { simple: true }), 2);
      assert.equal(check.prepare('SELECT price FROM inventory WHERE id = ?').get(item.id).price, 25);
      assert.equal(check.prepare('SELECT COUNT(*) n FROM sessions').get().n, 1);
      assert.equal(check.prepare('SELECT tokens FROM connections').get().tokens, 'opaque-test-value');
      assert.equal(check.prepare('SELECT hash FROM webhook_events').get().hash, 'digest');
      assert.equal(check.pragma('integrity_check', { simple: true }), 'ok');
    } finally { check.close(); }
  } finally { if (store?.db.open) store.db.close(); rmSync(dir, { recursive: true }); }
});
