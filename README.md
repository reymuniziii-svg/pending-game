# Pending | Production Foundation

Pending is an interactive immigration life-simulation game built with React + TypeScript.
This repository now includes:

- Deterministic simulation engine foundations.
- Content bundle pipeline with draft/publish flow.
- Lightweight Fastify API for content/legal/telemetry/admin routes.
- Bilingual UI shell support (`en`, `es`).
- Initial test and automation scaffolding.

## File structure

```text
/Users/rey/Desktop/01-Active-Projects/pending-game
  /src
    /app
    /engine
    /content
    /i18n
    /assets
    /components
    /stores
    /hooks
    /data
  /server
    /src
      /routes
      /services
      /auth
      /middleware
  /content
    /draft
    /published
  /scripts
  /tests
    /unit
    /integration
    /e2e
```

## Required npm installs

Already defined in `package.json`, including:

- Frontend/runtime: `i18next`, `react-i18next`, `zod`, `seedrandom`, `idb-keyval`.
- Backend/API: `fastify`, `@fastify/*`, `jose`, `@google-cloud/*`.
- Testing: `vitest`, `@playwright/test`, `@axe-core/playwright`, `@testing-library/*`.

Install all:

```bash
npm install
```

## Environment variables

Web example: `.env.example`

```env
VITE_API_BASE_URL=https://api.pendinggame.com
VITE_DEFAULT_LOCALE=en
VITE_FALLBACK_BUNDLE_VERSION=latest
VITE_TELEMETRY_ENABLED=true
VITE_BUILD_SHA=dev
```

API example: `.env.server.example`

```env
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://pendinggame.com
GCP_PROJECT_ID=your-project-id
GCS_CONTENT_BUCKET=pending-content
GCS_ASSET_BUCKET=pending-assets
FIRESTORE_DATABASE=(default)
ADMIN_ALLOWED_EMAILS=editor1@example.com,editor2@example.com
RATE_LIMIT_PUBLIC_RPM=120
RATE_LIMIT_ADMIN_RPM=10
TELEMETRY_SALT=replace_me
SHEETS_DOC_ID=replace_me
```

## How to run

Start web app:

```bash
npm run dev:web
```

Start API server:

```bash
npm run dev:api
```

Build everything:

```bash
npm run build
```

Run tests:

```bash
npm run test
npm run test:e2e
```

Content pipeline:

```bash
npm run content:ingest
npm run content:validate
npm run content:publish
```

## API surface

- `GET /v1/content/bundle?locale=en|es&version=latest`
- `GET /v1/content/legal-snapshot?version=latest`
- `POST /v1/telemetry/session-summary`
- `POST /v1/admin/content/import`
- `POST /v1/admin/content/publish`
- `GET /v1/health`

## Permissions, scopes, and auth flows

### Read/write permissions

- Public clients: read published content, write anonymous telemetry summary.
- Admin/editor: import draft content, publish immutable bundles.
- Scripts/ingest: write only to `content/draft`.

### Authentication

- Player flow: anonymous, no account required.
- Admin flow: bearer JWT (Google verification) with allowlisted emails.
- Local dev fallback: `x-admin-email` header when allowlisted.

### API scopes

- Google Sheets sync is scaffolded for read-only scope:
  `https://www.googleapis.com/auth/spreadsheets.readonly`.

### Rate limits

- Public content endpoints: default `120 req/min/IP`.
- Telemetry endpoint: `20 req/min/IP`.
- Admin endpoints: `10 req/min/user`.

## Security considerations

- Educational-only legal disclaimer shown in app UI.
- Admin endpoints protected by auth + audit logging.
- Published bundles are immutable by version.
- Content import/publish payloads validated with schemas.
- Telemetry is privacy-first and session IDs are salted+hashed.
- Generated art manifest stores provider/seed/prompt/rights metadata.

## Notes

This is a production foundation implementation. Some deeper gameplay balancing, narrative localization breadth, and full QA hardening remain as next-stage execution work.
