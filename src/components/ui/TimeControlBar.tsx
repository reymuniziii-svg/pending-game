import { Pause, Play, FastForward, SkipForward } from 'lucide-react'
import { useTimeStore } from '@/stores'
import { Button } from './Button'
import type { TimeFlowSpeed } from '@/types'

interface TimeControlBarProps {
  onPause?: () => void
  onResume?: () => void
  disabled?: boolean
}

export function TimeControlBar({ onPause, onResume, disabled = false }: TimeControlBarProps) {
  const {
    flowMode,
    flowSpeed,
    deadlinePressure,
    setFlowMode,
    setFlowSpeed,
    togglePause,
    getFormattedDate,
  } = useTimeStore()

  const isPaused = flowMode === 'paused'

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

  // Pressure indicator color
  const getPressureColor = () => {
    if (deadlinePressure >= 80) return 'bg-danger'
    if (deadlinePressure >= 50) return 'bg-warning'
    if (deadlinePressure >= 20) return 'bg-accent'
    return 'bg-muted'
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-card border border-border rounded-lg">
      {/* Play/Pause Button */}
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

      {/* Speed Controls */}
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

      {/* Date Display */}
      <div className="flex-1 text-center border-l border-border pl-3">
        <span className="font-medium text-sm">{getFormattedDate()}</span>
      </div>

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

      {/* Paused Indicator */}
      {isPaused && (
        <div className="text-xs text-muted-foreground font-mono">
          PAUSED
        </div>
      )}
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
