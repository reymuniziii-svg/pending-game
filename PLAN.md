# PLAN — Close the gap to SPEC.md

Derived from `SPEC.md` (the source of truth) and the Phase 1 test run. Scope is **only** SPEC gaps.
Each item's **Done** = a named test going green. Nothing here adds features beyond SPEC.

## Phase 1 result (the gap)

`npm run test` → **16 passed / 15 failed** (11 files). Passing = working behaviors (engine
invariants, glossary, outcome execution, conditions, rng, chain-ref integrity). Failing files
are the gap:

| Test (Done condition) | Failing because | SPEC behavior |
|---|---|---|
| `trapProcessor.spec.ts` | numeric trap triggers use `type:'stat'` → resolve to 0 → never fire | #4 |
| `characterInit.spec.ts` | profiles not importable as data; `daca→i485-pending` blocked by store's divergent `validTransitions` | #1, #4 |
| `saveResume.spec.ts` | `monthlyDebtPayment` + `incomeSource` never serialized/restored | #6 |
| `achievements.spec.ts` | no condition data, no evaluator, never called | #5 |
| `eventData.spec.ts` | 3 duplicate event ids + 11 `nextEventId`s pointing to non-existent events (dead-ends) | #2 |
| `repoHygiene.spec.ts` | unused `server/`, stub scripts, `@google-cloud/*` deps, `es` locale still present | out-of-scope cuts |
| e2e smoke (blocked) | stale `01-Active-Projects` path in `playwright.config.ts` | #2 build/deploy |

## Workstreams (file-disjoint → parallel-safe; ordered by importance)

Each touches a non-overlapping set of files (verified), so they can run in any order or in
parallel without collision. Listed in recommended execution order.

### WS-EVENTS — no dead-ends (SPEC #2)  ·  files: `src/data/events/*`
- Dedupe 3 ids: `maria_license_renewal`, `fatima_nightmare`, `elena_driving_fear`.
- Resolve 11 broken `nextEventId` refs (in maria/elena/fatima chains): for each, point the
  choice at the correct existing event, or author the minimal missing connective/ending event
  the narrative clearly intends. No new storylines — only repair the broken links.
- **Done:** `eventData.spec.ts` green (4/4).

### WS-TRAPS — legal traps fire (SPEC #4)  ·  files: `src/data/traps.ts`
- Change numeric triggers from `type:'stat'` → `type:'flag'` (`childAge`, `unlawfulPresenceDays`,
  `monthsSinceArrival`, `daysSinceTermination`, `daysSinceMove`).
- Change the three bar consequences from `status-change: barred-*` (not real statuses, silently
  dropped) to `flag-set` (`barred_3_year` / `barred_10_year` / `permanent_bar`) so the bar has a
  real, observable effect.
- **Done:** `trapProcessor.spec.ts` green (5/5).

### WS-STATUS — Maria's green-card path + start-a-run (SPEC #1, #4)  ·  files: `src/engine/statusTransition.ts`, `src/stores/useCharacterStore.ts`, **new** `src/data/characters.ts`, `src/components/screens/CharacterSelect.tsx`
- Make `transitionMap` the single source of truth: export `getValidTransitions(status)` from
  `statusTransition.ts`; delete the divergent copy in `useCharacterStore.ts` and import the engine one.
- Extract the `PROFILES` array out of `CharacterSelect.tsx` into `src/data/characters.ts`
  (`export const CHARACTER_PROFILES`); import it back into the component (no UI change).
- **Done:** `characterInit.spec.ts` green + `statusTransition.spec.ts` still green.

### WS-SAVE — save/resume restores everything (SPEC #6)  ·  files: `src/types/index.ts`, `src/stores/useSaveStore.ts`
- Add `monthlyDebtPayment` + `incomeSource` (and the dropped cumulative stats: `peakBalance`,
  `lowestBalance`, `totalImmigrationSpending`, `totalRemittancesSent`, `paidFees`) to
  `SaveData.financeState`; serialize and restore them in `applySaveToStores`.
- **Done:** `saveResume.spec.ts` green (2/2).

### WS-ACHIEVEMENTS — achievements unlock (SPEC #5)  ·  files: `src/data/achievements.ts`, `src/hooks/useEventEngine.ts`
- Add `ACHIEVEMENT_CONDITIONS: AchievementCondition[]` + `evaluateAchievements(state)` to
  `achievements.ts`, covering the evaluable achievements (time-/status-/finance-/stat-/flag-based).
- Wire it in: build `AchievementCheckState` from the stores and call
  `useAchievementStore.checkAndUnlock(evaluateAchievements(...))` in `processMonthlySystems` and
  after a choice is resolved. (The `<AchievementNotification />` UI already mounts in GameScreen.)
- **Done:** `achievements.spec.ts` green (4/4).

### WS-HYGIENE — deletions (SPEC out-of-scope cuts)  ·  files: `server/` (del), `scripts/*` (del), `content/` (del), `src/assets/generated-manifest/` (del), `package.json`, `src/i18n/index.ts`, `src/i18n/locales/es/` (del), `src/components/ui/GameSettingsPanel.tsx`, `src/components/screens/TitleScreen.tsx`, `src/stores/useSettingsStore.ts`
- Delete the whole `server/` tree (unused; carries the auth bypass) and its `dist`/`logs`.
- Delete stub scripts (`ingest-uscis`, `ingest-visa-bulletin`, `sync-google-sheets`, `optimize-assets`)
  and the dead `content/` pipeline I/O tree.
- `package.json`: remove server-only deps (`@google-cloud/firestore`, `@google-cloud/storage`,
  `fastify`, `@fastify/*`, `jose`, `pino`) and the `dev:api` / `build:api` / `content:*` scripts;
  point `build` at web only.
- Remove Spanish: delete `locales/es/`, drop `es` from `i18n/index.ts`, and remove the `es`
  language toggle from `TitleScreen` + `GameSettingsPanel` (English-only).
- **Done:** `repoHygiene.spec.ts` green (4/4) **and** `npm run build` + `npm run lint` pass.

### WS-E2E — unblock e2e (SPEC #2)  ·  files: `playwright.config.ts`
- Fix `webServer.command`: drop the stale `cd /Users/rey/Desktop/01-Active-Projects/...` prefix
  (Playwright already runs from the project root). Disclaimer is already rendered (`App.tsx:36`).
- **Done:** `npm run test:e2e` runs and the smoke test passes.

## Execution strategy (Phase 3)

**Single focused in-session, serial, test-after-each-workstream.** Rationale per the parallelism
guardrails: the workstreams are partitioned for safety, but I already hold full context on every
file, and several items need authoring judgment (the narrative dead-ends, the store reconciliation,
the achievement wiring) that is safer with one hand on the wheel than fanned across worktree agents.
Coordination + re-read overhead of an agent team would exceed the work here, and the heavy parallel
tooling is gated/experimental. A serial build that finishes beats a parallel setup that won't start.
(The partition above means we *can* escalate to a worktree-per-workstream agent team if you'd rather.)

After all workstreams: run the full unit suite (expect all green), `npm run build`, `npm run lint`,
`npm run test:e2e`, then re-run `/repo-review` for a fresh-context check and an adversarial diff
review against SPEC.

## Explicitly out of scope

- No backend rebuild. The **live visa-bulletin/USCIS data feed stays on the roadmap, not built now.**
- No Spanish (being removed). No telemetry/analytics. No new gameplay features or storylines.
- No visual/UX overhaul, no performance work, no dependency upgrades, no fixing the 37 npm-audit
  vulns (not a SPEC gap).
- Event repair fixes only the 11 broken links + 3 dupes — it does not rebalance or expand content.
- Achievements wire the evaluable set; no new events are authored just to source an achievement flag.
