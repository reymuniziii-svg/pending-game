import { useEffect, useCallback, useRef } from 'react'
import { useTimeStore, useEventStore, useFinanceStore } from '@/stores'
import { useEventEngine } from './useEventEngine'
import { getEffectiveMonthDuration } from '@/stores/useTimeStore'

interface UseTimeFlowOptions {
  enabled?: boolean
  onMonthAdvance?: () => void
  onEventTriggered?: (eventId: string) => void
  onQuietPeriodStart?: (months: number) => void
}

export function useTimeFlow(options: UseTimeFlowOptions = {}) {
  const {
    enabled = true,
    onMonthAdvance,
    onEventTriggered,
    onQuietPeriodStart,
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
  } = useTimeStore()

  const {
    currentEvent,
    hasInterrupts,
    getNextInterrupt,
    removeInterrupt,
    shouldPauseForInterrupt,
  } = useEventStore()

  const { processMonthEnd } = useFinanceStore()
  const { selectNextEvent, setCurrentEvent, triggerRandomEvent } = useEventEngine()

  // Check if we should be running
  const shouldRun = enabled && flowMode !== 'paused' && !currentEvent && !isProcessingRef.current

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

  // Main timer effect
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!shouldRun) {
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
    shouldRun,
    flowSpeed,
    settings,
    deadlinePressure,
    isQuietPeriod,
    processMonth,
    processQuietPeriod,
    setAutoAdvanceTimer,
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

  return {
    isPaused: flowMode === 'paused',
    isRunning: shouldRun,
    flowSpeed,
    deadlinePressure,
    pause,
    resume,
    skipMonth,
  }
}
