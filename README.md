# RacerOps Live Command Hub

Private, single-owner command center for **Over50FitLife** and **Kim’s Closet Boutique**. React/Vite frontend, Express 5 API, and persistent SQLite storage. The full-stack hub is at `/`; the old localStorage dashboard remains at `/legacy` and is **not migrated or cloud-connected**.

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
5. Click Sync now for each connection. Each sync reads up to 25 messages from the last 30 days and up to 200 recently modified non-folder Drive files. Gmail stars set action flags. New mail is **not polled in the background**; automate via n8n or sync manually. Local annotations may be replaced on the next sync.

Mail snippets and metadata are saved, not full messages or attachments. Drive stores links/IDs, not file contents. Provider sync is transactional per account; deleted remote records are not removed locally. Disconnect removes local tokens; revoke provider consent in Google settings to fully revoke access.

Official references: [Google web OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).

## Authorize OneDrive

Register an application in Microsoft Entra ID supporting the desired personal/work accounts. Add a **Web** redirect URI `https://YOUR-HUB/api/connectors/onedrive/callback`, create a client secret, and configure delegated `User.Read`, `Files.Read`, and `offline_access` permissions. Set Microsoft client ID/secret, `APP_URL`, and the token encryption key. Authorize from Connections and sync manually. Up to 200 **root files** are indexed; recursive folders/pagination are not implemented. No file contents are downloaded. See [Microsoft auth code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) and [OneDrive children API](https://learn.microsoft.com/en-us/graph/api/driveitem-list-children).

## Vendoo CSV

Preview before importing. Maximum 5 MB / 5,000 rows; BOM, quoted commas, escaped quotes, and quoted newlines are supported. A `Title`, `Item Name`, or `Product Name` column is required. Aliases cover SKU/custom SKU, item ID, brand, size, color, listing price, status, notes/description, platforms, and season. Prices must be nonnegative with at most two decimals; blank price is unpriced. Other columns are ignored.

SKU is case-insensitively unique. Missing SKUs use a Vendoo item ID or deterministic row hash; rows without stable IDs get a different SKU if their content changes. Duplicated SKUs within a file and malformed rows prevent the **entire** import. Existing database SKUs are skipped by default; choose update explicitly to replace their imported fields. The UI shows up to 20 preview rows and all reported row errors. Successful batches also create a cloud-file history entry.

## Signed n8n deliveries

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
