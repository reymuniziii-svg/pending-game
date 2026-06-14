import { beforeEach, describe, expect, it } from 'vitest'
import type { CharacterProfile } from '@/types'
import { useCharacterStore } from '@/stores/useCharacterStore'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useTimeStore } from '@/stores/useTimeStore'
import { useGameStore } from '@/stores/useGameStore'
import { useSaveStore } from '@/stores/useSaveStore'

// localStorage is not available in the node test environment — provide a minimal mock.
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value },
  removeItem: (key: string) => { delete localStorageStore[key] },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]) },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// SPEC behavior 6 (GAP): saving then reloading restores the full run — including debt and
// its ongoing repayment — with no silent state loss. Today applySaveToStores never restores
// monthlyDebtPayment (or incomeSource), so a loaded game stops paying down debt.

const mariaProfile = {
  id: 'maria',
  initialStatus: 'daca',
  initialStats: { health: 85, stress: 35, englishProficiency: 98, communityConnection: 75 },
} as unknown as CharacterProfile

const START = { day: 1, month: 1, year: 2026 }

function setupGameWithDebt() {
  useGameStore.setState({
    gameId: 'test-game',
    selectedCharacterId: 'maria',
    playTimeMinutes: 12,
    currentScreen: 'game',
  })
  useTimeStore.setState({
    currentDay: 15,
    currentMonth: 6,
    currentYear: 2027,
    startDay: 1,
    startMonth: 1,
    startYear: 2026,
    totalDaysElapsed: 530,
  })
  useCharacterStore.getState().initializeCharacter(mariaProfile, START)
  useFinanceStore.getState().initialize(3000, 4000, [], 5000)
  useFinanceStore.getState().setIncome(4000, 'Software Engineer')
}

describe('save and resume', () => {
  beforeEach(() => {
    localStorageMock.clear()
    useGameStore.getState().resetGame()
    useCharacterStore.getState().reset()
    useFinanceStore.getState().reset()
    useTimeStore.getState().reset()
  })

  it('restores debt repayment and income source after a round-trip', () => {
    setupGameWithDebt()
    const before = { ...useFinanceStore.getState() }
    expect(before.monthlyDebtPayment).toBeGreaterThan(0)

    const encoded = useSaveStore.getState().exportSave()

    useFinanceStore.getState().reset()
    expect(useFinanceStore.getState().monthlyDebtPayment).toBe(0)

    const ok = useSaveStore.getState().importSave(encoded)
    expect(ok).toBe(true)

    const after = useFinanceStore.getState()
    expect(after.bankBalance).toBe(before.bankBalance)
    expect(after.totalDebt).toBe(before.totalDebt)
    expect(after.monthlyDebtPayment).toBe(before.monthlyDebtPayment)
    expect(after.incomeSource).toBe(before.incomeSource)
  })

  it('keeps paying down debt after loading', () => {
    setupGameWithDebt()
    const encoded = useSaveStore.getState().exportSave()
    useFinanceStore.getState().reset()
    useSaveStore.getState().importSave(encoded)

    const debtBefore = useFinanceStore.getState().totalDebt
    useFinanceStore.getState().processMonthEnd({ day: 1, month: 7, year: 2027 })
    expect(useFinanceStore.getState().totalDebt).toBeLessThan(debtBefore)
  })

  it('autoSave writes to slot 0 and hasSaveInSlot(0) returns true', () => {
    setupGameWithDebt()
    useSaveStore.getState().autoSave()
    expect(useSaveStore.getState().hasSaveInSlot(0)).toBe(true)
  })

  it('loadGame(0) after autoSave restores stats and sets screen to game', () => {
    setupGameWithDebt()
    useSaveStore.getState().autoSave()

    // Reset stores as if the player reloaded the page.
    useGameStore.getState().resetGame()
    useCharacterStore.getState().reset()
    useFinanceStore.getState().reset()
    useTimeStore.getState().reset()

    const ok = useSaveStore.getState().loadGame(0)
    expect(ok).toBe(true)
    expect(useGameStore.getState().currentScreen).toBe('game')
    expect(useGameStore.getState().selectedCharacterId).toBe('maria')
    expect(useTimeStore.getState().totalDaysElapsed).toBe(530)
    expect(useFinanceStore.getState().bankBalance).toBe(3000)
  })
})
