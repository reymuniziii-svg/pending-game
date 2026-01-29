import { create } from 'zustand'
import type {
  GameDate,
  TimeFlowMode,
  TimeFlowSpeed,
  TimeFlowSettings,
  DeadlineTracker
} from '@/types'
import { DAYS_IN_MONTH, MONTH_NAMES } from '@/types'

// V3: Advance mode determines time control style
export type AdvanceMode = 'auto' | 'manual'

// V3: Transition state for ceremonial day changes
export type TransitionState = 'idle' | 'teasing' | 'transitioning' | 'revealing'

// V3: Teaser messages for anticipation building
const TEASER_MESSAGES = [
  'Something stirs...',
  'The calendar turns...',
  'Time moves forward...',
  'A new day awaits...',
  'The hours pass by...',
  'Change is coming...',
]

const FORESHADOWING_MESSAGES = {
  deadline: 'A deadline approaches...',
  event: 'Something is about to happen...',
  quiet: 'Life continues quietly...',
  important: 'This day feels significant...',
}

// Helper to get days in a month (handles leap years)
function getDaysInMonth(month: number, year: number): number {
  if (month === 2 && isLeapYear(year)) return 29
  return DAYS_IN_MONTH[month]
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

interface TimeState {
  // Current time
  currentDay: number    // 1-31
  currentMonth: number  // 1-12
  currentYear: number
  totalDaysElapsed: number

  // Game start reference
  startDay: number
  startMonth: number
  startYear: number

  // === V2: Time Flow System ===
  flowMode: TimeFlowMode
  flowSpeed: TimeFlowSpeed
  settings: TimeFlowSettings

  // Quiet period handling
  isQuietPeriod: boolean
  quietPeriodDays: number  // How many days to skip
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

  // Track days since last event for micro-moments
  daysSinceLastEvent: number

  // Actions - Basic
  initializeTime: (day: number, month: number, year: number) => void
  advanceDay: () => void
  advanceDays: (count: number) => void
  getCurrentDate: () => GameDate
  getMonthName: () => string
  getFormattedDate: () => string
  getShortDate: () => string
  isMonthEnd: () => boolean
  isYearEnd: () => boolean
  getYearsElapsed: () => number
  getDaysInCurrentMonth: () => number
  reset: () => void

  // Actions - V2: Flow Control
  setFlowMode: (mode: TimeFlowMode) => void
  setFlowSpeed: (speed: TimeFlowSpeed) => void
  pause: () => void
  resume: () => void
  togglePause: () => void
  updateSettings: (settings: Partial<TimeFlowSettings>) => void

  // Actions - Quiet Periods
  startQuietPeriod: (days: number) => void
  endQuietPeriod: () => void

  // Actions - Deadline Tracking
  addDeadline: (deadline: DeadlineTracker) => void
  removeDeadline: (id: string) => void
  updateDeadlinePressure: () => void
  getDaysUntilDeadline: (deadline: DeadlineTracker) => number

  // Internal: Timer management
  setAutoAdvanceTimer: (id: number | null) => void

  // Event tracking
  resetDaysSinceEvent: () => void
  incrementDaysSinceEvent: () => void

  // === V3: Tap-to-Advance Actions ===
  setAdvanceMode: (mode: AdvanceMode) => void
  startTransition: () => void  // Begin ceremonial day transition
  completeTransition: () => void  // Finish transition, reveal new day
  cancelTransition: () => void  // Cancel if interrupted
  setUpcomingEventHint: (hint: string | null) => void
  setCanAdvance: (can: boolean) => void
  getRandomTeaser: () => string
  getForeshadowingMessage: (type: keyof typeof FORESHADOWING_MESSAGES) => string
}

const defaultSettings: TimeFlowSettings = {
  dayDurationMs: 100,  // 100ms per day at 1x for fast ticking
  autoPauseOnImportant: true,
  quietPeriodAutoSkip: true,
}

const initialState = {
  currentDay: 1,
  currentMonth: 1,
  currentYear: 2024,
  totalDaysElapsed: 0,
  startDay: 1,
  startMonth: 1,
  startYear: 2024,

  // V2 defaults
  flowMode: 'paused' as TimeFlowMode,
  flowSpeed: 1 as TimeFlowSpeed,
  settings: defaultSettings,
  isQuietPeriod: false,
  quietPeriodDays: 0,
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

  // Event tracking
  daysSinceLastEvent: 0,
}

export const useTimeStore = create<TimeState>((set, get) => ({
  ...initialState,

  initializeTime: (day, month, year) => set({
    currentDay: day,
    currentMonth: month,
    currentYear: year,
    startDay: day,
    startMonth: month,
    startYear: year,
    totalDaysElapsed: 0,
    flowMode: 'paused',
    isQuietPeriod: false,
    quietPeriodDays: 0,
    deadlinePressure: 0,
    activeDeadlines: [],
    daysSinceLastEvent: 0,
  }),

  advanceDay: () => set((state) => {
    let newDay = state.currentDay + 1
    let newMonth = state.currentMonth
    let newYear = state.currentYear

    const daysInMonth = getDaysInMonth(state.currentMonth, state.currentYear)

    if (newDay > daysInMonth) {
      newDay = 1
      newMonth += 1
      if (newMonth > 12) {
        newMonth = 1
        newYear += 1
      }
    }

    return {
      currentDay: newDay,
      currentMonth: newMonth,
      currentYear: newYear,
      totalDaysElapsed: state.totalDaysElapsed + 1,
      daysSinceLastEvent: state.daysSinceLastEvent + 1,
    }
  }),

  advanceDays: (count) => set((state) => {
    let day = state.currentDay
    let month = state.currentMonth
    let year = state.currentYear

    for (let i = 0; i < count; i++) {
      day += 1
      const daysInMonth = getDaysInMonth(month, year)
      if (day > daysInMonth) {
        day = 1
        month += 1
        if (month > 12) {
          month = 1
          year += 1
        }
      }
    }

    return {
      currentDay: day,
      currentMonth: month,
      currentYear: year,
      totalDaysElapsed: state.totalDaysElapsed + count,
      daysSinceLastEvent: state.daysSinceLastEvent + count,
    }
  }),

  getCurrentDate: () => ({
    day: get().currentDay,
    month: get().currentMonth,
    year: get().currentYear,
  }),

  getMonthName: () => {
    return MONTH_NAMES[get().currentMonth]
  },

  getFormattedDate: () => {
    const state = get()
    return `${MONTH_NAMES[state.currentMonth]} ${state.currentDay}, ${state.currentYear}`
  },

  getShortDate: () => {
    const state = get()
    return `${state.currentMonth}/${state.currentDay}/${state.currentYear}`
  },

  isMonthEnd: () => {
    const state = get()
    return state.currentDay === getDaysInMonth(state.currentMonth, state.currentYear)
  },

  isYearEnd: () => {
    const state = get()
    return state.currentMonth === 12 && state.currentDay === 31
  },

  getYearsElapsed: () => {
    const state = get()
    return state.currentYear - state.startYear
  },

  getDaysInCurrentMonth: () => {
    const state = get()
    return getDaysInMonth(state.currentMonth, state.currentYear)
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

  startQuietPeriod: (days) => set((state) => ({
    isQuietPeriod: true,
    quietPeriodDays: days,
    quietPeriodStart: { day: state.currentDay, month: state.currentMonth, year: state.currentYear },
  })),

  endQuietPeriod: () => set({
    isQuietPeriod: false,
    quietPeriodDays: 0,
    quietPeriodStart: undefined,
  }),

  // === Deadline Tracking ===

  addDeadline: (deadline) => set((state) => ({
    activeDeadlines: [...state.activeDeadlines, deadline]
  })),

  removeDeadline: (id) => set((state) => ({
    activeDeadlines: state.activeDeadlines.filter(d => d.id !== id)
  })),

  getDaysUntilDeadline: (deadline) => {
    const state = get()
    // Convert both dates to total days for comparison
    const currentTotal = dateToDays(state.currentYear, state.currentMonth, state.currentDay)
    const deadlineTotal = dateToDays(deadline.deadline.year, deadline.deadline.month, deadline.deadline.day || 1)
    return deadlineTotal - currentTotal
  },

  updateDeadlinePressure: () => set((state) => {
    if (state.activeDeadlines.length === 0) {
      return { deadlinePressure: 0 }
    }

    // Calculate pressure based on nearest deadline
    let maxPressure = 0

    for (const deadline of state.activeDeadlines) {
      const daysUntil = get().getDaysUntilDeadline(deadline)

      let pressure = 0
      if (daysUntil <= 0) {
        pressure = 100  // Past due
      } else if (daysUntil <= 7) {
        pressure = 90  // Final week
      } else if (daysUntil <= 30) {
        pressure = 70  // Final month
      } else if (daysUntil <= 90) {
        pressure = 40  // 1-3 months
      } else {
        pressure = 10  // 3+ months
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

  // === Event Tracking ===

  resetDaysSinceEvent: () => set({ daysSinceLastEvent: 0 }),

  incrementDaysSinceEvent: () => set((state) => ({
    daysSinceLastEvent: state.daysSinceLastEvent + 1
  })),

  // === V3: Tap-to-Advance Implementation ===

  setAdvanceMode: (mode) => set({ advanceMode: mode }),

  startTransition: () => set(() => {
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

// Helper function to convert date to total days since epoch for comparison
function dateToDays(year: number, month: number, day: number): number {
  let totalDays = 0
  for (let y = 2000; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365
  }
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(m, year)
  }
  totalDays += day
  return totalDays
}

// Helper function to calculate effective day duration
export function getEffectiveDayDuration(state: Pick<TimeState, 'settings' | 'flowSpeed' | 'deadlinePressure'>): number {
  const { settings, flowSpeed, deadlinePressure } = state

  let duration = settings.dayDurationMs / flowSpeed

  // Slow down when deadline pressure is high
  if (deadlinePressure > 50) {
    duration *= 1.5  // 50% slower under pressure
  }
  if (deadlinePressure > 80) {
    duration *= 2  // Even slower near critical deadlines
  }

  return duration
}

// Export getDaysInMonth for use elsewhere
export { getDaysInMonth }
