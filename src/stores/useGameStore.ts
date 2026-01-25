import { create } from 'zustand'
import type { ScreenType, GameStatistics } from '@/types'
import { generateId } from '@/lib/utils'

interface GameState {
  // Meta
  gameId: string
  startedAt: Date | null
  playTimeMinutes: number

  // Screen state
  currentScreen: ScreenType
  previousScreen: ScreenType | null

  // Flags
  isLoading: boolean
  isPaused: boolean
  isProcessingEvent: boolean
  showContentWarning: boolean
  hasSeenContentWarning: boolean

  // Opening sequence
  openingBeatIndex: number
  isInOpeningSequence: boolean

  // Current character
  selectedCharacterId: string | null

  // Actions
  setScreen: (screen: ScreenType) => void
  goBack: () => void
  startNewGame: (characterId: string) => void
  acknowledgeContentWarning: () => void
  setLoading: (loading: boolean) => void
  setPaused: (paused: boolean) => void
  setProcessingEvent: (processing: boolean) => void
  advanceOpeningBeat: () => void
  completeOpeningSequence: () => void
  resetGame: () => void
  updatePlayTime: (minutes: number) => void
}

const initialState = {
  gameId: '',
  startedAt: null,
  playTimeMinutes: 0,
  currentScreen: 'title' as ScreenType,
  previousScreen: null,
  isLoading: false,
  isPaused: false,
  isProcessingEvent: false,
  showContentWarning: false,
  hasSeenContentWarning: false,
  openingBeatIndex: 0,
  isInOpeningSequence: false,
  selectedCharacterId: null,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setScreen: (screen) => set((state) => ({
    previousScreen: state.currentScreen,
    currentScreen: screen,
  })),

  goBack: () => set((state) => ({
    currentScreen: state.previousScreen || 'title',
    previousScreen: null,
  })),

  startNewGame: (characterId) => set({
    gameId: generateId(),
    startedAt: new Date(),
    playTimeMinutes: 0,
    selectedCharacterId: characterId,
    currentScreen: 'opening',
    isInOpeningSequence: true,
    openingBeatIndex: 0,
    isPaused: false,
    isProcessingEvent: false,
  }),

  acknowledgeContentWarning: () => set({
    hasSeenContentWarning: true,
    showContentWarning: false,
    currentScreen: 'character-select',
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  setPaused: (paused) => set({ isPaused: paused }),

  setProcessingEvent: (processing) => set({ isProcessingEvent: processing }),

  advanceOpeningBeat: () => set((state) => ({
    openingBeatIndex: state.openingBeatIndex + 1,
  })),

  completeOpeningSequence: () => set({
    isInOpeningSequence: false,
    currentScreen: 'game',
  }),

  resetGame: () => set({
    ...initialState,
    hasSeenContentWarning: get().hasSeenContentWarning, // Preserve this
  }),

  updatePlayTime: (minutes) => set((state) => ({
    playTimeMinutes: state.playTimeMinutes + minutes,
  })),
}))
