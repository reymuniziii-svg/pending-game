import { describe, expect, it } from 'vitest'
import { EVENTS, EVENT_CHAINS } from '@/data/events'
import { getNextChainEventId } from '@/engine/chainRunner'

// SPEC behavior 2: the run never dead-ends — every explicit link resolves to a real event.
describe('event data integrity (no dead ends)', () => {
  const eventIds = new Set(EVENTS.map((e) => e.id))

  it('has unique event ids', () => {
    expect(eventIds.size).toBe(EVENTS.length)
  })

  it('every choice.nextEventId points to an existing event', () => {
    const broken: string[] = []
    for (const event of EVENTS) {
      for (const choice of event.choices) {
        if (choice.nextEventId && !eventIds.has(choice.nextEventId)) {
          broken.push(`${event.id} / ${choice.id} -> ${choice.nextEventId}`)
        }
      }
    }
    expect(broken).toEqual([])
  })

  it('every event in a chain exists, and chain steps resolve to real events', () => {
    const brokenRefs: string[] = []
    const brokenSteps: string[] = []
    for (const chain of EVENT_CHAINS) {
      for (const id of chain.eventIds) {
        if (!eventIds.has(id)) brokenRefs.push(`${chain.id} -> ${id}`)
      }
      for (const id of chain.eventIds) {
        const next = getNextChainEventId(chain, id)
        if (next && !eventIds.has(next)) brokenSteps.push(`${chain.id}: ${id} -> ${next}`)
      }
    }
    expect(brokenRefs).toEqual([])
    expect(brokenSteps).toEqual([])
  })

  it('every event has at least one choice so the player is never stuck', () => {
    const choiceless = EVENTS.filter((e) => !e.choices || e.choices.length === 0).map((e) => e.id)
    expect(choiceless).toEqual([])
  })
})

// M3 fix verification: both David chain-start events are reachable from month 12.
describe('David H-1B layoff chain reachability', () => {
  it('layoff and backlog chains both start from month 12 (same window)', () => {
    const layoff = EVENTS.find((e) => e.id === 'david_chain_layoff_start')
    const backlog = EVENTS.find((e) => e.id === 'david_chain_backlog_start')
    expect(layoff).toBeDefined()
    expect(backlog).toBeDefined()
    const layoffTiming = layoff!.timing as { earliestMonth?: number }
    const backlogTiming = backlog!.timing as { earliestMonth?: number }
    expect(layoffTiming.earliestMonth).toBe(12)
    expect(backlogTiming.earliestMonth).toBe(12)
  })

  it('layoff chain has higher or equal weight than backlog chain after rebalance', () => {
    const layoff = EVENTS.find((e) => e.id === 'david_chain_layoff_start')!
    const backlog = EVENTS.find((e) => e.id === 'david_chain_backlog_start')!
    expect(layoff.weight).toBeGreaterThan(backlog.weight)
  })
})
