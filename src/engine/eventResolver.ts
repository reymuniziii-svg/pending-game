import type { GameDate, GameEvent } from '@/types'
import { weightedPick } from './rng'

interface ResolveEventInput {
  events: GameEvent[]
  queuedEventIds: string[]
  scheduledEventIds: string[]
  currentDate: GameDate
  totalMonthsElapsed: number
  randomValue: number
  isEligible: (event: GameEvent) => boolean
}

function isScheduledDateMatch(event: GameEvent, date: GameDate): boolean {
  if (event.timing.type !== 'scheduled') {
    return false
  }

  const monthMatches = event.timing.month === undefined || event.timing.month === date.month
  const yearMatches = event.timing.year === undefined || event.timing.year === date.year
  return monthMatches && yearMatches
}

export function isWithinTimingWindow(event: GameEvent, totalMonthsElapsed: number): boolean {
  if (event.timing.type !== 'random') {
    return true
  }

  const min = event.timing.earliestMonth ?? 0
  const max = event.timing.latestMonth ?? Number.MAX_SAFE_INTEGER
  return totalMonthsElapsed >= min && totalMonthsElapsed <= max
}

export function resolveNextEvent(input: ResolveEventInput): GameEvent | null {
  const {
    events,
    queuedEventIds,
    scheduledEventIds,
    currentDate,
    totalMonthsElapsed,
    randomValue,
    isEligible,
  } = input

  // 1. Explicit queue (triggered and chained events)
  for (const id of queuedEventIds) {
    const event = events.find((item) => item.id === id)
    if (event && isEligible(event)) {
      return event
    }
  }

  // 2. Scheduled in store
  for (const id of scheduledEventIds) {
    const event = events.find((item) => item.id === id)
    if (event && isEligible(event)) {
      return event
    }
  }

  // 3. Inline scheduled events from static definitions
  const inlineScheduled = events.filter((event) => isScheduledDateMatch(event, currentDate) && isEligible(event))
  if (inlineScheduled.length > 0) {
    return inlineScheduled[0]
  }

  // 4. Random events within timing windows
  const randomEvents = events.filter(
    (event) =>
      event.timing.type === 'random' &&
      isWithinTimingWindow(event, totalMonthsElapsed) &&
      isEligible(event)
  )

  return weightedPick(randomEvents, randomValue)
}
