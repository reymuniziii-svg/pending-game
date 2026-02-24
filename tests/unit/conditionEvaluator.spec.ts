import { describe, expect, it } from 'vitest'
import { evaluateConditions } from '@/engine/conditionEvaluator'

describe('condition evaluator', () => {
  it('evaluates mixed conditions correctly', () => {
    const result = evaluateConditions(
      [
        { type: 'status', target: 'type', operator: '==', value: 'daca' },
        { type: 'finance', target: 'balance', operator: '>=', value: 1000 },
        { type: 'flag', target: 'engaged', operator: '==', value: true },
      ],
      {
        statusType: 'daca',
        flags: { engaged: true },
        bankBalance: 2500,
        relationships: {},
        stats: { health: 70, stress: 40, englishProficiency: 80, communityConnection: 55 },
        date: { month: 2, year: 2026 },
        characterId: 'maria',
      }
    )

    expect(result).toBe(true)
  })
})
