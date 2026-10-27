import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyAlert, inventorySuggestions, missingFields, todayMoves, compactFiles, formatDate, decodeText } from '../../shared/operations.mjs';

const alert = (values = {}) => ({ id: 'a', subject: 'Hello', summary: '', from: '', account: 'owner@example.com', source: 'Gmail sync', business: 'Dual Business', priority: 'Medium', actionRequired: true, ...values });
test('mail classification uses account and sender rules, Low defaults, decoded text and action signals', () => {
  for (const [from, business] of [['TikTok', 'Over50FitLife'], ['Pinterest', 'Over50FitLife'], ['Vendoo', "Kim's Closet"], ['Poshmark', "Kim's Closet"], ['eBay', "Kim's Closet"], ['Mercari', "Kim's Closet"], ['Awin', "Kim's Closet"], ['Apple App Store Connect', 'NutriPlanPro'], ['Google Play', 'NutriPlanPro']]) assert.equal(classifyAlert(alert({ from })).business, business);
  assert.equal(classifyAlert(alert({ account: 'robert@over50fitlife.com' })).business, 'Over50FitLife');
  assert.equal(classifyAlert(alert()).priority, 'Low');
  assert.equal(classifyAlert(alert()).actionRequired, false);
  for (const subject of ['You have a new direct message', 'Jane commented on your video', 'You made a sale!', 'Your item has sold', 'New order received']) assert.equal(classifyAlert(alert({ subject })).actionRequired, true, subject);
  assert.equal(classifyAlert(alert({ from: 'App Store Connect', subject: 'Your app status is now In Review' })).actionRequired, true);
  for (const subject of ['Flash sale starts today', 'Sale: 50% off all shoes', 'Your weekly sales summary']) assert.equal(classifyAlert(alert({ subject })).actionRequired, false);
  assert.equal(classifyAlert(alert({ subject: 'Bob&#39;s &amp; Kim&apos;s &eacute;shop' })).subject, "Bob's & Kim's éshop");
  assert.equal(decodeText('&#x1F44D; &ldquo;Ready&rdquo;'), '👍 “Ready”');
});
test('marketing detection uses headers, categories and sender identities; overrides preserve owner choices', () => {
  for (const metadata of [{ listUnsubscribe: true }, { mailLabels: 'INBOX CATEGORY_PROMOTIONS' }, { mailLabels: 'CATEGORY_UPDATES' }, { from: 'offers@example.com' }, { from: 'newsletter@example.com' }]) assert.equal(classifyAlert(alert(metadata)).promotional, true);
  const override = classifyAlert(alert({ classificationOverride: true, priority: 'Low', business: 'App Studio', actionRequired: false }));
  assert.equal(override.business, 'App Studio'); assert.equal(override.priority, 'Low'); assert.equal(override.actionRequired, false);
});
test('suggestions only fill blank fields and clean exact brands; computed review ignores saved status', () => {
  assert.deepEqual(inventorySuggestions({ title: 'Blouse Size Large Navy/White', brand: 'akaria' }).map(s => [s.field, s.value]), [['size', 'Large'], ['color', 'Navy/White'], ['brand', 'AKIRA']]);
  assert.equal(inventorySuggestions({ title: 'L/XL top Medium', brand: 'New York' })[0].value, 'L/XL');
  assert.equal(inventorySuggestions({ title: 'Medium Blue dress', size: ' ', color: 'Red' })[0].value, 'Medium');
  assert.deepEqual(inventorySuggestions({ title: 'Size Large Navy', size: 'S', color: 'White', brand: 'Jones New York' }), []);
  assert.deepEqual(missingFields({ status: 'Active', size: '', color: ' ', price: null, imageUrl: '' }), ['size', 'color', 'price', 'photo']);
  assert.deepEqual(missingFields({ size: 'M', color: 'Blue', price: 0, imageUrl: 'https://example.com/photo.jpg' }), []);
});
test('moves cap at five, include all three sources, respect action and promo rules, and omit completed todos', () => {
  const moves = todayMoves({ alerts: Array.from({ length: 8 }, (_, i) => alert({ id: `alert-${i}`, subject: 'New comment' })), inventory: [{ id: 'inventory', title: 'Top' }], todos: [{ id: 'todo', text: 'Pack order', done: false }, { id: 'done', done: true }] });
  assert.equal(moves.length, 5); assert.deepEqual(moves.slice(0, 3).map(m => m.resource), ['alerts', 'inventory', 'todos']);
  assert.deepEqual(todayMoves({ alerts: [alert({ listUnsubscribe: true, subject: 'New comment' })], todos: [{ done: true }] }), []);
});
test('dates always use New York including DST and handle invalid input', () => {
  assert.match(formatDate('2026-01-01T02:00:00.000Z'), /Dec 31, 2025.*9:00 PM EST/);
  assert.match(formatDate('2026-07-01T14:00:00.000Z'), /Jul 1, 2026.*10:00 AM EDT/);
  assert.equal(formatDate('not a date'), 'Date unavailable');
});
test('compact files hide duplicate Vendoo receipts without hiding distinct real cloud files or businesses', () => {
  const files = [{ id: '1', name: 'items.csv', cloud: 'Vendoo Import', business: "Kim's Closet" }, { id: '2', name: 'items.csv', cloud: 'Vendoo Import', business: "Kim's Closet" }, { id: '3', name: 'items.csv', cloud: 'Google Drive' }, { id: '4', name: 'items.csv', cloud: 'OneDrive' }, { id: '5', name: 'items.csv', cloud: 'Vendoo Import', business: 'Over50FitLife' }];
  assert.deepEqual(compactFiles(files).map(f => f.id), ['1', '3', '4', '5']);
});
