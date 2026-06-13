# CLAUDE.md

## About this repo

**What it does:** "Pending" is an interactive immigration life-simulation game. The player guides one of several
characters (Maria, David, Elena, Fatima) through the U.S. immigration system month-by-month, making decisions in
branching event chains while managing finances, relationships, stress, legal status, and form/application lifecycles.
The intent is educational — it teaches real immigration concepts (USCIS forms, priority dates, bars, etc.) via an
in-game glossary and achievements. The codebase is a "production foundation": a deterministic React/TypeScript
simulation engine plus a thin Fastify API for serving content bundles, recording anonymous telemetry, and admin
content publishing.

**Stack:**
- Frontend: React 19 + TypeScript, Vite 7, Tailwind 3, Radix UI, Zustand (state), Motion (animation), Lottie, i18next (en/es).
- Engine: pure TS modules in `src/engine/*` (seedrandom-based deterministic RNG, condition evaluator, outcome executor, event/chain resolvers, form & trap processors).
- Content: large hand-authored data in `src/data/events/*` (~7.4k lines) + a draft/published bundle pipeline (`content/`, `scripts/`, Zod schemas in `src/content/schema.ts`).
- Backend: Fastify 5 API (`server/src/*`) with CORS/helmet/rate-limit, Google JWT admin auth (jose), Firestore + GCS adapters.
- Testing: Vitest (unit), Playwright + axe (e2e/a11y), Lighthouse CI.

**Commands:**
- Install: `npm install`
- Build: `npm run build` (web: `tsc -b && vite build`; api: `tsc -p server/tsconfig.json`)
- Lint: `npm run lint`
- Test: `npm run test` (vitest) · `npm run test:e2e` (playwright)
- Run web: `npm run dev:web` (Vite) · Run API: `npm run dev:api` (tsx watch)
- Content: `npm run content:ingest | content:validate | content:publish`

**Riskiest area:** Two hot spots. (1) The deterministic simulation engine (`src/engine/*`) plus the ~7.4k lines of
hand-authored event-chain data (`src/data/events/*`) — this drives all gameplay state, and logic/data errors silently
corrupt a player's run (broken chains, impossible status transitions, dead-end events). Unit-test coverage here is
thin (3 spec files). (2) Server admin auth (`server/src/auth/adminAuth.ts`) — an `x-admin-email` dev-fallback header
with no production guard and a JWT verification that does not pin audience/issuer; both gate content publishing.
