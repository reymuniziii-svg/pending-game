import { beforeEach, describe, expect, it } from 'vitest'
// SPEC behavior 5 (GAP): achievements unlock when their conditions are met.
// achievements.ts defines the Achievement[] data and the AchievementCondition/
// AchievementCheckState *types*, but there is no array of condition checks and no
// evaluator, and nothing in gameplay ever calls the achievement store. This test
// pins the contract of an `evaluateAchievements(state)` evaluator (to be added) and
// confirms the store unlocks what the evaluator reports.
import { evaluateAchievements } from '@/data/achievements'
import { useAchievementStore } from '@/stores/useAchievementStore'
import type { AchievementCheckState } from '@/data/achievements'

const baseState: AchievementCheckState = {
  totalDaysElapsed: 0,
  currentStatus: 'daca',
  eventsCompleted: [],
  choicesMade: {},
  stats: { health: 80, stress: 20, wellbeing: 50, stability: 50 },
  finances: { bankBalance: 1000, totalSpent: 0, totalEarned: 0 },
  relationships: {},
  flags: {},
  characterId: 'maria',
}

describe('achievement evaluation', () => {
  beforeEach(() => {
    useAchievementStore.getState().resetAchievements()
  })

  it('unlocks First Steps at the start of a run', () => {
    expect(evaluateAchievements(baseState)).toContain('first-steps')
  })

  it('unlocks Year One only after a full year', () => {
    expect(evaluateAchievements({ ...baseState, totalDaysElapsed: 100 })).not.toContain('year-one')
    expect(evaluateAchievements({ ...baseState, totalDaysElapsed: 400 })).toContain('year-one')
  })

  it('unlocks the citizenship and green-card ribbons at the matching status', () => {
    expect(evaluateAchievements({ ...baseState, currentStatus: 'naturalized-citizen' })).toContain('ribbon-citizen')
    expect(evaluateAchievements({ ...baseState, currentStatus: 'green-card-permanent' })).toContain(
      'ribbon-permanent-resident'
    )
  })

  it('records evaluated achievements in the store exactly once', () => {
    const ids = evaluateAchievements({ ...baseState, totalDaysElapsed: 400 })
    const firstPass = useAchievementStore.getState().checkAndUnlock(ids)
    expect(firstPass).toContain('year-one')
    expect(useAchievementStore.getState().hasUnlocked('year-one')).toBe(true)
    // Re-checking the same ids must not unlock anything again.
    expect(useAchievementStore.getState().checkAndUnlock(ids)).toEqual([])
  })
})
