import { describe, expect, it, vi } from 'vitest'
import { executeOutcomes } from '@/engine/outcomeExecutor'

describe('outcome executor', () => {
  it('executes outcome list and returns executed count', () => {
    const context = {
      getFlag: vi.fn(() => undefined),
      setFlag: vi.fn(),
      modifyStat: vi.fn(),
      queueEvent: vi.fn(),
      queueScheduledEvent: vi.fn(),
      addIncome: vi.fn(),
      addExpense: vi.fn(),
      changeRelationship: vi.fn(),
      endGame: vi.fn(),
      transitionStatus: vi.fn(() => true),
      fileApplication: vi.fn(() => true),
      applyApplicationDecision: vi.fn(() => true),
      triggerTrap: vi.fn(() => true),
      addDocument: vi.fn(),
      removeDocument: vi.fn(),
      random: vi.fn(() => 0.1),
      addMonths: vi.fn((date, months) => ({ month: date.month + months, year: date.year })),
    }

    const count = executeOutcomes(
      [
        { type: 'flag-set', target: 'alpha', value: true },
        { type: 'finance-subtract', target: 'Legal fee', value: 500 },
        { type: 'status-change', target: 'i485-pending', value: true },
        { type: 'file-application', target: 'i-601a', value: true },
      ],
      { month: 1, year: 2026 },
      context
    )

    expect(count).toBe(4)
    expect(context.setFlag).toHaveBeenCalledWith('alpha', true)
    expect(context.addExpense).toHaveBeenCalledTimes(1)
    expect(context.transitionStatus).toHaveBeenCalledWith('i485-pending', expect.any(String), { month: 1, year: 2026 })
    expect(context.fileApplication).toHaveBeenCalledWith('i-601a', { month: 1, year: 2026 })
  })
})
