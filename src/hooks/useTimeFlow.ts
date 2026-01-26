import { useEffect, useCallback, useRef } from 'react'
import { useTimeStore, useEventStore, useFinanceStore } from '@/stores'
import { useEventEngine } from './useEventEngine'
import { getEffectiveMonthDuration } from '@/stores/useTimeStore'
import type { AdvanceMode } from '@/stores/useTimeStore'

interface UseTimeFlowOptions {
  enabled?: boolean
  onMonthAdvance?: () => void
  onEventTriggered?: (eventId: string) => void
  onQuietPeriodStart?: (months: number) => void
  onForeshadowing?: (hint: string) => void  // V3: Foreshadowing callback
}

export function useTimeFlow(options: UseTimeFlowOptions = {}) {
  const {
    enabled = true,
    onMonthAdvance,
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
    quietPeriodMonths,
    advanceMonth,
    advanceMonths,
    endQuietPeriod,
    updateDeadlinePressure,
    getCurrentDate,
    setAutoAdvanceTimer,
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

  // Process a single month advance
  const processMonth = useCallback(() => {
    if (isProcessingRef.current) return false
    isProcessingRef.current = true

    try {
      const currentDate = getCurrentDate()

      // Process finances
      processMonthEnd(currentDate)

      // Advance time
      advanceMonth()
      onMonthAdvance?.()

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
          isProcessingRef.current = false
          return true  // Event triggered
        }
      }

      // Try to trigger a random event
      const eventTriggered = triggerRandomEvent()
      if (eventTriggered) {
        // Pause while event is shown
        useTimeStore.getState().pause()
        isProcessingRef.current = false
        return true
      }

      isProcessingRef.current = false
      return false  // No event
    } catch (error) {
      console.error('Error processing month:', error)
      isProcessingRef.current = false
      return false
    }
  }, [
    getCurrentDate,
    processMonthEnd,
    advanceMonth,
    updateDeadlinePressure,
    hasInterrupts,
    getNextInterrupt,
    shouldPauseForInterrupt,
    settings.autoPauseOnImportant,
    removeInterrupt,
    triggerRandomEvent,
    onMonthAdvance,
    onEventTriggered,
  ])

  // Handle quiet period skip
  const processQuietPeriod = useCallback(() => {
    if (!isQuietPeriod || quietPeriodMonths <= 0) return

    if (settings.quietPeriodAutoSkip) {
      // Advance multiple months at once
      const currentDate = getCurrentDate()

      for (let i = 0; i < quietPeriodMonths; i++) {
        processMonthEnd(currentDate)
      }

      advanceMonths(quietPeriodMonths)
      endQuietPeriod()
      onQuietPeriodStart?.(quietPeriodMonths)
    }
  }, [
    isQuietPeriod,
    quietPeriodMonths,
    settings.quietPeriodAutoSkip,
    getCurrentDate,
    processMonthEnd,
    advanceMonths,
    endQuietPeriod,
    onQuietPeriodStart,
  ])

  // V3: Manual advance function for tap-to-advance mode
  const manualAdvance = useCallback(() => {
    if (advanceMode !== 'manual' || currentEvent || isProcessingRef.current) {
      return false
    }

    // Handle quiet periods
    if (isQuietPeriod && quietPeriodMonths > 0) {
      processQuietPeriod()
      return true
    }

    // Process the month
    const eventTriggered = processMonth()

    // Update foreshadowing for next month after a delay
    setTimeout(updateForeshadowing, 100)

    return eventTriggered
  }, [advanceMode, currentEvent, isQuietPeriod, quietPeriodMonths, processQuietPeriod, processMonth, updateForeshadowing])

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
    const delay = getEffectiveMonthDuration({ settings, flowSpeed, deadlinePressure })

    // Set up the timer
    timerRef.current = window.setTimeout(() => {
      processMonth()
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
    processMonth,
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

  const skipMonth = useCallback(() => {
    processMonth()
  }, [processMonth])

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
    skipMonth,

    // V3: Tap-to-advance additions
    advanceMode,
    isManualMode: advanceMode === 'manual',
    manualAdvance,
    toggleAdvanceMode,
    transitionState,
  }
}
