# Repository Scorecard — pending-game

**Reviewed:** 2026-06-13 · **Scope:** whole repo (`main` @ `59572a1`) · **Reviewer:** repo-review

> ## ✅ Re-scored after gap-closing → **4 / 5 — Ship with minor cleanup**
> The gap-closing pass (`PLAN.md`) closed all six ⚠ behaviors, removed ~2.4k lines of dead
> scaffolding, and **deleted the insecure Fastify backend entirely** — so the two HIGH auth
> findings below are now moot (no server, no auth surface). Unit tests went **4 → 35** plus a
> green e2e smoke test; `build`, `lint`, `test`, and `test:e2e` all pass (now **41 unit tests**).
> **Now passing:** legal traps fire *in actual play* for the main cast — the EWI catch-22 (Elena),
> the H-1B 60-day grace clock (David), and the unlawful-presence bars (monthly accrual + departure);
> Maria's `daca→i485-pending` path works; save/resume restores debt; achievements unlock; 3
> duplicate ids + 11 dead-end links fixed; Spanish removed.
> **Remaining (documented, out of SPEC scope):** a few edge traps (aging-out, AR-11, asylum
> 1-year deadline) stay dormant — they have no subject in the current 4-character cast or would
> need dedicated content beats. Green-card/citizenship triumph ribbons can't unlock because no
> storyline reaches a green-card win-state. Bundle is 1.4 MB (no code-splitting). Minor leftover:
> `LocaleCode` still lists `'es'`.
>
> **Original assessment (pre-gap-closing) preserved below for the record.**

## Health: 2 / 5 — **Needs work** _(original — now superseded)_

**Recommended action (original):** It builds and the happy path runs, but several *core* gameplay mechanics are silently broken, the optional backend ships a default-open admin bypass, and ~2.4k lines are dead scaffolding. Fix the handful of high-severity correctness + auth bugs, then delete the unused code; it is not "production" despite the framing.

---

## About this repo

"Pending" is an educational, deterministic immigration life-simulation game. The player guides a character (Maria, David, Elena, Fatima) month-by-month through the U.S. immigration system, making branching decisions while managing finances, relationships, stress, legal status, and form lifecycles, with an in-game glossary and achievements teaching real concepts. It is a React 19 + TypeScript / Vite SPA (Tailwind, Radix, Zustand, Motion, i18next en/es) with a pure-TS simulation engine, a large hand-authored event-chain dataset, and a thin, optional Fastify API for content bundles, telemetry, and admin publishing.

**Stack:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind 3 · Zustand · Motion · i18next · Fastify 5 · Zod · Vitest · Playwright
**Commands:** install `npm install` · build `npm run build` · lint `npm run lint` · test `npm run test` / `npm run test:e2e` · run `npm run dev:web` + `npm run dev:api`

---

## Phase 1 — Does it work? *(does-it-run verdict, verbatim)*

- **Builds:** yes — `tsc -b && vite build` + `tsc -p server/tsconfig.json` both exit 0; only warnings are lottie `eval` and 1.37 MB chunk size
- **Tests:** pass — 4/4 unit tests pass (3 files); e2e blocked (not a test failure, infrastructure mismatch)
- **Runs:** yes — web dev server returns HTTP 200 on `http://localhost:5002/`; API returns `{"status":"ok"}` on `http://localhost:8080/v1/health`
- **Blockers:** e2e only — `playwright.config.ts` line 17 has hardcoded path `/Users/rey/Desktop/01-Active-Projects/pending-game` which does not exist; no code blockers otherwise; 37 npm audit vulnerabilities (3 critical / 16 high, no criticals that block runtime)

---

## Phase 2 — Top correctness issues *(verified)*

1. **Legal "traps" never fire** — `src/data/traps.ts` declares every numeric trigger (`unlawfulPresenceDays`, `childAge`, `monthsSinceArrival`…) as `type: 'stat'`, but `conditionEvaluator` only reads four real stats for that type, so all resolve to `0` and the condition is always false. The aging-out, 3-/10-year bar, asylum-deadline, H-1B-60-day, and AR-11 traps — the educational core — **never trigger**. Should be `type: 'flag'`. *(high)*
2. **Maria's central storyline can dead-end** — `useCharacterStore.ts:207-219` seeds a per-character `validTransitions` map that `isStatusTransitionAllowed` prioritizes over the engine map; for `daca` it omits `i485-pending`, so the marriage/green-card outcome at `maria-chains.ts:470` (`status-change → i485-pending`) is silently blocked. The two transition maps disagree. *(high)*
3. **Content bundle cache always misses** — `bundleLoader.ts` reads the cache with the *requested* version (`'latest'`) but `bundleCache.ts` writes under the *resolved* version (`v1`/`local-en`), so keys never match and the bundle is re-fetched/rebuilt on every load. *(high)* — *Also:* bar traps emit invalid status targets (`barred-3-year`…) that get dropped; `useSaveStore` drops `monthlyDebtPayment` (+ several stats) on load so debt stops paying down after any save-load. *(high/medium)*

---

## Phase 3 — Overbuilt check *(simplifier)*

**Verdict: SIGNIFICANTLY overbuilt** — a solo-dev SPA ships an unused backend (committed twice as `src` + `dist`), two unused cloud SDKs, a fully-dead achievement subsystem, and a stubbed content pipeline — ~2,200–2,400 deletable lines with no feature loss.

1. **Entire `server/` is unused by the game** (~870 lines) — the client runs fully from static/in-memory bundles; only `GET /content/bundle` is ever conditionally called. Plus committed build output `server/dist/` (11 `.js` files, not gitignored) and `server/logs/`.
2. **Dead achievement subsystem** (~1,100 lines) — `unlockAchievement`/`checkAndUnlock` are never called; data, store, and 3 display components are unreachable. Also `@google-cloud/firestore` + `@google-cloud/storage` deps are never imported anywhere.
3. **Stub content pipeline** (~150 lines) — `scripts/{ingest-uscis,ingest-visa-bulletin,sync-google-sheets,optimize-assets}.ts` are explicit placeholders producing nothing the game uses; the `content/` tree duplicates the live `public/content/` bundles. Plus ~140 lines of unused UI exports (`GlossaryText.tsx`, etc.).

*(Checked & cleared: the 12 Zustand stores are distinct, not redundant; the large event/glossary/traps data files are the actual product.)*

---

## Phase 4 — Security *(high / medium only)*

1. **HIGH — Admin auth bypass in default prod** (`server/src/auth/adminAuth.ts:38-44`). The `x-admin-email` dev header is not gated by `NODE_ENV`, and the check is `allowedEmails.size === 0 || …`; with `ADMIN_ALLOWED_EMAILS` unset (the default), any request with `x-admin-email: anything` is granted admin *before* the JWT check — full takeover of `/v1/admin/content/{import,publish}`. Fix: gate on `NODE_ENV !== 'production'` and fail closed on an empty allowlist.
2. **HIGH — JWT not pinned to audience/issuer** (`adminAuth.ts:18`). `jwtVerify(token, googleJwks)` validates only the signature against Google's shared JWKS, so *any* Google-signed ID token (from any unrelated OAuth app) carrying an allowlisted email passes. Fix: pass `issuer`/`audience` and require `email_verified`.
3. **MEDIUM — Path traversal on public content routes** (`contentStore.ts` via `routes/content.ts` & `legal.ts`): the `version` query param flows unvalidated into `path.join` (admin routes validate it; public ones don't). Constrained by a forced `bundle-*.{en,es}.json` shape but still an unbounded read primitive. *(Plus: telemetry salt defaults to a constant `'pending-dev-salt'`; CORS defaults to reflect-any-origin.)*

*(Checked & safe: no committed secrets/PII — `telemetry.ndjson` is gitignored; POST bodies are Zod-validated; no `dangerouslySetInnerHTML`/`eval` in `src`; ingest scripts fetch hardcoded URLs (no SSRF); admin/telemetry endpoints are rate-limited.)*

---

## Bottom line

Pending compiles cleanly, runs, and is backed by a genuinely large body of hand-authored educational content — but under the surface several headline mechanics (legal traps, status bars, and one character's main green-card path) are silently non-functional, and the optional API is insecure by default. It needs a focused correctness-and-auth fix pass plus deletion of ~2.4k lines of dead scaffolding before the "production foundation" label holds.
