import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Pause, Play, FastForward, SkipForward, ChevronRight, Settings2, Calendar } from 'lucide-react'
import { useTimeStore } from '@/stores'
import { Button } from './Button'
import type { TimeFlowSpeed } from '@/types'
import { cn } from '@/lib/utils'

interface TimeControlBarProps {
  onPause?: () => void
  onResume?: () => void
  onManualAdvance?: () => void  // V3: Manual advance callback
  disabled?: boolean
  eventHint?: string | null  // V3: Foreshadowing hint
}

export function TimeControlBar({
  onPause,
  onResume,
  onManualAdvance,
  disabled = false,
  eventHint,
}: TimeControlBarProps) {
  const [showModeMenu, setShowModeMenu] = useState(false)

  const {
    flowMode,
    flowSpeed,
    deadlinePressure,
    advanceMode,
    transitionState,
    canAdvance,
    setFlowMode,
    setFlowSpeed,
    togglePause,
    setAdvanceMode,
    getFormattedDate,
  } = useTimeStore()

  const isPaused = flowMode === 'paused'
  const isManualMode = advanceMode === 'manual'
  const isTransitioning = transitionState !== 'idle'

  const handleTogglePause = () => {
    if (isPaused) {
      onResume?.()
    } else {
      onPause?.()
    }
    togglePause()
  }

  const handleSpeedChange = (speed: TimeFlowSpeed) => {
    setFlowSpeed(speed)
    if (flowMode !== 'paused') {
      setFlowMode(speed === 1 ? 'normal' : speed === 2 ? 'fast' : 'faster')
    }
  }

  const handleModeToggle = () => {
    const newMode = isManualMode ? 'auto' : 'manual'
    setAdvanceMode(newMode)
    setShowModeMenu(false)
  }

  const handleManualAdvance = () => {
    if (isManualMode && canAdvance && !isTransitioning) {
      onManualAdvance?.()
    }
  }

  // Pressure indicator color
  const getPressureColor = () => {
    if (deadlinePressure >= 80) return 'bg-danger'
    if (deadlinePressure >= 50) return 'bg-warning'
    if (deadlinePressure >= 20) return 'bg-accent'
    return 'bg-muted'
  }

  // Button color based on pressure
  const getAdvanceButtonClass = () => {
    if (deadlinePressure >= 80) return 'bg-danger hover:bg-danger/90 text-white'
    if (deadlinePressure >= 50) return 'bg-warning hover:bg-warning/90 text-white'
    return 'bg-accent hover:bg-accent/90 text-white'
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-card border border-border rounded-lg">
      {/* V3: Manual Mode - Advance Month Button */}
      {isManualMode ? (
        <motion.button
          onClick={handleManualAdvance}
          disabled={disabled || isTransitioning || !canAdvance}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
            getAdvanceButtonClass(),
            (disabled || isTransitioning || !canAdvance) && 'opacity-50 cursor-not-allowed',
          )}
          whileHover={!disabled && !isTransitioning && canAdvance ? { scale: 1.02 } : {}}
          whileTap={!disabled && !isTransitioning && canAdvance ? { scale: 0.98 } : {}}
        >
          {isTransitioning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Calendar className="h-4 w-4" />
              </motion.div>
              <span>Advancing...</span>
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>Next Month</span>
            </>
          )}
        </motion.button>
      ) : (
        <>
          {/* Auto Mode - Play/Pause Button */}
          <Button
            variant={isPaused ? 'default' : 'outline'}
            size="sm"
            onClick={handleTogglePause}
            disabled={disabled}
            className="w-10 h-10 p-0"
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>

          {/* Speed Controls (only in auto mode) */}
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <SpeedButton
              speed={1}
              currentSpeed={flowSpeed}
              onClick={() => handleSpeedChange(1)}
              disabled={disabled}
              label="1x"
            />
            <SpeedButton
              speed={2}
              currentSpeed={flowSpeed}
              onClick={() => handleSpeedChange(2)}
              disabled={disabled}
              icon={<FastForward className="h-3 w-3" />}
              label="2x"
            />
            <SpeedButton
              speed={4}
              currentSpeed={flowSpeed}
              onClick={() => handleSpeedChange(4)}
              disabled={disabled}
              icon={<SkipForward className="h-3 w-3" />}
              label="4x"
            />
          </div>
        </>
      )}

      {/* Date Display */}
      <div className="flex-1 text-center border-l border-border pl-3">
        <span className="font-medium text-sm">{getFormattedDate()}</span>
      </div>

      {/* Event Hint / Foreshadowing (V3) */}
      <AnimatePresence>
        {eventHint && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="hidden md:flex items-center gap-2 text-xs text-muted-foreground italic border-l border-border pl-3"
          >
            <span>{eventHint}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deadline Pressure Indicator */}
      {deadlinePressure > 0 && (
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getPressureColor()} animate-pulse`} />
            <span className="text-xs text-muted-foreground">
              {deadlinePressure >= 80 ? 'URGENT' :
               deadlinePressure >= 50 ? 'Deadline' :
               'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="relative border-l border-border pl-3">
        <button
          onClick={() => setShowModeMenu(!showModeMenu)}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title={`Mode: ${isManualMode ? 'Manual' : 'Auto'}`}
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Mode Menu Dropdown */}
        <AnimatePresence>
          {showModeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1">Time Control Mode</p>
                <button
                  onClick={handleModeToggle}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-muted',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{isManualMode ? 'Switch to Auto' : 'Switch to Manual'}</span>
                    <span className="text-xs text-muted-foreground">
                      {isManualMode ? '(Tap to Advance)' : '(Auto-play)'}
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Indicator */}
      {isManualMode ? (
        <div className="text-xs text-accent font-mono">
          TAP
        </div>
      ) : isPaused ? (
        <div className="text-xs text-muted-foreground font-mono">
          PAUSED
        </div>
      ) : null}
    </div>
  )
}

interface SpeedButtonProps {
  speed: TimeFlowSpeed
  currentSpeed: TimeFlowSpeed
  onClick: () => void
  disabled: boolean
  icon?: React.ReactNode
  label: string
}

function SpeedButton({ speed, currentSpeed, onClick, disabled, icon, label }: SpeedButtonProps) {
  const isActive = currentSpeed === speed

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-2 py-1 text-xs rounded transition-colors
        ${isActive
          ? 'bg-accent text-white'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  )
}
