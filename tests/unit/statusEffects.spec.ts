import { describe, expect, it } from 'vitest'
import { accrueMonthlyStatusEffects, shouldTriggerStressCrisis } from '@/engine/statusEffects'
import { processPolicyTraps } from '@/engine/trapProcessor'
import { EVENTS } from '@/data/events'
import type { EventOutcome, ImmigrationStatusType } from '@/types'

// SPEC behavior 4: legal traps fire when their real-world conditions are met — IN ACTUAL PLAY.
// trapProcessor.spec proves the trap engine fires given the right inputs; this proves the game
// actually produces those inputs: events set the boolean preconditions, and the monthly accrual
// advances the time-based clocks until a trap trips.

type Flags = Record<string, string | number | boolean | undefined>

function makeStore(initial: Flags = {}) {
  const flags: Flags = { ...initial }
  return {
    flags,
    getFlag: (key: string) => flags[key],
    setFlag: (key: string, value: string | number | boolean) => {
      flags[key] = value
    },
  }
}

function makeTrapContext(
  flags: Flags,
  statusType: ImmigrationStatusType,
  store: { getFlag: (k: string) => string | number | boolean | undefined; setFlag: (k: string, v: string | number | boolean) => void }
) {
  const date = { day: 1, month: 1, year: 2026 }
  return {
    statusType,
    flags,
    bankBalance: 0,
    relationships: {},
    stats: { health: 50, stress: 50, englishProficiency: 50, communityConnection: 50 },
    date,
    currentDate: date,
    getFlag: store.getFlag,
    setFlag: store.setFlag,
  }
}

describe('monthly status effects drive traps end-to-end', () => {
  it('accrues unlawful presence so the 10-year bar fires after a departure', () => {
    const store = makeStore()
    const status = { unlawfulPresenceDays: 0 }
    const addUnlawfulPresenceDays = (days: number) => {
      status.unlawfulPresenceDays += days
    }

    // A year out of status.
    for (let month = 0; month < 13; month++) {
      accrueMonthlyStatusEffects({
        statusType: 'undocumented',
        getFlag: store.getFlag,
        setFlag: store.setFlag,
        addUnlawfulPresenceDays,
      })
    }
    expect(status.unlawfulPresenceDays).toBeGreaterThanOrEqual(365)

    store.setFlag('departed_us', true)
    const ctx = makeTrapContext(
      { ...store.flags, unlawfulPresenceDays: status.unlawfulPresenceDays },
      'undocumented',
      store
    )
    const applied: EventOutcome[] = []
    const triggered = processPolicyTraps(ctx, (o) => applied.push(o))
    expect(triggered).toContain('trap_10_year_bar')
    expect(applied.length).toBeGreaterThan(0)
  })

  it('runs the H-1B grace clock so the 60-day trap fires when no sponsor is found', () => {
    const store = makeStore({ h1b_terminated: true })
    const noop = () => {}

    // Three months in the grace period with no new sponsor.
    for (let month = 0; month < 3; month++) {
      accrueMonthlyStatusEffects({
        statusType: 'h1b-active',
        getFlag: store.getFlag,
        setFlag: store.setFlag,
        addUnlawfulPresenceDays: noop,
      })
    }
    expect(Number(store.flags.daysSinceTermination)).toBeGreaterThan(60)

    const ctx = makeTrapContext(store.flags, 'h1b-active', store)
    const triggered = processPolicyTraps(ctx, () => {})
    expect(triggered).toContain('trap_60_day_clock')
  })

  it('stops the H-1B clock once a new sponsor is found', () => {
    const store = makeStore({ h1b_terminated: true, found_new_sponsor: true })
    accrueMonthlyStatusEffects({
      statusType: 'h1b-active',
      getFlag: store.getFlag,
      setFlag: store.setFlag,
      addUnlawfulPresenceDays: () => {},
    })
    expect(store.flags.daysSinceTermination).toBeUndefined()
  })
})

describe('shouldTriggerStressCrisis', () => {
  it('returns true when stress is 100 and the crisis has not fired', () => {
    const flags: Record<string, string | number | boolean | undefined> = {}
    expect(shouldTriggerStressCrisis({ stress: 100 }, (k) => flags[k])).toBe(true)
  })

  it('returns false after the crisis flag is set', () => {
    const flags: Record<string, string | number | boolean | undefined> = { stress_crisis_fired: true }
    expect(shouldTriggerStressCrisis({ stress: 100 }, (k) => flags[k])).toBe(false)
  })

  it('returns false when stress is below 100', () => {
    const flags: Record<string, string | number | boolean | undefined> = {}
    expect(shouldTriggerStressCrisis({ stress: 99 }, (k) => flags[k])).toBe(false)
  })
})

describe('events set the trap preconditions the engine expects', () => {
  it('Elena\'s waiver consultation records EWI + marriage to a citizen', () => {
    const elenaStart = EVENTS.find((e) => e.id === 'elena_chain_waiver_start')
    expect(elenaStart).toBeDefined()
    const flagTargets = (elenaStart?.choices ?? [])
      .flatMap((c) => c.outcomes)
      .filter((o) => o.type === 'flag-set')
      .map((o) => o.target)
    expect(flagTargets).toContain('entered_without_inspection')
    expect(flagTargets).toContain('married_to_usc')
  })

  it('David being laid off sets h1b_terminated', () => {
    const result = EVENTS.find((e) => e.id === 'david_chain_layoff_result')
    const laidOff = result?.choices.find((c) => c.id === 'laid_off')
    expect(laidOff?.outcomes.some((o) => o.type === 'flag-set' && o.target === 'h1b_terminated')).toBe(true)
  })

  it('the EWI catch-22 trap fires once Elena\'s flags are set', () => {
    const store = makeStore({ entered_without_inspection: true, married_to_usc: true })
    const ctx = makeTrapContext(store.flags, 'undocumented', store)
    const triggered = processPolicyTraps(ctx, () => {})
    expect(triggered).toContain('trap_ewi_catch22')
  })
})
