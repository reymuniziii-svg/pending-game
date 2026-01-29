import { useEffect, useCallback, useRef } from 'react'
import { useTimeStore, useEventStore, useFinanceStore } from '@/stores'
import { useEventEngine } from './useEventEngine'
import { getEffectiveDayDuration } from '@/stores/useTimeStore'
import type { AdvanceMode } from '@/stores/useTimeStore'

interface UseTimeFlowOptions {
  enabled?: boolean
  onDayAdvance?: () => void
  onEventTriggered?: (eventId: string) => void
  onQuietPeriodStart?: (days: number) => void
  onForeshadowing?: (hint: string) => void  // V3: Foreshadowing callback
}

export function useTimeFlow(options: UseTimeFlowOptions = {}) {
  const {
    enabled = true,
    onDayAdvance,
    onEventTriggered,
    onQuietPeriodStart,
    onForeshadowing,
  } = options

  const timerRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)

  // Store selectors
  const {
    flowMode,
    flowSpeed,
    settings,
    deadlinePressure,
    isQuietPeriod,
    quietPeriodDays,
    advanceDay,
    advanceDays,
    endQuietPeriod,
    updateDeadlinePressure,
    getCurrentDate,
    setAutoAdvanceTimer,
    daysSinceLastEvent,
    resetDaysSinceEvent,
    isMonthEnd,
    // V3: Tap-to-advance state
    advanceMode,
    transitionState,
    setUpcomingEventHint,
    setCanAdvance,
    startTransition,
    completeTransition,
  } = useTimeStore()

  const {
    currentEvent,
    hasInterrupts,
    getNextInterrupt,
    removeInterrupt,
    shouldPauseForInterrupt,
  } = useEventStore()

  const { processMonthEnd } = useFinanceStore()
  const { selectNextEvent, setCurrentEvent, triggerRandomEvent, checkForUpcomingEvents } = useEventEngine()

  // Check if we should be running (only for auto mode)
  const shouldAutoRun = enabled && advanceMode === 'auto' && flowMode !== 'paused' && !currentEvent && !isProcessingRef.current

  // V3: Check for upcoming events and set foreshadowing hints
  const updateForeshadowing = useCallback(() => {
    const currentDate = getCurrentDate()
    const hint = checkForUpcomingEvents?.(currentDate)
    if (hint) {
      setUpcomingEventHint(hint)
      onForeshadowing?.(hint)
    } else {
      setUpcomingEventHint(null)
    }
  }, [getCurrentDate, checkForUpcomingEvents, setUpcomingEventHint, onForeshadowing])

  // Process a single day advance
  const processDay = useCallback(() => {
    if (isProcessingRef.current) return false
    isProcessingRef.current = true

    try {
      const currentDate = getCurrentDate()
      const wasMonthEnd = isMonthEnd()

      // Advance time
      advanceDay()
      onDayAdvance?.()

      // Process finances at month end
      if (wasMonthEnd) {
        processMonthEnd(currentDate)
      }

      // Update deadline pressure
      updateDeadlinePressure()

      // Check for interrupts first
      if (hasInterrupts) {
        const interrupt = getNextInterrupt()
        if (interrupt && shouldPauseForInterrupt(settings.autoPauseOnImportant)) {
          // Pause and show the event
          useTimeStore.getState().pause()
          onEventTriggered?.(interrupt.eventId)
          removeInterrupt(interrupt.eventId)
          resetDaysSinceEvent()
          isProcessingRef.current = false
          return true  // Event triggered
        }
      }

      // Try to trigger a random event (more likely the longer since last event)
      // Guarantee something happens within 30 days
      const eventChance = Math.min(0.1 + (daysSinceLastEvent / 30) * 0.9, 1.0)
      const shouldTryEvent = Math.random() < eventChance || daysSinceLastEvent >= 30

      if (shouldTryEvent) {
        const eventTriggered = triggerRandomEvent()
        if (eventTriggered) {
          // Pause while event is shown
          useTimeStore.getState().pause()
          resetDaysSinceEvent()
          isProcessingRef.current = false
          return true
        }
      }

      isProcessingRef.current = false
      return false  // No event
    } catch (error) {
      console.error('Error processing day:', error)
      isProcessingRef.current = false
      return false
    }
  }, [
    getCurrentDate,
    isMonthEnd,
    processMonthEnd,
    advanceDay,
    updateDeadlinePressure,
    hasInterrupts,
    getNextInterrupt,
    shouldPauseForInterrupt,
    settings.autoPauseOnImportant,
    removeInterrupt,
    triggerRandomEvent,
    daysSinceLastEvent,
    resetDaysSinceEvent,
    onDayAdvance,
    onEventTriggered,
  ])

  // Handle quiet period skip
  const processQuietPeriod = useCallback(() => {
    if (!isQuietPeriod || quietPeriodDays <= 0) return

    if (settings.quietPeriodAutoSkip) {
      // Advance multiple days at once
      const currentDate = getCurrentDate()

      // Process month ends within the skip period
      let daysToProcess = quietPeriodDays
      while (daysToProcess > 0) {
        const daysInCurrentMonth = useTimeStore.getState().getDaysInCurrentMonth()
        const currentDay = useTimeStore.getState().currentDay
        const daysUntilMonthEnd = daysInCurrentMonth - currentDay

        if (daysUntilMonthEnd < daysToProcess) {
          // Process month end
          processMonthEnd(getCurrentDate())
        }
        daysToProcess -= Math.min(daysUntilMonthEnd + 1, daysToProcess)
      }

      advanceDays(quietPeriodDays)
      endQuietPeriod()
      onQuietPeriodStart?.(quietPeriodDays)
    }
  }, [
    isQuietPeriod,
    quietPeriodDays,
    settings.quietPeriodAutoSkip,
    getCurrentDate,
    processMonthEnd,
    advanceDays,
    endQuietPeriod,
    onQuietPeriodStart,
  ])

  // V3: Manual advance function for tap-to-advance mode
  const manualAdvance = useCallback(() => {
    if (advanceMode !== 'manual' || currentEvent || isProcessingRef.current) {
      return false
    }

    // Handle quiet periods
    if (isQuietPeriod && quietPeriodDays > 0) {
      processQuietPeriod()
      return true
    }

    // Process the day
    const eventTriggered = processDay()

    // Update foreshadowing for next day after a delay
    setTimeout(updateForeshadowing, 100)

    return eventTriggered
  }, [advanceMode, currentEvent, isQuietPeriod, quietPeriodDays, processQuietPeriod, processDay, updateForeshadowing])

  // Main timer effect (only for auto mode)
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // V3: In manual mode, don't auto-advance, but do update foreshadowing
    if (advanceMode === 'manual') {
      setAutoAdvanceTimer(null)
      updateForeshadowing()
      return
    }

    if (!shouldAutoRun) {
      setAutoAdvanceTimer(null)
      return
    }

    // Handle quiet periods first
    if (isQuietPeriod && settings.quietPeriodAutoSkip) {
      processQuietPeriod()
      return
    }

    // Calculate delay based on speed and pressure
    const delay = getEffectiveDayDuration({ settings, flowSpeed, deadlinePressure })

    // Set up the timer
    timerRef.current = window.setTimeout(() => {
      processDay()
    }, delay)

    setAutoAdvanceTimer(timerRef.current)

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [
    shouldAutoRun,
    advanceMode,
    flowSpeed,
    settings,
    deadlinePressure,
    isQuietPeriod,
    processDay,
    processQuietPeriod,
    setAutoAdvanceTimer,
    updateForeshadowing,
  ])

  // Manual controls
  const pause = useCallback(() => {
    useTimeStore.getState().pause()
  }, [])

  const resume = useCallback(() => {
    // Only resume if no event is showing
    if (!currentEvent) {
      useTimeStore.getState().resume()
    }
  }, [currentEvent])

  const skipDay = useCallback(() => {
    processDay()
  }, [processDay])

  // V3: Toggle between auto and manual mode
  const toggleAdvanceMode = useCallback(() => {
    const newMode: AdvanceMode = advanceMode === 'auto' ? 'manual' : 'auto'
    useTimeStore.getState().setAdvanceMode(newMode)

    // Pause when switching to manual
    if (newMode === 'manual') {
      useTimeStore.getState().pause()
    }
  }, [advanceMode])

  return {
    // V2 compatibility
    isPaused: flowMode === 'paused',
    isRunning: shouldAutoRun,
    flowSpeed,
    deadlinePressure,
    pause,
    resume,
    skipDay,

    // V3: Tap-to-advance additions
    advanceMode,
    isManualMode: advanceMode === 'manual',
    manualAdvance,
    toggleAdvanceMode,
    transitionState,
  }
}
