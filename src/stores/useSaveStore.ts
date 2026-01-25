import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SaveData, SaveSlot, ImmigrationStatusType } from '@/types'
import { computeChecksum } from '@/lib/utils'

import { useGameStore } from './useGameStore'
import { useTimeStore } from './useTimeStore'
import { useCharacterStore } from './useCharacterStore'
import { useFinanceStore } from './useFinanceStore'
import { useEventStore } from './useEventStore'
import { useFormStore } from './useFormStore'
import { useRelationshipStore } from './useRelationshipStore'

const SAVE_VERSION = '1.0.0'
const STORAGE_KEY_PREFIX = 'pending_save_'
const MAX_SAVE_SLOTS = 3
const AUTO_SAVE_SLOT = 0

interface SaveState {
  // Slot metadata
  saves: SaveSlot[]
  autoSaveEnabled: boolean
  lastAutoSave: Date | null

  // Actions
  saveGame: (slot: number) => boolean
  loadGame: (slot: number) => boolean
  autoSave: () => void
  deleteSave: (slot: number) => void
  exportSave: () => string
  importSave: (encoded: string) => boolean
  getSaveSlots: () => SaveSlot[]
  hasSaveInSlot: (slot: number) => boolean
  toggleAutoSave: () => void
  reset: () => void
}

function initializeSaveSlots(): SaveSlot[] {
  return Array.from({ length: MAX_SAVE_SLOTS + 1 }, (_, i) => ({
    slot: i,
    isEmpty: true,
  }))
}

function serializeGameState(): SaveData {
  const game = useGameStore.getState()
  const time = useTimeStore.getState()
  const character = useCharacterStore.getState()
  const finance = useFinanceStore.getState()
  const events = useEventStore.getState()
  const forms = useFormStore.getState()
  const relationships = useRelationshipStore.getState()

  const saveData: Omit<SaveData, 'checksum'> = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    gameId: game.gameId,
    characterId: character.profileId || '',
    playTimeMinutes: game.playTimeMinutes,

    currentMonth: time.currentMonth,
    currentYear: time.currentYear,
    totalMonthsElapsed: time.totalMonthsElapsed,

    characterState: {
      status: character.status!,
      statusHistory: character.statusHistory,
      documents: character.documents,
      stats: character.stats,
      flags: character.flags,
    },

    financeState: {
      bankBalance: finance.bankBalance,
      monthlyIncome: finance.monthlyIncome,
      recurringExpenses: finance.recurringExpenses,
      pendingFees: finance.pendingFees,
      debt: finance.totalDebt,
      transactionHistory: finance.transactionHistory.slice(-100), // Keep last 100
    },

    eventState: {
      eventQueue: events.eventQueue.map(e => e.eventId),
      completedEventIds: Array.from(events.completedEventIds),
      activeChains: events.activeChains,
      scheduledEvents: events.scheduledEvents,
    },

    formState: {
      activeApplications: forms.activeApplications,
      completedApplications: [...forms.approvedApplications, ...forms.deniedApplications],
    },

    relationships: relationships.relationships,

    statistics: {
      totalMonthsPlayed: time.totalMonthsElapsed,
      yearsInUS: time.getYearsElapsed(),
      finalStatus: character.status?.type || 'undocumented',
      statusChanges: character.statusHistory.length,
      totalEarned: finance.transactionHistory.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalSpent: finance.transactionHistory.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalImmigrationCosts: finance.totalImmigrationSpending,
      totalLegalFees: finance.paidFees.filter(f => f.type === 'legal').reduce((sum, f) => sum + f.amount, 0),
      totalRemittances: finance.totalRemittancesSent,
      peakSavings: finance.peakBalance,
      lowestBalance: finance.lowestBalance,
      applicationsField: forms.activeApplications.length + forms.approvedApplications.length + forms.deniedApplications.length,
      applicationsApproved: forms.approvedApplications.length,
      applicationsDenied: forms.deniedApplications.length,
      totalWaitingMonths: 0, // Would calculate from application history
      eventsExperienced: events.eventHistory.length,
      decisionsMode: events.eventHistory.length,
      trapsTriggered: 0,
      relationshipsFormed: relationships.relationships.length,
      familyEventsAbroad: 0,
      missedFunerals: 0,
      missedWeddings: 0,
      childrenBorn: 0,
    },
  }

  return {
    ...saveData,
    checksum: computeChecksum(saveData),
  }
}

function applySaveToStores(save: SaveData): void {
  // Reset all stores
  useGameStore.getState().resetGame()
  useTimeStore.getState().reset()
  useCharacterStore.getState().reset()
  useFinanceStore.getState().reset()
  useEventStore.getState().reset()
  useFormStore.getState().reset()
  useRelationshipStore.getState().reset()

  // Apply time
  useTimeStore.setState({
    currentMonth: save.currentMonth,
    currentYear: save.currentYear,
    totalMonthsElapsed: save.totalMonthsElapsed,
  })

  // Apply character
  useCharacterStore.setState({
    profileId: save.characterId,
    status: save.characterState.status,
    statusHistory: save.characterState.statusHistory,
    documents: save.characterState.documents,
    stats: save.characterState.stats,
    flags: save.characterState.flags,
  })

  // Apply finance
  useFinanceStore.setState({
    bankBalance: save.financeState.bankBalance,
    monthlyIncome: save.financeState.monthlyIncome,
    recurringExpenses: save.financeState.recurringExpenses,
    pendingFees: save.financeState.pendingFees,
    totalDebt: save.financeState.debt,
    transactionHistory: save.financeState.transactionHistory,
  })

  // Apply events
  useEventStore.setState({
    eventQueue: save.eventState.eventQueue.map(id => ({ eventId: id, priority: 0 })),
    completedEventIds: new Set(save.eventState.completedEventIds),
    activeChains: save.eventState.activeChains,
    scheduledEvents: save.eventState.scheduledEvents,
  })

  // Apply forms
  const activeApps = save.formState.activeApplications
  const completed = save.formState.completedApplications
  useFormStore.setState({
    activeApplications: activeApps,
    approvedApplications: completed.filter(a => a.decision === 'approved'),
    deniedApplications: completed.filter(a => a.decision === 'denied'),
  })

  // Apply relationships
  useRelationshipStore.setState({
    relationships: save.relationships,
  })

  // Set game state
  useGameStore.setState({
    gameId: save.gameId,
    selectedCharacterId: save.characterId,
    playTimeMinutes: save.playTimeMinutes,
    currentScreen: 'game',
  })
}

export const useSaveStore = create<SaveState>()(
  persist(
    (set, get) => ({
      saves: initializeSaveSlots(),
      autoSaveEnabled: true,
      lastAutoSave: null,

      saveGame: (slot) => {
        try {
          const saveData = serializeGameState()
          const key = `${STORAGE_KEY_PREFIX}${slot}`
          localStorage.setItem(key, JSON.stringify(saveData))

          const character = useCharacterStore.getState()
          const time = useTimeStore.getState()
          const game = useGameStore.getState()

          set((state) => ({
            saves: state.saves.map((s) =>
              s.slot === slot
                ? {
                    slot,
                    isEmpty: false,
                    savedAt: new Date(),
                    characterId: character.profileId || undefined,
                    characterName: character.profile?.name,
                    currentMonth: time.currentMonth,
                    currentYear: time.currentYear,
                    status: character.status?.type,
                    playTimeMinutes: game.playTimeMinutes,
                  }
                : s
            ),
          }))

          return true
        } catch (e) {
          console.error('Failed to save game:', e)
          return false
        }
      },

      loadGame: (slot) => {
        try {
          const key = `${STORAGE_KEY_PREFIX}${slot}`
          const json = localStorage.getItem(key)
          if (!json) return false

          const saveData = JSON.parse(json) as SaveData

          // Validate checksum
          const { checksum, ...rest } = saveData
          if (computeChecksum(rest) !== checksum) {
            console.error('Save data corrupted')
            return false
          }

          applySaveToStores(saveData)
          return true
        } catch (e) {
          console.error('Failed to load game:', e)
          return false
        }
      },

      autoSave: () => {
        const state = get()
        if (!state.autoSaveEnabled) return

        const game = useGameStore.getState()
        if (game.currentScreen !== 'game' || game.isPaused || game.isProcessingEvent) return

        if (state.saveGame(AUTO_SAVE_SLOT)) {
          set({ lastAutoSave: new Date() })
        }
      },

      deleteSave: (slot) => {
        const key = `${STORAGE_KEY_PREFIX}${slot}`
        localStorage.removeItem(key)

        set((state) => ({
          saves: state.saves.map((s) =>
            s.slot === slot ? { slot, isEmpty: true } : s
          ),
        }))
      },

      exportSave: () => {
        const saveData = serializeGameState()
        return btoa(JSON.stringify(saveData))
      },

      importSave: (encoded) => {
        try {
          const json = atob(encoded)
          const saveData = JSON.parse(json) as SaveData

          // Validate
          const { checksum, ...rest } = saveData
          if (computeChecksum(rest) !== checksum) {
            return false
          }

          applySaveToStores(saveData)
          return true
        } catch (e) {
          console.error('Failed to import save:', e)
          return false
        }
      },

      getSaveSlots: () => {
        // Refresh slot metadata from localStorage
        const slots = get().saves.map((slot) => {
          const key = `${STORAGE_KEY_PREFIX}${slot.slot}`
          const json = localStorage.getItem(key)
          if (!json) return { ...slot, isEmpty: true }

          try {
            const save = JSON.parse(json) as SaveData
            return {
              slot: slot.slot,
              isEmpty: false,
              savedAt: new Date(save.savedAt),
              characterId: save.characterId,
              currentMonth: save.currentMonth,
              currentYear: save.currentYear,
              status: save.characterState.status.type,
              playTimeMinutes: save.playTimeMinutes,
            }
          } catch {
            return { ...slot, isEmpty: true }
          }
        })

        set({ saves: slots })
        return slots
      },

      hasSaveInSlot: (slot) => {
        const key = `${STORAGE_KEY_PREFIX}${slot}`
        return localStorage.getItem(key) !== null
      },

      toggleAutoSave: () => set((state) => ({
        autoSaveEnabled: !state.autoSaveEnabled,
      })),

      reset: () => set({
        saves: initializeSaveSlots(),
        lastAutoSave: null,
      }),
    }),
    {
      name: 'pending-save-settings',
      partialize: (state) => ({
        autoSaveEnabled: state.autoSaveEnabled,
      }),
    }
  )
)
