# SPEC — Pending

> The intent behind this project, in the owner's words. The code shows what was *built*; this file records what it's *meant to be*. Where they disagree, this file wins.
>
> Captured 2026-06-13 via interview.

## Purpose

A **portfolio / personal project** — a craft showcase, not a commercial product. *Pending* is an interactive, narrative life-simulation about navigating the U.S. immigration system: you guide one of four characters month-by-month through real bureaucratic mechanics, making branching choices with hard trade-offs. It exists to demonstrate skill across four dimensions **at once** — gameplay/narrative, visual/interaction design, engineering, and conceptual/domain depth. Success = it's polished, impressive, and original when someone opens it.

## Who / what it serves

Someone who **opens and plays it** — a reviewer, recruiter, peer, or visitor evaluating the work (and the maker). It is judged by being *played once* and landing across all four axes. There is no external end-user or downstream system consuming it; it is a **self-contained, client-side experience**. Practical implication: it must deploy as a static site that is always up and loads instantly.

## Definition of good

"Good" means it lands on all four at the same time:

- **Gameplay & narrative** — genuinely engaging: meaningful choices, branching stories, emotional weight.
- **Visual & interaction design** — premium polish: animation, transitions, scene art, UI craft, moment-to-moment feel.
- **Engineering architecture** — clean, impressive engineering, with the **deterministic simulation engine as the centerpiece**; no dead or broken code undermining the story.
- **Concept & domain depth** — an original idea backed by well-researched immigration detail.

"Done" = a player can complete a full, satisfying run that exercises all four, with nothing visibly broken and no embarrassing dead code or security holes left in the repo.

## Must-work behaviors

*(Drafted from the actual game loop — to confirm. Several currently fail; see checklist.)*

1. **Start a run** — when a player picks any of the four characters, the game initializes that character's correct starting situation (status, finances, relationships) and drops into a playable game screen.
2. **The core loop turns** — when the player advances time, months progress and events/decisions arrive on schedule, and the run never dead-ends (every event leads to a next event, a quiet period, or an ending).
3. **Decisions have correct consequences** — when the player makes a choice, its authored consequences apply correctly (stats, money, legal status, relationships) and the player gets clear visual feedback on what changed.
4. **The educational simulation is correct** — when conditions are met, the real mechanics behave: clicking a real immigration term explains it (glossary); status transitions follow legal rules (valid storylines like Maria's marriage→green-card path can complete; impossible transitions are blocked); and legal "traps" (bars, deadlines, aging out) fire.
5. **Runs reach a meaningful ending** — when a run resolves (money runs out, a status is achieved, a deadline is missed), the game ends and shows an ending screen that reflects what happened, and relevant achievements unlock.
6. **Save & resume** — when a player saves and later reloads, the full run restores (status, finances including debt, progress, relationships) with no silent state loss.

## Out of scope

Explicitly **not** part of this project (cut as scope creep that distracts from the showcase):

- **Backend / Fastify API** — removed. The game is self-contained and client-side.
- **Bespoke telemetry / analytics** — removed. (If analytics is ever wanted on a deployed build, use a hosted snippet, not a custom endpoint.)
- **Content ingest / publish pipeline** — removed (it was stubs). Content stays hand-authored in `src/data`, guarded by a **slim Zod validation check** at build time.
- **Spanish / bilingual support** — cut for now. English-only; remove the half-built `es` scaffolding.
- Not a tool for real immigrants, not legal advice, not a classroom/advocacy deliverable.
- No multiplayer, no user accounts, no auth.

## Roadmap (intended, but not now)

- **Live visa-bulletin / USCIS data feed** — a real data source that keeps in-game timelines and priority dates current. This is a genuine intended future feature (the one piece of "production infrastructure" worth building toward), and would likely reintroduce a small backend at that point. Build *toward* it; do not build it now.

## Constraints

- **Stack is fixed:** React 19 + TypeScript, Vite, Tailwind, Zustand, Motion, Radix, Lottie, seedrandom. Vitest (unit) + Playwright/axe (e2e/a11y) for tests.
- **Client-only / statically deployable** — must load fast and stay up with no server running.
- **English-only.**
- **Deterministic engine** (seeded RNG) is preserved — it enables reproducible runs and reliable saves, and it's the engineering centerpiece.
- **Immigration content:** well-researched but **dramatized** for gameplay (timelines/odds may be tuned for pacing; minor liberties OK). A clear **"educational, not legal advice" disclaimer** must be visible in-app.

---

## Test checklist

Each must-work behavior as a plain pass/fail check. The vision-vs-reality gap = which of these currently fail (⚠ marks ones my review found broken today).

**Start a run**
- ☐ Selecting each of the four characters starts a game with that character's correct starting status, finances, and situation.
- ☐ The game screen loads and is immediately playable (no crash, no blank state).

**Core loop**
- ☐ Advancing time moves the calendar forward and events/decisions arrive.
- ☐ No event or chain dead-ends — every event leads to a next event, a quiet period, or an ending.

**Decisions & consequences**
- ☐ Making a choice changes the correct stats / money / status / relationships as authored.
- ☐ The player sees clear feedback (stat deltas, outcome narrative) after each choice.

**Educational simulation correctness**
- ☐ Clicking a highlighted immigration term opens its glossary definition.
- ⚠ ☐ A valid central storyline completes — Maria's marriage → green-card path reaches `i485-pending` instead of being silently blocked. *(currently fails: divergent transition maps)*
- ☐ Impossible status transitions are rejected.
- ⚠ ☐ Legal traps fire when their conditions are met (unlawful-presence bar, asylum 1-year deadline, aging out, etc.). *(currently fails: traps use `type:'stat'` and never trigger)*

**Endings & achievements**
- ☐ A run ends (money runs out, status resolved, or deadline missed) and shows an ending screen reflecting what happened.
- ⚠ ☐ Achievements unlock when their conditions are met and show a notification. *(currently fails: never wired up / never triggered)*

**Save & resume**
- ⚠ ☐ Saving then reloading restores the full run — including debt and its ongoing repayment — with no silent state loss. *(currently partial: `monthlyDebtPayment` + some stats not restored)*

**Repo health / showcase polish**
- ⚠ ☐ The repo contains no dead backend/pipeline/telemetry code and no auth/security holes. *(currently fails: unused server with auth bypass present)*
- ☐ A clear "educational, not legal advice" disclaimer is visible in-app.
- ⚠ ☐ The app builds and deploys as a static site, and e2e tests run. *(currently fails: stale hardcoded path in `playwright.config.ts`)*
