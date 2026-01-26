import { create } from 'zustand'
import type {
  GameDate,
  TimeFlowMode,
  TimeFlowSpeed,
  TimeFlowSettings,
  DeadlineTracker
} from '@/types'

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
