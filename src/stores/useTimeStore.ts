import { create } from 'zustand'
import type { GameDate, YearSummary } from '@/types'
import { MONTH_NAMES } from '@/types'

interface TimeState {
  // Current time
  currentMonth: number  // 1-12
  currentYear: number
  totalMonthsElapsed: number

  // Game start reference
  startMonth: number
  startYear: number

  // Pacing
  isQuietPeriod: boolean
  monthsToSkip: number

  // Actions
  initializeTime: (month: number, year: number) => void
  advanceMonth: () => void
  advanceMonths: (count: number) => void
  setQuietPeriod: (months: number) => void
  getCurrentDate: () => GameDate
  getMonthName: () => string
  getFormattedDate: () => string
  isYearEnd: () => boolean
  getYearsElapsed: () => number
  reset: () => void
}

const initialState = {
  currentMonth: 1,
  currentYear: 2024,
  totalMonthsElapsed: 0,
  startMonth: 1,
  startYear: 2024,
  isQuietPeriod: false,
  monthsToSkip: 0,
}

export const useTimeStore = create<TimeState>((set, get) => ({
  ...initialState,

  initializeTime: (month, year) => set({
    currentMonth: month,
    currentYear: year,
    startMonth: month,
    startYear: year,
    totalMonthsElapsed: 0,
    isQuietPeriod: false,
    monthsToSkip: 0,
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
      isQuietPeriod: false,
      monthsToSkip: 0,
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
      isQuietPeriod: false,
      monthsToSkip: 0,
    }
  }),

  setQuietPeriod: (months) => set({
    isQuietPeriod: true,
    monthsToSkip: months,
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
}))
