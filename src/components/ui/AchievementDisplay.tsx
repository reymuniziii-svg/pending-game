import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Award, Trophy, Star } from 'lucide-react'
import { useAchievementStore, usePrimaryRibbon } from '@/stores/useAchievementStore'
import {
  getAchievementById,
  ACHIEVEMENTS,
  CATEGORY_INFO,
  RARITY_INFO,
  RIBBON_COLORS,
  type Achievement,
  type AchievementCategory,
} from '@/data/achievements'
import { AchievementBadge } from './AchievementNotification'
import { cn } from '@/lib/utils'

interface AchievementDisplayProps {
  className?: string
}

// Full achievement display for ending screen
export function AchievementDisplay({ className }: AchievementDisplayProps) {
  const { getUnlockedAchievements, getUnlockedRibbons, totalUnlocked } = useAchievementStore()
  const primaryRibbonId = usePrimaryRibbon()

  const unlockedAchievements = getUnlockedAchievements()
  const unlockedRibbons = getUnlockedRibbons()
  const primaryRibbon = primaryRibbonId ? getAchievementById(primaryRibbonId) : unlockedRibbons[0]

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const grouped: Record<AchievementCategory, Achievement[]> = {
      journey: [],
      resilience: [],
      community: [],
      sacrifice: [],
      triumph: [],
    }

    for (const achievement of unlockedAchievements) {
      grouped[achievement.category].push(achievement)
    }

    return grouped
  }, [unlockedAchievements])

  const totalAchievements = ACHIEVEMENTS.length

  return (
    <div className={cn('space-y-8', className)}>
      {/* Primary Ribbon Display */}
      {primaryRibbon && <PrimaryRibbonDisplay achievement={primaryRibbon} />}

      {/* Stats Summary */}
      <div className="flex items-center justify-center gap-6 text-center">
        <div>
          <p className="text-3xl font-bold text-foreground">{totalUnlocked}</p>
          <p className="text-sm text-muted-foreground">Achievements</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <p className="text-3xl font-bold text-foreground">{unlockedRibbons.length}</p>
          <p className="text-sm text-muted-foreground">Ribbons</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <p className="text-3xl font-bold text-foreground">
            {Math.round((totalUnlocked / totalAchievements) * 100)}%
          </p>
          <p className="text-sm text-muted-foreground">Complete</p>
        </div>
      </div>

      {/* Ribbons Row */}
      {unlockedRibbons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Triumph Ribbons
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {unlockedRibbons.map((ribbon) => (
              <RibbonBadge key={ribbon.id} achievement={ribbon} />
            ))}
          </div>
        </div>
      )}

      {/* Achievement Categories */}
      {Object.entries(achievementsByCategory).map(([category, achievements]) => {
        if (achievements.length === 0 || category === 'triumph') return null
        const categoryInfo = CATEGORY_INFO[category as AchievementCategory]

        return (
          <div key={category} className="space-y-3">
            <h3 className={cn(
              'text-sm font-semibold uppercase tracking-wider',
              categoryInfo.color
            )}>
              {categoryInfo.label} ({achievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked
                  showDetails={false}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Large primary ribbon display
function PrimaryRibbonDisplay({ achievement }: { achievement: Achievement }) {
  const ribbonStyle = achievement.ribbonColor
    ? RIBBON_COLORS[achievement.ribbonColor]
    : null

  if (!ribbonStyle) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      className="flex flex-col items-center"
    >
      {/* Ribbon shape */}
      <div
        className={cn(
          'relative w-32 h-40 flex flex-col items-center justify-center',
          `bg-gradient-to-b ${ribbonStyle.gradient}`,
          'rounded-t-lg shadow-xl',
          ribbonStyle.glow
        )}
      >
        {/* Inner content */}
        <Trophy className={cn('w-12 h-12 mb-2', ribbonStyle.text)} />
        <p className={cn('text-sm font-bold text-center px-2', ribbonStyle.text)}>
          {achievement.name}
        </p>

        {/* Ribbon tails */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex">
          <div
            className={cn(
              'w-8 h-10 -mr-1',
              `bg-gradient-to-b ${ribbonStyle.gradient}`,
              'transform skew-x-12'
            )}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            }}
          />
          <div
            className={cn(
              'w-8 h-10 -ml-1',
              `bg-gradient-to-b ${ribbonStyle.gradient}`,
              'transform -skew-x-12'
            )}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            }}
          />
        </div>
      </div>

      {/* Achievement name below */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-lg font-semibold text-foreground text-center"
      >
        {achievement.description}
      </motion.p>
    </motion.div>
  )
}

// Compact ribbon badge for collections
function RibbonBadge({ achievement }: { achievement: Achievement }) {
  const ribbonStyle = achievement.ribbonColor
    ? RIBBON_COLORS[achievement.ribbonColor]
    : null

  if (!ribbonStyle) return null

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        'relative w-16 h-20 flex flex-col items-center justify-center rounded-t-md',
        `bg-gradient-to-b ${ribbonStyle.gradient}`,
        'shadow-lg cursor-default',
        ribbonStyle.glow
      )}
      title={`${achievement.name}: ${achievement.description}`}
    >
      <Award className={cn('w-6 h-6', ribbonStyle.text)} />

      {/* Mini tails */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex">
        <div
          className={cn(
            'w-4 h-4 -mr-0.5',
            `bg-gradient-to-b ${ribbonStyle.gradient}`,
            'transform skew-x-12'
          )}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)',
          }}
        />
        <div
          className={cn(
            'w-4 h-4 -ml-0.5',
            `bg-gradient-to-b ${ribbonStyle.gradient}`,
            'transform -skew-x-12'
          )}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)',
          }}
        />
      </div>
    </motion.div>
  )
}

// Mini achievement progress bar
interface AchievementProgressProps {
  className?: string
}

export function AchievementProgress({ className }: AchievementProgressProps) {
  const { totalUnlocked } = useAchievementStore()
  const total = ACHIEVEMENTS.length
  const percentage = Math.round((totalUnlocked / total) * 100)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Trophy className="w-4 h-4 text-amber-500" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {totalUnlocked}/{total}
      </span>
    </div>
  )
}

// Summary for game over screens
interface AchievementSummaryProps {
  newAchievements?: string[] // IDs of achievements unlocked this session
  className?: string
}

export function AchievementSummary({
  newAchievements = [],
  className,
}: AchievementSummaryProps) {
  const achievements = newAchievements
    .map(id => getAchievementById(id))
    .filter((a): a is Achievement => a !== undefined)

  if (achievements.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
        <Star className="w-4 h-4" />
        New Achievements ({achievements.length})
      </h3>
      <div className="space-y-2">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementBadge
              achievement={achievement}
              unlocked
              showDetails
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AchievementDisplay
