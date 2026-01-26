import { create } from 'zustand'
import type {
  GameDate,
  TimeFlowMode,
  TimeFlowSpeed,
  TimeFlowSettings,
  DeadlineTracker
} from '@/types'

// V3: Advance mode determines time control style
export type AdvanceMode = 'auto' | 'manual'

// V3: Transition state for ceremonial month changes
export type TransitionState = 'idle' | 'teasing' | 'transitioning' | 'revealing'

// V3: Teaser messages for anticipation building
const TEASER_MESSAGES = [
  'Something stirs...',
  'The calendar turns...',
  'Time moves forward...',
  'A new month awaits...',
  'The days pass by...',
  'Change is coming...',
]

const FORESHADOWING_MESSAGES = {
  deadline: 'A deadline approaches...',
  event: 'Something is about to happen...',
  quiet: 'Life continues quietly...',
  important: 'This month feels significant...',
}

interface TimeState {
  // Current time
  currentMonth: number  // 1-12
  currentYear: number
  totalMonthsElapsed: number

  // Game start reference
  startMonth: number
  startYear: number

  // === V2: Time Flow System ===
  flowMode: TimeFlowMode
  flowSpeed: TimeFlowSpeed
  settings: TimeFlowSettings

  // Quiet period handling
  isQuietPeriod: boolean
  quietPeriodMonths: number  // How many months to skip
  quietPeriodStart?: GameDate

  // Deadline pressure (0-100)
  deadlinePressure: number
  activeDeadlines: DeadlineTracker[]

  // Auto-advance timer ID (for cleanup)
  autoAdvanceTimerId: number | null

  // === V3: Tap-to-Advance System ===
  advanceMode: AdvanceMode
  transitionState: TransitionState
  teaserMessage: string | null
  upcomingEventHint: string | null  // Foreshadowing for events
  canAdvance: boolean  // Whether player can tap to advance

  // Actions - Basic
  initializeTime: (month: number, year: number) => void
  advanceMonth: () => void
  advanceMonths: (count: number) => void
  getCurrentDate: () => GameDate
  getMonthName: () => string
  getFormattedDate: () => string
  isYearEnd: () => boolean
  getYearsElapsed: () => number
  reset: () => void

  // Actions - V2: Flow Control
  setFlowMode: (mode: TimeFlowMode) => void
  setFlowSpeed: (speed: TimeFlowSpeed) => void
  pause: () => void
  resume: () => void
  togglePause: () => void
  updateSettings: (settings: Partial<TimeFlowSettings>) => void

  // Actions - Quiet Periods
  startQuietPeriod: (months: number) => void
  endQuietPeriod: () => void

  // Actions - Deadline Tracking
  addDeadline: (deadline: DeadlineTracker) => void
  removeDeadline: (id: string) => void
  updateDeadlinePressure: () => void
  getMonthsUntilDeadline: (deadline: DeadlineTracker) => number

  // Internal: Timer management
  setAutoAdvanceTimer: (id: number | null) => void

  // === V3: Tap-to-Advance Actions ===
  setAdvanceMode: (mode: AdvanceMode) => void
  startTransition: () => void  // Begin ceremonial month transition
  completeTransition: () => void  // Finish transition, reveal new month
  cancelTransition: () => void  // Cancel if interrupted
  setUpcomingEventHint: (hint: string | null) => void
  setCanAdvance: (can: boolean) => void
  getRandomTeaser: () => string
  getForeshadowingMessage: (type: keyof typeof FORESHADOWING_MESSAGES) => string
}

const defaultSettings: TimeFlowSettings = {
  monthDurationMs: 3000,  // 3 seconds per month at 1x
  autoPauseOnImportant: true,
  quietPeriodAutoSkip: true,
}

const initialState = {
  currentMonth: 1,
  currentYear: 2024,
  totalMonthsElapsed: 0,
  startMonth: 1,
  startYear: 2024,

  // V2 defaults
  flowMode: 'paused' as TimeFlowMode,
  flowSpeed: 1 as TimeFlowSpeed,
  settings: defaultSettings,
  isQuietPeriod: false,
  quietPeriodMonths: 0,
  quietPeriodStart: undefined,
  deadlinePressure: 0,
  activeDeadlines: [] as DeadlineTracker[],
  autoAdvanceTimerId: null,

  // V3 defaults - start in manual mode for BitLife-style gameplay
  advanceMode: 'manual' as AdvanceMode,
  transitionState: 'idle' as TransitionState,
  teaserMessage: null as string | null,
  upcomingEventHint: null as string | null,
  canAdvance: true,
}

export const useTimeStore = create<TimeState>((set, get) => ({
  ...initialState,

  initializeTime: (month, year) => set({
    currentMonth: month,
    currentYear: year,
    startMonth: month,
    startYear: year,
    totalMonthsElapsed: 0,
    flowMode: 'paused',
    isQuietPeriod: false,
    quietPeriodMonths: 0,
    deadlinePressure: 0,
    activeDeadlines: [],
  }),

  advanceMonth: () => set((state) => {
    let newMonth = state.currentMonth + 1
    let newYear = state.currentYear

    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }

    return {
      currentMonth: newMonth,
      currentYear: newYear,
      totalMonthsElapsed: state.totalMonthsElapsed + 1,
    }
  }),

  advanceMonths: (count) => set((state) => {
    let month = state.currentMonth
    let year = state.currentYear

    for (let i = 0; i < count; i++) {
      month += 1
      if (month > 12) {
        month = 1
        year += 1
      }
    }

    return {
      currentMonth: month,
      currentYear: year,
      totalMonthsElapsed: state.totalMonthsElapsed + count,
    }
  }),

  getCurrentDate: () => ({
    month: get().currentMonth,
    year: get().currentYear,
  }),

  getMonthName: () => {
    const months = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[get().currentMonth]
  },

  getFormattedDate: () => {
    const state = get()
    const months = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return `${months[state.currentMonth]} ${state.currentYear}`
  },

  isYearEnd: () => get().currentMonth === 12,

  getYearsElapsed: () => {
    const state = get()
    return state.currentYear - state.startYear
  },

  reset: () => set(initialState),

  // === V2: Flow Control ===

  setFlowMode: (mode) => set({ flowMode: mode }),

  setFlowSpeed: (speed) => set({ flowSpeed: speed }),

  pause: () => set({ flowMode: 'paused' }),

  resume: () => set((state) => ({
    flowMode: state.flowSpeed === 1 ? 'normal' :
              state.flowSpeed === 2 ? 'fast' : 'faster'
  })),

  togglePause: () => set((state) => {
    if (state.flowMode === 'paused') {
      return {
        flowMode: state.flowSpeed === 1 ? 'normal' :
                  state.flowSpeed === 2 ? 'fast' : 'faster'
      }
    }
    return { flowMode: 'paused' }
  }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  // === Quiet Periods ===

  startQuietPeriod: (months) => set((state) => ({
    isQuietPeriod: true,
    quietPeriodMonths: months,
    quietPeriodStart: { month: state.currentMonth, year: state.currentYear },
  })),

  endQuietPeriod: () => set({
    isQuietPeriod: false,
    quietPeriodMonths: 0,
    quietPeriodStart: undefined,
  }),

  // === Deadline Tracking ===

  addDeadline: (deadline) => set((state) => ({
    activeDeadlines: [...state.activeDeadlines, deadline]
  })),

  removeDeadline: (id) => set((state) => ({
    activeDeadlines: state.activeDeadlines.filter(d => d.id !== id)
  })),

  getMonthsUntilDeadline: (deadline) => {
    const state = get()
    const currentTotal = state.currentYear * 12 + state.currentMonth
    const deadlineTotal = deadline.deadline.year * 12 + deadline.deadline.month
    return deadlineTotal - currentTotal
  },

  updateDeadlinePressure: () => set((state) => {
    if (state.activeDeadlines.length === 0) {
      return { deadlinePressure: 0 }
    }

    // Calculate pressure based on nearest deadline
    let maxPressure = 0

    for (const deadline of state.activeDeadlines) {
      const monthsUntil = get().getMonthsUntilDeadline(deadline)

      let pressure = 0
      if (monthsUntil <= 0) {
        pressure = 100  // Past due
      } else if (monthsUntil <= 1) {
        pressure = 90  // Final month
      } else if (monthsUntil <= 3) {
        pressure = 70  // 1-3 months
      } else if (monthsUntil <= 6) {
        pressure = 40  // 3-6 months
      } else {
        pressure = 10  // 6+ months
      }

      // Adjust by severity
      if (deadline.severity === 'critical') pressure *= 1.0
      else if (deadline.severity === 'major') pressure *= 0.8
      else pressure *= 0.5

      maxPressure = Math.max(maxPressure, pressure)
    }

    return { deadlinePressure: Math.min(100, maxPressure) }
  }),

  // === Timer Management ===

  setAutoAdvanceTimer: (id) => set({ autoAdvanceTimerId: id }),

  // === V3: Tap-to-Advance Implementation ===

  setAdvanceMode: (mode) => set({ advanceMode: mode }),

  startTransition: () => set((state) => {
    // Select a random teaser message
    const teaser = TEASER_MESSAGES[Math.floor(Math.random() * TEASER_MESSAGES.length)]

    return {
      transitionState: 'teasing',
      teaserMessage: teaser,
      canAdvance: false,
    }
  }),

  completeTransition: () => set({
    transitionState: 'idle',
    teaserMessage: null,
    canAdvance: true,
  }),

  cancelTransition: () => set({
    transitionState: 'idle',
    teaserMessage: null,
    canAdvance: true,
  }),

  setUpcomingEventHint: (hint) => set({ upcomingEventHint: hint }),

  setCanAdvance: (can) => set({ canAdvance: can }),

  getRandomTeaser: () => TEASER_MESSAGES[Math.floor(Math.random() * TEASER_MESSAGES.length)],

  getForeshadowingMessage: (type) => FORESHADOWING_MESSAGES[type],
}))

// Helper function to calculate effective month duration
export function getEffectiveMonthDuration(state: Pick<TimeState, 'settings' | 'flowSpeed' | 'deadlinePressure'>): number {
  const { settings, flowSpeed, deadlinePressure } = state

  let duration = settings.monthDurationMs / flowSpeed

  // Slow down when deadline pressure is high
  if (deadlinePressure > 50) {
    duration *= 1.5  // 50% slower under pressure
  }
  if (deadlinePressure > 80) {
    duration *= 2  // Even slower near critical deadlines
  }

  return duration
}
