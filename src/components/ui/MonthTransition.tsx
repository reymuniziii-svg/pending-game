import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calendar, ChevronRight, Clock, AlertTriangle } from 'lucide-react'
import { useTimeStore } from '@/stores'
import { cn } from '@/lib/utils'

interface MonthTransitionProps {
  onAdvance: () => void
  disabled?: boolean
  hasUpcomingEvent?: boolean
  eventHint?: string | null
  className?: string
}

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthTransition({
  onAdvance,
  disabled = false,
  hasUpcomingEvent = false,
  eventHint,
  className,
}: MonthTransitionProps) {
  const {
    currentMonth,
    currentYear,
    transitionState,
    teaserMessage,
    deadlinePressure,
    canAdvance,
    startTransition,
    completeTransition,
  } = useTimeStore()

  const [isAnimating, setIsAnimating] = useState(false)
  const [showNewMonth, setShowNewMonth] = useState(false)

  // Calculate next month for preview
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear

  // Handle the advance button click
  const handleAdvance = useCallback(() => {
    if (disabled || isAnimating || !canAdvance) return

    setIsAnimating(true)
    startTransition()

    // Phase 1: Show teaser (500ms)
    setTimeout(() => {
      setShowNewMonth(true)
    }, 500)

    // Phase 2: Flip animation (800ms)
    setTimeout(() => {
      onAdvance()
      completeTransition()
      setIsAnimating(false)
      setShowNewMonth(false)
    }, 1300)
  }, [disabled, isAnimating, canAdvance, startTransition, onAdvance, completeTransition])

  // Pressure level affects button styling
  const getPressureLevel = () => {
    if (deadlinePressure >= 80) return 'critical'
    if (deadlinePressure >= 50) return 'high'
    if (deadlinePressure >= 20) return 'medium'
    return 'low'
  }

  const pressureLevel = getPressureLevel()

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Calendar Display */}
      <div className="relative perspective-1000">
        <AnimatePresence mode="wait">
          {/* Current Month Card */}
          <motion.div
            key={`${currentMonth}-${currentYear}`}
            className={cn(
              'relative w-64 h-36 rounded-xl shadow-lg overflow-hidden',
              'bg-gradient-to-br from-white to-slate-50',
              'border-2',
              pressureLevel === 'critical' && 'border-danger/50 shadow-danger/20',
              pressureLevel === 'high' && 'border-warning/50 shadow-warning/20',
              pressureLevel === 'medium' && 'border-accent/30',
              pressureLevel === 'low' && 'border-border',
            )}
            initial={{ rotateX: 0 }}
            animate={{
              rotateX: showNewMonth ? -90 : 0,
              opacity: showNewMonth ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Calendar Header */}
            <div className={cn(
              'h-8 flex items-center justify-center text-white font-medium text-sm',
              pressureLevel === 'critical' && 'bg-danger',
              pressureLevel === 'high' && 'bg-warning',
              pressureLevel === 'medium' && 'bg-accent',
              pressureLevel === 'low' && 'bg-primary',
            )}>
              <Calendar className="w-4 h-4 mr-2" />
              {currentYear}
            </div>

            {/* Month Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <span className="text-4xl font-serif font-bold text-foreground">
                {MONTHS[currentMonth]}
              </span>
              {deadlinePressure > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Deadline pressure: {Math.round(deadlinePressure)}%</span>
                </div>
              )}
            </div>

            {/* Subtle calendar grid decoration */}
            <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-20">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-foreground rounded-full" />
              ))}
            </div>
          </motion.div>

          {/* New Month Card (appears during flip) */}
          {showNewMonth && (
            <motion.div
              key={`next-${nextMonth}-${nextYear}`}
              className={cn(
                'absolute inset-0 w-64 h-36 rounded-xl shadow-lg overflow-hidden',
                'bg-gradient-to-br from-white to-slate-50',
                'border-2 border-accent/30',
              )}
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="h-8 flex items-center justify-center bg-accent text-white font-medium text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {nextYear}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-4xl font-serif font-bold text-foreground">
                  {MONTHS[nextMonth]}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teaser Message */}
      <AnimatePresence>
        {teaserMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-muted-foreground italic font-serif">{teaserMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Hint / Foreshadowing */}
      {eventHint && !isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-warning"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="italic">{eventHint}</span>
        </motion.div>
      )}

      {/* Advance Button */}
      <motion.button
        onClick={handleAdvance}
        disabled={disabled || isAnimating || !canAdvance}
        className={cn(
          'group relative px-8 py-4 rounded-xl font-medium text-lg',
          'transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          // Default state
          !disabled && !isAnimating && canAdvance && [
            'bg-gradient-to-r from-accent to-accent/80',
            'text-white shadow-lg shadow-accent/25',
            'hover:shadow-xl hover:shadow-accent/30 hover:scale-105',
            'active:scale-95',
          ],
          // Pressure states
          pressureLevel === 'critical' && !disabled && [
            'bg-gradient-to-r from-danger to-danger/80',
            'shadow-danger/25 hover:shadow-danger/30',
            'animate-pulse',
          ],
          pressureLevel === 'high' && !disabled && [
            'bg-gradient-to-r from-warning to-warning/80',
            'shadow-warning/25 hover:shadow-warning/30',
          ],
          // Disabled state
          (disabled || isAnimating || !canAdvance) && [
            'bg-muted text-muted-foreground cursor-not-allowed',
            'opacity-50',
          ],
        )}
        whileHover={!disabled && !isAnimating && canAdvance ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isAnimating && canAdvance ? { scale: 0.98 } : {}}
      >
        <span className="flex items-center gap-3">
          {isAnimating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Clock className="w-5 h-5" />
              </motion.div>
              Time passes...
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Advance Month
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </span>

        {/* Subtle shimmer effect */}
        {!disabled && !isAnimating && canAdvance && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
      </motion.button>

      {/* Keyboard hint */}
      {!disabled && canAdvance && !isAnimating && (
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to advance
        </p>
      )}
    </div>
  )
}

// Smaller inline version for the control bar
export function MonthAdvanceButton({
  onAdvance,
  disabled = false,
  className,
}: {
  onAdvance: () => void
  disabled?: boolean
  className?: string
}) {
  const { canAdvance, deadlinePressure, transitionState } = useTimeStore()
  const isAnimating = transitionState !== 'idle'

  const getPressureColor = () => {
    if (deadlinePressure >= 80) return 'bg-danger hover:bg-danger/90'
    if (deadlinePressure >= 50) return 'bg-warning hover:bg-warning/90'
    return 'bg-accent hover:bg-accent/90'
  }

  return (
    <motion.button
      onClick={onAdvance}
      disabled={disabled || isAnimating || !canAdvance}
      className={cn(
        'px-4 py-2 rounded-lg font-medium text-white text-sm',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        getPressureColor(),
        (disabled || isAnimating || !canAdvance) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      whileHover={!disabled && !isAnimating && canAdvance ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isAnimating && canAdvance ? { scale: 0.98 } : {}}
    >
      <span className="flex items-center gap-2">
        {isAnimating ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-4 h-4" />
          </motion.div>
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {isAnimating ? 'Advancing...' : 'Next Month'}
      </span>
    </motion.button>
  )
}

export default MonthTransition
