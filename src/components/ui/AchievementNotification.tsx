import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Award,
  Trophy,
  Star,
  Heart,
  Shield,
  Users,
  Map,
  X,
  Sparkles,
} from 'lucide-react'
import { useAchievementStore, useCurrentNotification } from '@/stores/useAchievementStore'
import {
  getAchievementById,
  CATEGORY_INFO,
  RARITY_INFO,
  RIBBON_COLORS,
  type Achievement,
} from '@/data/achievements'
import { cn } from '@/lib/utils'

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Trophy,
  Star,
  Heart,
  Shield,
  Users,
  Map,
  Sparkles,
}

interface AchievementNotificationProps {
  className?: string
  autoDismissMs?: number
}

export function AchievementNotification({
  className,
  autoDismissMs = 5000,
}: AchievementNotificationProps) {
  const currentNotificationId = useCurrentNotification()
  const { dismissNotification } = useAchievementStore()

  const achievement = currentNotificationId
    ? getAchievementById(currentNotificationId)
    : null

  // Auto-dismiss after delay
  useEffect(() => {
    if (currentNotificationId && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        dismissNotification()
      }, autoDismissMs)
      return () => clearTimeout(timer)
    }
  }, [currentNotificationId, autoDismissMs, dismissNotification])

  const categoryInfo = achievement
    ? CATEGORY_INFO[achievement.category]
    : null
  const rarityInfo = achievement
    ? RARITY_INFO[achievement.rarity]
    : null
  const ribbonStyle = achievement?.ribbonColor
    ? RIBBON_COLORS[achievement.ribbonColor]
    : null

  const IconComponent = achievement?.icon
    ? iconMap[achievement.icon] || Award
    : Award

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-[100]',
            'w-[90vw] max-w-sm',
            className
          )}
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-xl border-2 shadow-2xl',
              ribbonStyle
                ? `bg-gradient-to-br ${ribbonStyle.gradient} ${ribbonStyle.border}`
                : `bg-card border-border`,
              ribbonStyle && `shadow-lg ${ribbonStyle.glow}`
            )}
          >
            {/* Sparkle effect for legendary/epic */}
            {(achievement.rarity === 'legendary' || achievement.rarity === 'epic') && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            )}

            {/* Content */}
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full',
                    ribbonStyle
                      ? 'bg-white/30 backdrop-blur-sm'
                      : rarityInfo?.bgColor || 'bg-accent/10'
                  )}
                >
                  <IconComponent
                    className={cn(
                      'w-6 h-6',
                      ribbonStyle
                        ? ribbonStyle.text
                        : rarityInfo?.color || 'text-accent'
                    )}
                  />
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider mb-0.5',
                      ribbonStyle
                        ? ribbonStyle.text + '/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    Achievement Unlocked!
                  </motion.p>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                      'font-bold text-lg leading-tight',
                      ribbonStyle ? ribbonStyle.text : 'text-foreground'
                    )}
                  >
                    {achievement.name}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                      'text-sm mt-1',
                      ribbonStyle
                        ? ribbonStyle.text + '/80'
                        : 'text-muted-foreground'
                    )}
                  >
                    {achievement.description}
                  </motion.p>
                </div>

                {/* Close button */}
                <button
                  onClick={dismissNotification}
                  className={cn(
                    'p-1 rounded-full transition-colors',
                    ribbonStyle
                      ? 'hover:bg-white/20 text-white/70 hover:text-white'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Footer badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mt-3"
              >
                {/* Category badge */}
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    ribbonStyle
                      ? 'bg-white/20 ' + ribbonStyle.text
                      : categoryInfo?.bgColor + ' ' + categoryInfo?.color
                  )}
                >
                  {categoryInfo?.label}
                </span>

                {/* Rarity badge */}
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    ribbonStyle
                      ? 'bg-white/20 ' + ribbonStyle.text
                      : rarityInfo?.bgColor + ' ' + rarityInfo?.color
                  )}
                >
                  {rarityInfo?.label}
                </span>
              </motion.div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoDismissMs / 1000, ease: 'linear' }}
              className={cn(
                'absolute bottom-0 left-0 h-1 origin-left',
                ribbonStyle ? 'bg-white/30' : 'bg-accent/30'
              )}
              style={{ width: '100%' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Compact achievement badge for lists
interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
  showDetails?: boolean
  className?: string
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  unlocked = false,
  showDetails = true,
  className,
  onClick,
}: AchievementBadgeProps) {
  const categoryInfo = CATEGORY_INFO[achievement.category]
  const rarityInfo = RARITY_INFO[achievement.rarity]
  const ribbonStyle = achievement.ribbonColor
    ? RIBBON_COLORS[achievement.ribbonColor]
    : null

  const IconComponent = iconMap[achievement.icon] || Award

  return (
    <motion.button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-lg border transition-all',
        'text-left w-full',
        unlocked
          ? ribbonStyle
            ? `bg-gradient-to-br ${ribbonStyle.gradient} ${ribbonStyle.border}`
            : `bg-card border-${rarityInfo.borderColor} hover:shadow-md`
          : 'bg-muted/50 border-muted opacity-60',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          unlocked
            ? ribbonStyle
              ? 'bg-white/30'
              : rarityInfo.bgColor
            : 'bg-muted'
        )}
      >
        <IconComponent
          className={cn(
            'w-5 h-5',
            unlocked
              ? ribbonStyle
                ? ribbonStyle.text
                : rarityInfo.color
              : 'text-muted-foreground'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'font-semibold text-sm truncate',
            unlocked
              ? ribbonStyle
                ? ribbonStyle.text
                : 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {unlocked || !achievement.secret
            ? achievement.name
            : '???'}
        </h4>
        {showDetails && (
          <p
            className={cn(
              'text-xs truncate',
              unlocked
                ? ribbonStyle
                  ? ribbonStyle.text + '/80'
                  : 'text-muted-foreground'
                : 'text-muted-foreground/60'
            )}
          >
            {unlocked || !achievement.secret
              ? achievement.description
              : 'Hidden achievement'}
          </p>
        )}
      </div>

      {/* Locked indicator */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/30">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs">🔒</span>
          </div>
        </div>
      )}
    </motion.button>
  )
}

export default AchievementNotification
