import { describe, expect, it } from 'vitest'
import { processPolicyTraps } from '@/engine/trapProcessor'
import type { EventOutcome, ImmigrationStatusType } from '@/types'

// SPEC behavior 4 (GAP): legal "traps" fire when their real-world conditions are met.
// Today the numeric triggers in src/data/traps.ts use type:'stat' (which only resolves
// the four CharacterStats), so the values live in `flags` and every numeric trap silently
// resolves to 0 and never fires.

function makeContext(
  flags: Record<string, string | number | boolean>,
  statusType: ImmigrationStatusType = 'undocumented'
) {
  const store: Record<string, string | number | boolean | undefined> = { ...flags }
  const date = { day: 1, month: 1, year: 2026 }
  return {
    statusType,
    flags: store,
    bankBalance: 0,
    relationships: {},
    stats: { health: 50, stress: 50, englishProficiency: 50, communityConnection: 50 },
    date,
    currentDate: date,
    getFlag: (key: string) => store[key],
    setFlag: (key: string, value: string | number | boolean) => {
      store[key] = value
    },
  }
}

describe('policy trap processor', () => {
  it('fires the 10-year bar after 365+ unlawful-presence days and a departure', () => {
    const applied: EventOutcome[] = []
    const ctx = makeContext({ unlawfulPresenceDays: 400, departed_us: true })
    const triggered = processPolicyTraps(ctx, (o) => applied.push(o))
    expect(triggered).toContain('trap_10_year_bar')
    expect(applied.length).toBeGreaterThan(0)
  })

  it('fires the asylum one-year deadline trap', () => {
    const ctx = makeContext({ monthsSinceArrival: 14, seeking_asylum: true })
    const triggered = processPolicyTraps(ctx, () => {})
    expect(triggered).toContain('trap_1_year_asylum_deadline')
  })

  it('fires the aging-out trap once a derivative child turns 21', () => {
    const ctx = makeContext({ childAge: 22, has_pending_family_petition: true })
    const triggered = processPolicyTraps(ctx, () => {})
    expect(triggered).toContain('trap_aging_out')
  })

  it('does NOT fire the bar without a departure (true negative)', () => {
    const ctx = makeContext({ unlawfulPresenceDays: 400 })
    const triggered = processPolicyTraps(ctx, () => {})
    expect(triggered).not.toContain('trap_10_year_bar')
  })

  it('does not re-fire a trap already marked triggered', () => {
    const ctx = makeContext({ unlawfulPresenceDays: 400, departed_us: true, trap_10_year_bar_triggered: true })
    const triggered = processPolicyTraps(ctx, () => {})
    expect(triggered).not.toContain('trap_10_year_bar')
  })
})
