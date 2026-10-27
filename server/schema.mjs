import { z } from 'zod';

const text = z.string().trim().max(1000);
const title = text.min(1).max(300);
const notes = z.string().max(20000).default('');
const business = z.enum(["Kim's Closet", 'Over50FitLife', 'NutriPlanPro', 'App Studio', 'Dual Business']).default("Kim's Closet");
export const idSchema = z.string().min(1).max(150).regex(/^[\w.-]+$/);
export const safeUrl = z.string().max(2000).refine(value => {
  if (!value) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'Use an HTTPS URL').default('');
export const imageUrl = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}, 'Use an HTTPS image URL without embedded credentials').default('');

export const schemas = {
  inventory: z.object({
    sku: text.max(150).default(''), title, brand: text.default(''), size: text.default(''),
    color: text.default(''), price: z.number().finite().min(0).max(1e9).nullable().default(null),
    status: title.default('Needs Review'), notes, season: text.default('All-Season'),
    platforms: text.default('Vendoo Draft'), sourceBatch: text.default('Manual Entry'), business, imageUrl,
  }).strict(),
  alerts: z.object({
    account: z.email().max(320), externalId: text.default(''), from: text.default(''),
    date: text.default(''), subject: title, summary: notes, business,
    priority: z.enum(['High', 'Medium', 'Low']).default('Low'), actionRequired: z.boolean().default(false),
    mailLabels: text.max(2000).default(''), listUnsubscribe: z.boolean().default(false),
    classificationOverride: z.boolean().default(false),
    source: text.default('Manual'), url: safeUrl,
  }).strict(),
  files: z.object({
    name: title, cloud: z.enum(['Google Drive', 'OneDrive', 'Vendoo Import', 'Manual']).default('Manual'),
    account: text.default(''), externalId: text.default(''), business, folder: text.default(''), folderId: text.default(''),
    folderPathIds: z.string().max(30000).default('[]'),
    status: text.default('Saved'), url: safeUrl, source: text.default('Manual'),
  }).strict(),
  apps: z.object({
    name: title, version: text.default(''), platform: text.default(''), status: text.default('In progress'),
    url: safeUrl, business: business.default('App Studio'),
  }).strict(),
  todos: z.object({
    appId: idSchema.nullable().default(null), text: title.max(1000), done: z.boolean().default(false),
    business: business.default('App Studio'),
  }).strict(),
  notifications: z.object({ title, message: notes, business, source: text.default('n8n'), read: z.boolean().default(false) }).strict(),
};

export const recordSchema = (name) => schemas[name].extend({ id: idSchema, createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() });
export const backupSchema = z.object({
  version: z.literal(1), exportedAt: z.iso.datetime(),
  ...Object.fromEntries(Object.keys(schemas).map(name => [name, z.array(recordSchema(name))])),
}).strict();

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
