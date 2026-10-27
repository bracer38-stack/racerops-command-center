# RacerOps Live Command Hub

Private, single-owner command center for **Over50FitLife** and **Kim’s Closet Boutique**. React/Vite frontend, Express 5 API, and persistent SQLite storage. The full-stack hub is at `/`; the old localStorage dashboard remains at `/legacy` and is **not migrated or cloud-connected**.

## Phase 1 preview and approval gate

Phase 1 adds a five-move Morning Brief, marketing filtering/business tagging, review-only inventory suggestions, and compact business-grouped cloud files. Size/color suggestions only fill blank fields after explicit bulk approval; brand corrections also require approval. “Needs review” is derived from missing size, color, price, or photo, independently of the saved listing status. Displayed hub dates use America/New_York.

Cloud accounts sync **no files by default** until the owner selects folders and assigns each to a business in Connections. Selected folders include descendants; at most 200 files and 100 traversed folders are processed per sync. Explicitly selected child folders take precedence over selected ancestors. Gmail still reads the newest 25 messages from the past 30 days. Previously saved files are retained until the owner previews and confirms removal. Cleanup removes RacerOps metadata only, never provider files. Older metadata with unknown ancestry is protected unless the owner explicitly includes it in removal.

**Do not deploy, merge, or run a migration without owner approval.** Show isolated preview screenshots of every changed screen first. Immediately before an approved deployment/upgrade, repeat the verified full SQLite backup API + business JSON + private off-host recovery archive process; keep encryption keys separate. Do not copy a live SQLite file without its WAL.

New disposable databases initialize directly at schema 3. Existing databases refuse an automatic upgrade. The prepared explicit command below is a migration, **not a preview/setup command**, and must not be executed until separately approved and backed up:

```sh
node server/migrate-phase-one.mjs --approve-phase-one-upgrade /absolute/path/to/database.sqlite
```

The upgrade adds mail classification metadata, file-folder ancestry, and per-connection folder settings; it does not rewrite business records, tokens, sessions, or webhook receipts. The upgrade execution is intentionally deferred pending approval. Use only a fresh, never-before-used synthetic database path for preview/testing. JSON restore remains a separate destructive operation; folder selections and OAuth credentials are protected by the full SQLite backup, not the business JSON export.

## Appearance

The live hub defaults to **Light**: soft off-white backgrounds, white cards, and dark text with teal/pink accents. The **Light/Dark switch** is on the sign-in screen and in the workspace header. The selection is saved as `racerops:hub-theme` in this browser's localStorage, survives sign-out/reloads, and follows changes in another tab. Each browser/device has its own choice; the OS dark-mode setting does not override the light default. If browser storage is blocked, switching still works for the open page but may not survive a reload. Native form controls and browser theme-color follow the selection; an installed PWA's launch screen uses the light default. The legacy dashboard is unchanged.

## Run locally

Requires Node 22.13+ (Node 22 recommended), Corepack, and pnpm 10.17.1. Native SQLite needs Python/make/g++ if a prebuilt binary is unavailable.

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
# Edit .env: set a unique HUB_PASSWORD (16+ characters).
pnpm dev
```

Open `http://localhost:5173`. Express runs on port 3001; Vite proxies `/api`. Use the configured password to sign in. For another Vite port, run `pnpm start` and `pnpm exec vite --host 0.0.0.0 --port 5175` in separate terminals, and set `APP_URL=http://localhost:5175` first. Keep the API on 3001 for this dev proxy.

The database starts **empty**. Import a real Vendoo CSV, create records, send signed n8n events, or authorize cloud accounts. Demo Gmail messages, revenue metrics, and integrations are never seeded as live data.

```sh
pnpm lint       # backend + new hub + Vite config (legacy source is unchanged)
pnpm typecheck  # all React source
pnpm test       # legacy Vitest regressions + real HTTP/SQLite backend tests
pnpm build
# For a local production preview, use an HTTPS reverse proxy and production env:
NODE_ENV=production pnpm start
```

`pnpm preview` is Vite's static-only preview and does **not** serve the API. Production Express serves both `dist/` and `/api` on a single origin.

## Environment and security

See `.env.example`. Keep secrets in the hosting platform’s secret manager, never source control.

| Setting | Purpose |
| --- | --- |
| `HUB_PASSWORD` | Required, unique 16+ character owner password. Changing it invalidates old sessions. |
| `DATABASE_PATH` | SQLite file on a **persistent, writable local volume**; default `./data/racerops.sqlite`. |
| `APP_URL` | Exact public origin; required HTTPS in production. Render can use its injected `RENDER_EXTERNAL_URL`. |
| `NODE_ENV` | Set `production` when exposed publicly; enforces HTTPS config and Secure cookies. |
| `TRUST_PROXY` | Number of trusted reverse-proxy hops; default 0, Render 1. Never trust arbitrary forwarding headers. |
| `PORT` | API + production frontend port; default 3001. |
| `WEBHOOK_SECRET` | Optional random 32+ character HMAC secret; unset disables n8n ingestion. |
| `TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte AES key; required before cloud OAuth can be enabled. Back up securely; losing it requires reconnecting accounts. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google Web application OAuth credentials. |
| `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | Optional Microsoft Web application OAuth credentials. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional AI provider mode; default model `gpt-4.1-mini`. No key means deterministic DB-only answers. |

Generate an encryption key with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Generate passwords/webhook secrets with your password manager. Do not publish the generated values.

HTTP-only 7-day sessions are stored as hashes in SQLite. Same-origin enforcement protects browser mutations, and rate limits protect login/sync/chat/webhooks. Cloud tokens are AES-GCM encrypted. This is one owner workspace, **not multi-tenant**: anyone with the password can read/write all records. No credential recovery is provided; change the server password if needed. Use HTTPS, private host access, and an appropriate strong password.

## Deploy (host approval/access still required)

This repository is deployable, but **does not itself create a live service or URL**.

### Render (optional paid persistent-disk configuration)

1. After owner approval, create a Blueprint from `render.yaml`. It specifies a single Starter instance with a 1 GB persistent disk. Review current pricing before provisioning.
2. Enter `HUB_PASSWORD` and a generated `TOKEN_ENCRYPTION_KEY`. Render generates a webhook secret. Other providers are optional.
3. Deploy manually; automatic deploys are disabled. The injected `RENDER_EXTERNAL_URL` provides the HTTPS origin; for a custom domain explicitly set `APP_URL` to that origin.
4. Add provider client credentials and callback URLs below if desired. Sign in, connect each account, and choose **Sync now**. OAuth authorization alone does not import records.
5. Verify login, create an inventory item, restart the service, and confirm it persists. Verify restore with a disposable database before depending on backups.

See [Render disks](https://render.com/docs/disks) and [Blueprint specification](https://render.com/docs/blueprint-spec). The deployment configuration has not been applied to a real hosting account.

### Docker / other VM hosts

```sh
docker build -t racerops-hub .
# Supply production secrets in an untracked .env.production file.
# APP_URL=https://hub.example.com; NODE_ENV=production; TRUST_PROXY=1 if one proxy.
docker run -d --name racerops-hub --env-file .env.production \
  -p 127.0.0.1:3001:3001 -v racerops-data:/app/data racerops-hub
```

Terminate HTTPS with the host's reverse proxy; forward the correct Host and X-Forwarded-Proto and trust only that proxy. Bind the backend to loopback as above. Run **one instance**; do not put SQLite on network storage or an ephemeral/serverless filesystem. A local bind mount needs write permissions for container UID 1000. `/api/health` is public and returns only health status.

Replit deployment is not configured: choose a host/storage model first. Do not use an autoscaled or ephemeral Replit deployment with this SQLite path. PostgreSQL migration would be needed for horizontal/serverless scale.

## Authorize Gmail / Google Drive

1. In Google Cloud, enable the Gmail API and Google Drive API, configure the OAuth consent screen, and create a **Web application** OAuth client. Request read-only Gmail and Drive metadata access.
2. Set redirect URI `https://YOUR-HUB/api/connectors/google/callback` (local development uses the matching `http://localhost:5173` origin). Set `APP_URL`, client ID/secret, and token encryption key on the server.
3. Add `bracer38@gmail.com` and `robert@over50fitlife.com` as consent-screen test users when in testing mode. Workspace admins may need to approve scopes. Gmail read-only is a restricted scope; testing-mode refresh tokens can expire, and public distribution can require verification.
4. Sign into the hub, open Connections, authorize the first account, then repeat for the second. Only these two verified Google email addresses are accepted.
5. Choose Drive business folders in Connections, assign a business to each, and save. Sync now reads up to 25 messages from the last 30 days and up to 200 files under those selected folders. Direct messages/comments, sales, and App Store status changes set action flags; other synced mail defaults to Low. Owner classification overrides survive re-sync. New mail is **not polled in the background**; automate via n8n or sync manually.

Mail snippets and metadata are saved, not full messages or attachments. Drive stores links/IDs, not file contents. Provider sync is transactional per account; deleted remote records are not removed locally. Disconnect removes local tokens; revoke provider consent in Google settings to fully revoke access.

Official references: [Google web OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).

## Authorize OneDrive

Register an application in Microsoft Entra ID supporting the desired personal/work accounts. Add a **Web** redirect URI `https://YOUR-HUB/api/connectors/onedrive/callback`, create a client secret, and configure delegated `User.Read`, `Files.Read`, and `offline_access` permissions. Set Microsoft client ID/secret, `APP_URL`, and the token encryption key. Authorize from Connections, choose business folders, assign their businesses, save, and sync manually. Up to 200 files under selected folders/descendants are indexed; personal root files are not synced. No file contents are downloaded. See [Microsoft auth code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) and [OneDrive children API](https://learn.microsoft.com/en-us/graph/api/driveitem-list-children).

## Vendoo CSV

Preview before importing. Maximum 5 MB / 5,000 rows; BOM, quoted commas, escaped quotes, and quoted newlines are supported. A `Title`, `Item Name`, or `Product Name` column is required. Aliases cover SKU/custom SKU, item ID, brand, size, color, listing price, status, notes/description, platforms, and season. Prices must be nonnegative with at most two decimals; blank price is unpriced. Other columns are ignored.

SKU is case-insensitively unique. Missing SKUs use a Vendoo item ID or deterministic row hash; rows without stable IDs get a different SKU if their content changes. Duplicated SKUs within a file and malformed rows prevent the **entire** import. Existing database SKUs are skipped by default; choose update explicitly to replace their imported fields. The UI shows up to 20 preview rows and all reported row errors. Successful batches also create a cloud-file history entry.

## Signed n8n deliveries

Connections now includes an n8n setup panel with a copyable delivery URL, example payloads for all five supported event types, signing instructions, and the latest 20 **accepted** delivery receipts. Receipts are owner-authenticated metadata (event ID, type, saved record ID, timestamp), never request bodies, tokens, signing secrets, or hashes. A configured secret means the server can accept events—not that n8n is connected or sending. Rejected requests must be diagnosed from the HTTP response in n8n; this is not a workflow editor or execution-history viewer.

Outputs render in existing views: notifications → Morning brief / Automation inbox; alerts → Morning brief / action stream; inventory → Kim’s Closet; files → Cloud files; tasks → App tracker. The active dashboard refreshes every minute, or immediately on a manual refresh. `GET /api/webhooks/n8n/deliveries` requires the owner session and returns a total plus at most 20 recent receipts. Older receipts without type metadata appear as legacy events. Receipts are retained after business-record deletion/restore.

`POST /api/webhooks/n8n` is the only automation endpoint; the old fake `/api/webhook/*` receivers were removed. It uses HMAC instead of browser cookies. Configure `WEBHOOK_SECRET` on both ends, and send **the exact raw JSON string you sign**, not a later reserialized object.

```js
// Node example; put WEBHOOK_SECRET in n8n's credential/secret store, not a public node.
import { createHmac, randomUUID } from 'node:crypto';
const body = JSON.stringify({
  eventId: randomUUID(), // Keep this same value AND raw body across delivery retries.
  type: 'notification',
  data: { title: 'Workflow finished', message: 'Inventory checks completed', business: "Kim's Closet" }
});
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = 'sha256=' + createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(`${timestamp}.${body}`).digest('hex');
const response = await fetch('https://YOUR-HUB/api/webhooks/n8n', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-RacerOps-Timestamp': timestamp, 'X-RacerOps-Signature': signature },
  body
});
if (!response.ok) throw new Error(`Delivery failed: ${response.status}`);
```

Use an n8n Crypto/HMAC node or a Code node if your n8n host permits Node crypto. HTTP Request must use raw body mode. Timestamp is Unix seconds with a ±5 minute tolerance; regenerate timestamp/signature when retrying later but retain eventId/raw body. A valid new event returns 201, an exact duplicate 200 with `duplicate: true`, and changed content reusing an event ID 409. Unsigned/stale requests return 401, invalid JSON/schema 400, absent secret 503. Limit 1 MB, 60 requests/minute/IP. Acknowledgment happens only after a database transaction commits.

Supported types: `notification`, `inventory`, `alert`, `file`, `todo`; `data` follows the schemas in `server/schema.mjs`. Required fields: notification `title`; inventory `title`; alert `account` + `subject`; file `name`; todo `text` (optional `appId` must exist). Business values: `Kim's Closet`, `Over50FitLife`, `App Studio`, `Dual Business`. SKU/external IDs upsert inventory/alerts/files. Event receipts persist independently of JSON restores; replaying old event IDs after restoring does not recreate records.

## REST API and assistant

### Inventory photos and existing imports

Inventory supports an optional `imageUrl` (HTTPS, max 2,000 characters, no embedded URL credentials). Vendoo import recognizes Image URL / Photo URL, Images / Photos / Image URLs, primary/main image fields, and numbered Image/Photo/Picture columns. A cell can contain one URL, a JSON array of strings or `{ "url": "…" }` objects, or URLs separated by newline, pipe, semicolon, or a comma followed by another URL. The first nonempty photo is used; numbered fields sort naturally. Unsupported/unsafe photo values are row errors shown before import. No file extension is required for CDN image links.

Cards and the import preview show thumbnails with click-to-enlarge native dialogs, keyboard Escape/Close, and a missing/broken-photo fallback. Edit item → Photo URL can add, replace, or clear the image. Photos remain on their external host (not downloaded to SQLite); HTTPS image loading is allowed by CSP and sends no referrer. Signed/expired URLs or links requiring authentication might not display. No server-side image proxy, photo uploads, full gallery, or private Vendoo login is provided.

To attach photos to already imported items, preview the same CSV and select **Photos only — update matching SKUs, keep everything else**. This updates only photo links on case-insensitively matched SKUs, preserves prices/notes/status/business and IDs, and skips unmatched SKUs or blank photos. Normal CSV updates also keep the existing image when the CSV photo is blank/missing. If the CSV has no SKU or Vendoo/item ID, fallback SKUs depend on the full original row; use the original export or add a stable SKU before matching. Back up before any import. The real owner CSV's headers and URL accessibility still need checking.

SQLite upgrades automatically and transactionally to schema version 2, adding photo URLs and receipt metadata without replacing business data, OAuth connections, sessions, or replay receipts. JSON backup version stays at 1; older backups without photos restore with empty photo fields. Take a JSON backup and a consistent disk/database backup before the **later owner-approved deployment**. This change does not deploy itself, re-import a CSV, or configure an n8n workflow.

All routes except health, login, and signed webhook require the session cookie. For mutation requests include `Origin: APP_URL` and JSON Content-Type. Login: `POST /api/auth/login` with `{ "password": "..." }`; logout: `POST /api/auth/logout`; session check: `GET /api/auth/session`.

For each of `inventory`, `alerts`, `files`, `apps`, `todos`, `notifications`:

- `GET /api/RESOURCE?q=search&limit=100&offset=0` → `{items,total,limit,offset}` (max limit 200)
- `POST /api/RESOURCE` → created record (201)
- `GET /api/RESOURCE/:id`, `PATCH /api/RESOURCE/:id`, `DELETE /api/RESOURCE/:id`

Deleting an app also deletes its linked to-dos. `POST /api/inventory/import/preview` and `/import` accept `{csv,filename,mode:"skip"|"update"}`. The frontend loads all business records from the backup endpoint and refreshes every minute while visible, not real-time push. Suitable for a small owner-managed workspace, not millions of records.

`POST /api/assistant` with `{question}` reads saved DB tables, returns exact whole-workspace totals plus keyword-selected samples, citation IDs/labels, scope, and timestamp. It cannot mutate records or infer missing measurements, live sales, or connection status. No API key means no external AI call. With OpenAI configured, selected records/question are sent to OpenAI; assess privacy before enabling. Retrieval is bounded to 20 rows/table and is **not** exhaustive semantic reasoning. Provider failures fall back to database results. Chat history is not persisted.

## Backup / recovery and mobile

Download JSON from the header regularly and store it privately. `GET /api/backup` exports **all business records** but no sessions, OAuth tokens, provider configuration, webhook receipts, or password. Connections → Restore requires explicit confirmation, validates all records, and replaces business records transactionally. JSON restore is limited to 10 MB. Never upload backups publicly. For larger databases or full recovery, take consistent SQLite backups using the SQLite backup API/CLI while offline or a host snapshot; do not copy only the live `.sqlite` file while WAL writes are active. Keep full disk backups AND the encryption key in separate protected storage. No automatic offsite backup scheduler is included.

On Samsung S24 Ultra, open the deployed **HTTPS** URL in Chrome → menu → **Install app / Add to Home screen**, or use Install in the hub when available. Samsung Internet's Add page to Home screen also works when supported. The layout is responsive, but a real-device installation has not been verified here. The service worker caches **only a generic public offline page**, not API responses, mail, tokens, or business data. Offline writes are disabled; reconnect to use the hub. No push notifications/background sync are implemented.

## Known boundaries

No real cloud accounts/AI provider have been authorized or validated by this implementation alone. Replit MCP/Team Rida, outbound Gmail, payments, platform listing writes, automatic classification, and remote deletion mirroring are not implemented. `/legacy` retains its old independent demo/localStorage behavior. Production deployment and merging require owner approval.
