import { useCallback, useMemo } from 'react'
import {
  useEventStore,
  useCharacterStore,
  useFinanceStore,
  useTimeStore,
  useFormStore,
  useRelationshipStore,
  useGameStore,
  useSimulationStore,
  useAchievementStore,
} from '@/stores'
import { evaluateAchievements, type AchievementCheckState } from '@/data/achievements'
import type {
  GameEvent,
  EventCondition,
  EventOutcome,
  GameDate,
  EventChoice,
  ImmigrationStatusType,
  FormType,
} from '@/types'
import { addMonths } from '@/lib/utils'
import {
  evaluateCondition as evaluateConditionFromEngine,
  evaluateConditions,
  executeOutcome,
  executeOutcomes,
  resolveNextEvent,
  isWithinTimingWindow,
  processMonthlyFormLifecycle,
  processPolicyTraps,
  accrueMonthlyStatusEffects,
  evaluateLegalRuleChecks,
  isStatusTransitionAllowed,
  buildNextStatus,
  getChainById,
  getNextChainEventId,
} from '@/engine'

// Import events data
import { EVENTS, EVENT_CHAINS } from '@/data/events'

export function useEventEngine() {
  const {
    queueEvent,
    setCurrentEvent,
    clearCurrentEvent,
    hasCompletedEvent,
    completeEvent,
    getScheduledEventsForDate,
    eventQueue,
    showOutcome,
  } = useEventStore()

  const {
    status,
    stats,
    flags,
    getFlag,
    setFlag,
    modifyStat,
    updateStatus,
    addDocument,
    removeDocument,
  } = useCharacterStore()

  const { bankBalance, canAfford, addIncome, addExpense } = useFinanceStore()

  const {
    totalDaysElapsed,
    getCurrentDate,
    getDaysUntilDeadline,
    activeDeadlines,
  } = useTimeStore()

  const { processApplicationDecision } = useFormStore()
  const { relationships, modifyRelationship } = useRelationshipStore()
  const { selectedCharacterId } = useGameStore()
  const { nextRandom } = useSimulationStore()

  const totalMonthsElapsed = useMemo(() => Math.floor(totalDaysElapsed / 30), [totalDaysElapsed])

  const relationshipIndex = useMemo(() => {
    const map: Record<string, number> = {}
    for (const relationship of relationships) {
      map[relationship.id] = relationship.level
    }
    return map
  }, [relationships])

  const checkAchievements = useCallback((): void => {
    // Read fresh state (not the render closure) so unlocks reflect outcomes just applied,
    // including a status change in the same choice that ends the game.
    const character = useCharacterStore.getState()
    const finance = useFinanceStore.getState()
    const relationshipMap: Record<string, number> = {}
    for (const relationship of useRelationshipStore.getState().relationships) {
      relationshipMap[relationship.id] = relationship.level
    }
    const checkState: AchievementCheckState = {
      totalDaysElapsed: useTimeStore.getState().totalDaysElapsed,
      currentStatus: character.status?.type ?? 'undocumented',
      eventsCompleted: Array.from(useEventStore.getState().completedEventIds),
      choicesMade: {},
      stats: {
        health: character.stats.health,
        stress: character.stats.stress,
        wellbeing: character.stats.communityConnection,
        stability: character.stats.englishProficiency,
      },
      finances: {
        bankBalance: finance.bankBalance,
        totalSpent: finance.totalImmigrationSpending,
        totalEarned: 0,
      },
      relationships: relationshipMap,
      flags: character.flags as Record<string, boolean>,
      characterId: useGameStore.getState().selectedCharacterId ?? '',
    }
    useAchievementStore.getState().checkAndUnlock(evaluateAchievements(checkState))
  }, [])

  const buildConditionContext = useCallback((date: GameDate) => ({
    statusType: status?.type,
    flags: {
      // status value is the default; an event-set flag of the same name takes precedence
      unlawfulPresenceDays: status?.unlawfulPresenceDays,
      ...flags,
    },
    bankBalance,
    relationships: relationshipIndex,
    stats,
    date,
    characterId: selectedCharacterId,
  }), [status?.type, status?.unlawfulPresenceDays, flags, bankBalance, relationshipIndex, stats, selectedCharacterId])

  const evaluateSingleCondition = useCallback((condition: EventCondition, date: GameDate): boolean => {
    return evaluateConditionFromEngine(condition, buildConditionContext(date))
  }, [buildConditionContext])

  const evaluateCondition = useCallback((condition: EventCondition): boolean => {
    return evaluateSingleCondition(condition, getCurrentDate())
  }, [evaluateSingleCondition, getCurrentDate])

  const evaluateConditionsList = useCallback((conditions: EventCondition[], date = getCurrentDate()): boolean => {
    return evaluateConditions(conditions, buildConditionContext(date))
  }, [buildConditionContext, getCurrentDate])

  const isEventEligible = useCallback((event: GameEvent, date = getCurrentDate()): boolean => {
    // Check if already completed (and not repeatable)
    if (!event.isRepeatable && hasCompletedEvent(event.id)) {
      return false
    }

    // Check random timing windows.
    if (!isWithinTimingWindow(event, totalMonthsElapsed)) {
      return false
    }

    // Check timing constraints for random events with day-level precision.
    if (event.timing.type === 'random') {
      const timing = event.timing
      if (timing.earliestMonth !== undefined && totalDaysElapsed < timing.earliestMonth * 30) {
        return false
      }
      if (timing.latestMonth !== undefined && totalDaysElapsed > timing.latestMonth * 30) {
        return false
      }
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
      if (!evaluateConditionsList(event.conditions, date)) {
        return false
      }
    }

    return true
  }, [
    hasCompletedEvent,
    totalMonthsElapsed,
    totalDaysElapsed,
    selectedCharacterId,
    status,
    evaluateConditionsList,
    getCurrentDate,
  ])

  const getEligibleEvents = useCallback((): GameEvent[] => {
    const date = getCurrentDate()
    return EVENTS.filter((event) => isEventEligible(event, date))
  }, [getCurrentDate, isEventEligible])

  const transitionStatus = useCallback((toStatus: ImmigrationStatusType, reason: string, date: GameDate): boolean => {
    if (!status) {
      return false
    }

    const allowed = isStatusTransitionAllowed(status.type, toStatus, status.validTransitions)
    if (!allowed) {
      setFlag('invalid_status_transition_attempt', `${status.type}->${toStatus}`)
      return false
    }

    const nextStatus = buildNextStatus(status, toStatus)
    updateStatus(nextStatus, reason, date)
    return true
  }, [status, setFlag, updateStatus])

  const executeSingleOutcome = useCallback((outcome: EventOutcome, date: GameDate): boolean => {
    return executeOutcome(outcome, date, {
      getFlag,
      setFlag,
      modifyStat: (key, delta) => modifyStat(key, delta),
      queueEvent,
      queueScheduledEvent: useEventStore.getState().queueScheduledEvent,
      addIncome,
      addExpense: (amount, description, dateValue) => addExpense(amount, description, 'other', dateValue),
      changeRelationship: (id, delta, reasonText, atDate) => modifyRelationship(id, delta, reasonText, atDate),
      endGame: () => useGameStore.getState().setScreen('ending'),
      transitionStatus,
      fileApplication: (formId, atDate) => {
        try {
          useFormStore.getState().fileApplication(formId as FormType, atDate, () => nextRandom('forms'))
          return true
        } catch {
          return false
        }
      },
      applyApplicationDecision: (target, decision, atDate) => {
        const formStore = useFormStore.getState()
        const activeByForm = formStore.getActiveApplicationsForForm(target as FormType)
        if (activeByForm.length > 0) {
          processApplicationDecision(activeByForm[0].id, decision, 'Outcome decision', atDate)
          return true
        }

        const existing = formStore.getApplication(target)
        if (!existing) {
          return false
        }

        processApplicationDecision(existing.id, decision, 'Outcome decision', atDate)
        return true
      },
      triggerTrap: (trapId, atDate) => {
        setFlag(`trap_triggered:${trapId}`, true)
        const trap = processPolicyTraps(
          {
            ...buildConditionContext(atDate),
            currentDate: atDate,
            getFlag,
            setFlag,
            statusType: status?.type,
          },
          (trapOutcome) => {
            // eslint-disable-next-line react-hooks/immutability
            void executeSingleOutcome(trapOutcome, atDate)
          }
        )
        return trap.includes(trapId)
      },
      addDocument,
      removeDocument,
      random: () => nextRandom('core'),
      addMonths,
    })
  }, [
    addDocument,
    addExpense,
    addIncome,
    buildConditionContext,
    getFlag,
    modifyRelationship,
    modifyStat,
    nextRandom,
    processApplicationDecision,
    queueEvent,
    removeDocument,
    setFlag,
    status?.type,
    transitionStatus,
  ])

  const processOutcome = useCallback((outcome: EventOutcome, currentDate: GameDate): void => {
    void executeSingleOutcome(outcome, currentDate)
  }, [executeSingleOutcome])

  const processOutcomes = useCallback((outcomes: EventOutcome[], currentDate: GameDate): number => {
    return executeOutcomes(outcomes, currentDate, {
      getFlag,
      setFlag,
      modifyStat: (key, delta) => modifyStat(key, delta),
      queueEvent,
      queueScheduledEvent: useEventStore.getState().queueScheduledEvent,
      addIncome,
      addExpense: (amount, description, atDate) => addExpense(amount, description, 'other', atDate),
      changeRelationship: (id, delta, reasonText, atDate) => modifyRelationship(id, delta, reasonText, atDate),
      endGame: () => useGameStore.getState().setScreen('ending'),
      transitionStatus,
      fileApplication: (formId, atDate) => {
        try {
          useFormStore.getState().fileApplication(formId as FormType, atDate, () => nextRandom('forms'))
          return true
        } catch {
          return false
        }
      },
      applyApplicationDecision: (target, decision, atDate) => {
        const formStore = useFormStore.getState()
        const app = formStore.getApplication(target)
        if (app) {
          processApplicationDecision(app.id, decision, 'Outcome decision', atDate)
          return true
        }

        const activeByForm = formStore.getActiveApplicationsForForm(target as FormType)
        if (activeByForm.length > 0) {
          processApplicationDecision(activeByForm[0].id, decision, 'Outcome decision', atDate)
          return true
        }

        return false
      },
      triggerTrap: (trapId, atDate) => {
        setFlag(`trap_triggered:${trapId}`, true)
        const triggered = processPolicyTraps(
          {
            ...buildConditionContext(atDate),
            currentDate: atDate,
            getFlag,
            setFlag,
            statusType: status?.type,
          },
          (trapOutcome) => {
            void executeSingleOutcome(trapOutcome, atDate)
          }
        )

        return triggered.includes(trapId)
      },
      addDocument,
      removeDocument,
      random: () => nextRandom('core'),
      addMonths,
    })
  }, [
    addDocument,
    addExpense,
    addIncome,
    buildConditionContext,
    executeSingleOutcome,
    getFlag,
    modifyRelationship,
    modifyStat,
    nextRandom,
    processApplicationDecision,
    queueEvent,
    removeDocument,
    setFlag,
    status?.type,
    transitionStatus,
  ])

  const canSelectChoice = useCallback((choice: EventChoice): boolean => {
    const currentDate = getCurrentDate()

    if (choice.requirements && choice.requirements.length > 0) {
      const requirementsMet = evaluateConditions(choice.requirements, buildConditionContext(currentDate))
      if (!requirementsMet) {
        return false
      }
    }

    if (choice.costs && choice.costs.length > 0) {
      for (const cost of choice.costs) {
        if (cost.type === 'money' && !canAfford(cost.amount)) {
          return false
        }
      }
    }

    return true
  }, [buildConditionContext, canAfford, getCurrentDate])

  const selectNextEvent = useCallback((): GameEvent | null => {
    const currentDate = getCurrentDate()
    return resolveNextEvent({
      events: EVENTS,
      queuedEventIds: eventQueue.map((entry) => entry.eventId),
      scheduledEventIds: getScheduledEventsForDate(currentDate),
      currentDate,
      totalMonthsElapsed,
      randomValue: nextRandom('events'),
      isEligible: (event) => isEventEligible(event, currentDate),
    })
  }, [
    eventQueue,
    getCurrentDate,
    getScheduledEventsForDate,
    isEventEligible,
    nextRandom,
    totalMonthsElapsed,
  ])

  const handleChoiceSelection = useCallback((eventId: string, choiceId: string): boolean => {
    const event = EVENTS.find((item) => item.id === eventId)
    if (!event) {
      return false
    }

    const choice = event.choices.find((item) => item.id === choiceId)
    if (!choice) {
      return false
    }

    if (!canSelectChoice(choice)) {
      return false
    }

    const currentDate = getCurrentDate()

    // Process all outcomes using exhaustive executor.
    processOutcomes(choice.outcomes, currentDate)

    // Complete the event
    completeEvent(eventId, choiceId, currentDate, choice.outcomes)

    // Show outcome text
    showOutcome(choice.outcomeText)

    // Queue explicit continuation
    if (choice.nextEventId) {
      queueEvent(choice.nextEventId, 100)
    } else if (event.chainId) {
      const chain = getChainById(EVENT_CHAINS, event.chainId)
      if (chain) {
        const nextChainEventId = getNextChainEventId(chain, event.id)
        if (nextChainEventId) {
          queueEvent(nextChainEventId, 90)
        }
      }
    }

    // A choice may have changed status/stats — re-check achievements.
    checkAchievements()

    return true
  }, [canSelectChoice, checkAchievements, completeEvent, getCurrentDate, processOutcomes, queueEvent, showOutcome])

  const triggerRandomEvent = useCallback((): boolean => {
    // Deterministic event chance each month.
    if (nextRandom('events') > 0.4) {
      return false
    }

    const event = selectNextEvent()
    if (event) {
      setCurrentEvent(event)
      return true
    }

    return false
  }, [nextRandom, selectNextEvent, setCurrentEvent])

  const processMonthlySystems = useCallback((currentDate: GameDate): void => {
    processMonthlyFormLifecycle(currentDate, () => nextRandom('forms'))

    // Advance the time-based inputs legal traps depend on (unlawful presence, H-1B grace clock).
    accrueMonthlyStatusEffects({
      statusType: status?.type,
      getFlag,
      setFlag,
      addUnlawfulPresenceDays: useCharacterStore.getState().addUnlawfulPresenceDays,
    })

    const conditionContext = buildConditionContext(currentDate)
    const legalChecks = evaluateLegalRuleChecks({
      ...conditionContext,
      currentDate,
      getFlag,
      setFlag,
      statusType: status?.type,
    })

    for (const rule of legalChecks) {
      setFlag(`legal_rule:${rule.id}`, true)
    }

    processPolicyTraps(
      {
        ...conditionContext,
        currentDate,
        getFlag,
        setFlag,
        statusType: status?.type,
      },
      (trapOutcome) => {
        processOutcome(trapOutcome, currentDate)
      }
    )

    // Unlock any achievements whose conditions are now met.
    checkAchievements()

    // Deadline auto-flags for downstream events and urgency UI.
    for (const deadline of activeDeadlines) {
      const daysLeft = getDaysUntilDeadline(deadline)
      const monthsLeft = Math.ceil(daysLeft / 30)
      setFlag(`deadline:${deadline.id}:days_left`, daysLeft)
      setFlag(`deadline:${deadline.id}:months_left`, monthsLeft)
      if (daysLeft <= 0) {
        setFlag(`deadline:${deadline.id}:past_due`, true)
      }
    }
  }, [
    activeDeadlines,
    buildConditionContext,
    checkAchievements,
    getDaysUntilDeadline,
    getFlag,
    nextRandom,
    processOutcome,
    setFlag,
    status?.type,
  ])

  const checkForUpcomingEvents = useCallback((date: GameDate): string | null => {
    const upcomingMonths = [1, 2, 3]
    const hints: string[] = []

    for (const monthsAhead of upcomingMonths) {
      const futureDate = addMonths(date, monthsAhead)
      const scheduledIds = getScheduledEventsForDate(futureDate)

      for (const eventId of scheduledIds) {
        const event = EVENTS.find((item) => item.id === eventId)
        if (event?.foreshadowing) {
          if (monthsAhead === 1) {
            return event.foreshadowing
          }
          hints.push(event.foreshadowing)
        }
      }
    }

    const importantEligible = getEligibleEvents().filter(
      (event) => event.isImportant || event.tags?.includes('milestone') || event.tags?.includes('critical')
    )

    if (importantEligible.length > 0 && nextRandom('events') > 0.7) {
      const index = Math.floor(nextRandom('events') * importantEligible.length)
      const selected = importantEligible[index]
      return selected.foreshadowing || 'Something significant may happen soon...'
    }

    return hints[0] || null
  }, [getEligibleEvents, getScheduledEventsForDate, nextRandom])

  return {
    evaluateCondition,
    evaluateConditions: evaluateConditionsList,
    isEventEligible,
    getEligibleEvents,
    selectNextEvent,
    processOutcome,
    processOutcomes,
    handleChoiceSelection,
    triggerRandomEvent,
    setCurrentEvent,
    clearCurrentEvent,
    checkForUpcomingEvents,
    processMonthlySystems,
    canSelectChoice,
  }
}
