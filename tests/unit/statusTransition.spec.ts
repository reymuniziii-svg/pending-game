import { describe, expect, it } from 'vitest'
import { isStatusTransitionAllowed, buildNextStatus } from '@/engine/statusTransition'
import type { ImmigrationStatus } from '@/types'

// SPEC behavior 4 (regression guard): status transitions follow legal rules.
describe('status transition engine', () => {
  it('allows same-status (renewal) transitions', () => {
    expect(isStatusTransitionAllowed('daca', 'daca')).toBe(true)
  })

  it('allows the green-card progression chain', () => {
    expect(isStatusTransitionAllowed('i485-pending', 'green-card-conditional')).toBe(true)
    expect(isStatusTransitionAllowed('green-card-conditional', 'green-card-permanent')).toBe(true)
    expect(isStatusTransitionAllowed('green-card-permanent', 'naturalized-citizen')).toBe(true)
  })

  it('rejects impossible transitions', () => {
    expect(isStatusTransitionAllowed('daca', 'naturalized-citizen')).toBe(false)
    expect(isStatusTransitionAllowed('undocumented', 'green-card-permanent')).toBe(false)
  })

  it('derives work authorization and travel flags for the target status', () => {
    const current = { type: 'daca', startDate: { day: 1, month: 1, year: 2026 } } as unknown as ImmigrationStatus
    const next = buildNextStatus(current, 'green-card-permanent')
    expect(next.type).toBe('green-card-permanent')
    expect(next.workAuthorized).toBe(true)
    expect(next.canTravel).toBe(true)
  })
})
