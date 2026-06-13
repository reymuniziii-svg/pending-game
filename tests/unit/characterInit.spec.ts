import { beforeEach, describe, expect, it } from 'vitest'
// SPEC behavior 1: picking any of the four characters starts a game with that character's
// correct starting situation. Profiles currently live as a non-exported array inside the
// CharacterSelect component; this test expects them extracted to importable data so they can
// be verified, and it also pins the daca -> i485-pending path that Maria's storyline needs.
import { CHARACTER_PROFILES } from '@/data/characters'
import { useCharacterStore } from '@/stores/useCharacterStore'

describe('character initialization (start a run)', () => {
  beforeEach(() => {
    useCharacterStore.getState().reset()
  })

  it('ships exactly the four playable characters', () => {
    expect(CHARACTER_PROFILES.map((p) => p.id).sort()).toEqual(['david', 'elena', 'fatima', 'maria'])
  })

  it('starts Maria on DACA', () => {
    const maria = CHARACTER_PROFILES.find((p) => p.id === 'maria')
    expect(maria?.initialStatus).toBe('daca')
  })

  it('initializes each character with their own starting status and stats', () => {
    for (const profile of CHARACTER_PROFILES) {
      useCharacterStore.getState().initializeCharacter(profile, { day: 1, month: 1, year: 2026 })
      const state = useCharacterStore.getState()
      expect(state.status?.type).toBe(profile.initialStatus)
      expect(state.stats).toEqual(profile.initialStats)
    }
  })

  it('lets Maria pursue a green card (daca -> i485-pending is a valid transition)', () => {
    const maria = CHARACTER_PROFILES.find((p) => p.id === 'maria')!
    useCharacterStore.getState().initializeCharacter(maria, { day: 1, month: 1, year: 2026 })
    expect(useCharacterStore.getState().status?.validTransitions).toContain('i485-pending')
  })
})
