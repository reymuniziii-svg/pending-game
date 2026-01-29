import { useCallback } from 'react'
import {
  useEventStore,
  useCharacterStore,
  useFinanceStore,
  useTimeStore,
  useFormStore,
  useRelationshipStore,
  useGameStore,
} from '@/stores'
import type {
  GameEvent,
  EventCondition,
  EventOutcome,
  GameDate,
  ImmigrationStatusType,
} from '@/types'
import { weightedRandom, addMonths } from '@/lib/utils'

// Import events data
import { EVENTS } from '@/data/events'

export function useEventEngine() {
  const { queueEvent, setCurrentEvent, clearCurrentEvent, hasCompletedEvent, completeEvent, getScheduledEventsForDate } = useEventStore()
  const { status, stats, flags, getFlag, setFlag, modifyStat, profile } = useCharacterStore()
  const { bankBalance, canAfford } = useFinanceStore()
  const { currentMonth, currentYear, getCurrentDate, totalDaysElapsed } = useTimeStore()
  const { getRelationship } = useRelationshipStore()
  const { selectedCharacterId } = useGameStore()

  // Evaluate a single condition
  const evaluateCondition = useCallback((condition: EventCondition): boolean => {
    let value: any

    switch (condition.type) {
      case 'status':
        value = status?.type
        break
      case 'flag':
        value = getFlag(condition.target)
        break
      case 'finance':
        if (condition.target === 'balance') value = bankBalance
        else value = 0
        break
      case 'relationship':
        const rel = getRelationship(condition.target)
        value = rel?.level ?? 0
        break
      case 'stat':
        value = stats[condition.target as keyof typeof stats] ?? 0
        break
      case 'date':
        if (condition.target === 'month') value = currentMonth
        else if (condition.target === 'year') value = currentYear
        else value = 0
        break
      case 'character':
        value = selectedCharacterId
        break
      default:
        value = undefined
    }

    switch (condition.operator) {
      case '==':
        return value === condition.value
      case '!=':
        return value !== condition.value
      case '>':
        return value > condition.value
      case '<':
        return value < condition.value
      case '>=':
        return value >= condition.value
      case '<=':
        return value <= condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not-in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      case 'exists':
        return value !== undefined && value !== null
      case 'not-exists':
        return value === undefined || value === null
      default:
        return false
    }
  }, [status, getFlag, bankBalance, getRelationship, stats, currentMonth, currentYear, selectedCharacterId])

  // Evaluate all conditions for an event
  const evaluateConditions = useCallback((conditions: EventCondition[]): boolean => {
    return conditions.every(evaluateCondition)
  }, [evaluateCondition])

  // Check if an event is eligible to trigger
  const isEventEligible = useCallback((event: GameEvent): boolean => {
    // Check if already completed (and not repeatable)
    if (!event.isRepeatable && hasCompletedEvent(event.id)) {
      return false
    }

    // Check character restrictions
    if (event.characterIds && event.characterIds.length > 0) {
      if (!selectedCharacterId || !event.characterIds.includes(selectedCharacterId)) {
        return false
      }
    }

    // Check status restrictions
    if (event.requiredStatuses && event.requiredStatuses.length > 0) {
      if (!status || !event.requiredStatuses.includes(status.type)) {
        return false
      }
    }

    if (event.excludedStatuses && event.excludedStatuses.length > 0) {
      if (status && event.excludedStatuses.includes(status.type)) {
        return false
      }
    }

    // Check conditions
    if (event.conditions && event.conditions.length > 0) {
      if (!evaluateConditions(event.conditions)) {
        return false
      }
    }

    // Check timing constraints for random events (convert months to days)
    if (event.timing.type === 'random') {
      const timing = event.timing
      if (timing.earliestMonth !== undefined) {
        const earliestDays = timing.earliestMonth * 30
        if (totalDaysElapsed < earliestDays) {
          return false
        }
      }
      if (timing.latestMonth !== undefined) {
        const latestDays = timing.latestMonth * 30
        if (totalDaysElapsed > latestDays) {
          return false
        }
      }
    }

    return true
  }, [hasCompletedEvent, selectedCharacterId, status, evaluateConditions, totalDaysElapsed])

  // Get all eligible events for the current state
  const getEligibleEvents = useCallback((): GameEvent[] => {
    return EVENTS.filter(isEventEligible)
  }, [isEventEligible])

  // Select the next event to show
  const selectNextEvent = useCallback((): GameEvent | null => {
    const currentDate = getCurrentDate()

    // 1. Check for scheduled events
    const scheduledIds = getScheduledEventsForDate(currentDate)
    for (const eventId of scheduledIds) {
      const event = EVENTS.find(e => e.id === eventId)
      if (event && isEventEligible(event)) {
        return event
      }
    }

    // 2. Get all eligible random events
    const eligibleEvents = getEligibleEvents().filter(e => e.timing.type === 'random')

    if (eligibleEvents.length === 0) {
      return null
    }

    // 3. Use weighted random selection
    const selected = weightedRandom(eligibleEvents)
    return selected
  }, [getCurrentDate, getScheduledEventsForDate, isEventEligible, getEligibleEvents])

  // Process an outcome
  const processOutcome = useCallback((outcome: EventOutcome, currentDate: GameDate) => {
    // Handle probability
    if (outcome.probability !== undefined && Math.random() > outcome.probability) {
      return
    }

    switch (outcome.type) {
      case 'flag-set':
        setFlag(outcome.target, outcome.value as string | number | boolean)
        break
      case 'flag-increment':
        const current = (getFlag(outcome.target) as number) || 0
        setFlag(outcome.target, current + (outcome.value as number))
        break
      case 'stat-change':
        modifyStat(outcome.target as keyof typeof stats, outcome.value as number)
        break
      case 'queue-event':
        const delay = outcome.delayMonths || 0
        if (delay > 0) {
          const futureDate = addMonths(currentDate, delay)
          useEventStore.getState().queueScheduledEvent(outcome.target, futureDate)
        } else {
          queueEvent(outcome.target)
        }
        break
      case 'trigger-event':
        queueEvent(outcome.target, 10) // High priority
        break
      case 'finance-add':
        useFinanceStore.getState().addIncome(outcome.value as number, outcome.target, currentDate)
        break
      case 'finance-subtract':
        useFinanceStore.getState().addExpense(outcome.value as number, outcome.target, 'other', currentDate)
        break
      case 'relationship-change':
        useRelationshipStore.getState().modifyRelationship(
          outcome.target,
          outcome.value as number,
          'Event outcome',
          currentDate
        )
        break
      case 'end-game':
        useGameStore.getState().setScreen('ending')
        break
      default:
        break
    }
  }, [setFlag, getFlag, modifyStat, queueEvent])

  // Process event choice selection
  const handleChoiceSelection = useCallback((eventId: string, choiceId: string): void => {
    const event = EVENTS.find(e => e.id === eventId)
    if (!event) return

    const choice = event.choices.find(c => c.id === choiceId)
    if (!choice) return

    const currentDate = getCurrentDate()

    // Process all outcomes
    for (const outcome of choice.outcomes) {
      processOutcome(outcome, currentDate)
    }

    // Complete the event
    completeEvent(eventId, choiceId, currentDate, choice.outcomes)

    // Show outcome text
    useEventStore.getState().showOutcome(choice.outcomeText)

    // Queue next event if specified
    if (choice.nextEventId) {
      queueEvent(choice.nextEventId, 10)
    }
  }, [getCurrentDate, processOutcome, completeEvent, queueEvent])

  // Trigger a random event (called each month)
  const triggerRandomEvent = useCallback((): boolean => {
    // Random chance of event each month (e.g., 40%)
    if (Math.random() > 0.4) {
      return false
    }

    const event = selectNextEvent()
    if (event) {
      setCurrentEvent(event)
      return true
    }

    return false
  }, [selectNextEvent, setCurrentEvent])

  // V3: Check for upcoming events and return foreshadowing hint
  const checkForUpcomingEvents = useCallback((currentDate: GameDate): string | null => {
    // Check for scheduled events in the next 1-3 months
    const upcomingMonths = [1, 2, 3]
    const hints: string[] = []

    for (const monthsAhead of upcomingMonths) {
      const futureDate = addMonths(currentDate, monthsAhead)
      const scheduledIds = getScheduledEventsForDate(futureDate)

      for (const eventId of scheduledIds) {
        const event = EVENTS.find(e => e.id === eventId)
        if (event?.foreshadowing) {
          // Return closer hints with higher priority
          if (monthsAhead === 1) {
            return event.foreshadowing
          }
          hints.push(event.foreshadowing)
        }
      }
    }

    // Check deadline pressure
    const { activeDeadlines, deadlinePressure } = useTimeStore.getState()
    if (deadlinePressure >= 80) {
      return 'A critical deadline approaches...'
    } else if (deadlinePressure >= 50) {
      return 'Important dates are drawing near...'
    }

    // Check if any important events are eligible and likely to trigger soon
    const eligibleEvents = getEligibleEvents()
    const importantEligible = eligibleEvents.filter(e =>
      e.isImportant || e.tags?.includes('milestone') || e.tags?.includes('critical')
    )

    if (importantEligible.length > 0 && Math.random() > 0.7) {
      const randomHint = importantEligible[Math.floor(Math.random() * importantEligible.length)]
      if (randomHint.foreshadowing) {
        return randomHint.foreshadowing
      }
      return 'Something significant may happen soon...'
    }

    // Return collected hints or null
    return hints.length > 0 ? hints[0] : null
  }, [getScheduledEventsForDate, getEligibleEvents])

  return {
    evaluateCondition,
    evaluateConditions,
    isEventEligible,
    getEligibleEvents,
    selectNextEvent,
    processOutcome,
    handleChoiceSelection,
    triggerRandomEvent,
    setCurrentEvent,
    clearCurrentEvent,
    // V3: Foreshadowing
    checkForUpcomingEvents,
  }
}
