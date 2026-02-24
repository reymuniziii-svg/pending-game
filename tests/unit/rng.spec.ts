import { describe, expect, it } from 'vitest'
import { seededFloat, weightedPick } from '@/engine/rng'

describe('rng', () => {
  it('returns deterministic floats for same seed/stream/turn', () => {
    const a = seededFloat('seed-a', 'events', 4)
    const b = seededFloat('seed-a', 'events', 4)
    expect(a).toBe(b)
  })

  it('weightedPick chooses an item from list', () => {
    const selected = weightedPick(
      [
        { id: 'a', weight: 1 },
        { id: 'b', weight: 10 },
      ],
      0.9
    )

    expect(selected).not.toBeNull()
    expect(['a', 'b']).toContain(selected?.id)
  })
})
