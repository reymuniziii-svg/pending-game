import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calendar, Coffee, Briefcase, Heart, Sun, Moon, Home, DollarSign } from 'lucide-react'
import { useTimeStore, useCharacterStore, useFinanceStore } from '@/stores'
import { cn } from '@/lib/utils'

interface QuietMonthsPanelProps {
  months: number
  onSkip: () => void
  onAdvanceOne: () => void
  className?: string
}

const MONTHS = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Activity snippets for quiet periods
const QUIET_ACTIVITIES = {
  routine: [
    { icon: Coffee, text: 'Morning routines' },
    { icon: Briefcase, text: 'Work continues' },
    { icon: Home, text: 'Quiet evenings' },
    { icon: Sun, text: 'Days pass by' },
    { icon: Moon, text: 'Nights of waiting' },
  ],
  positive: [
    { icon: Heart, text: 'Small joys' },
    { icon: Coffee, text: 'Coffee with friends' },
    { icon: Sun, text: 'Good weather' },
    { icon: Home, text: 'Family time' },
  ],
  waiting: [
    { icon: Calendar, text: 'Checking the mail' },
    { icon: Calendar, text: 'Waiting for news' },
    { icon: Calendar, text: 'Case pending...' },
    { icon: Calendar, text: 'No updates yet' },
  ],
}

// Generate random activities for months
function generateMonthActivities(count: number, startMonth: number, startYear: number) {
  const activities = []
  let month = startMonth
  let year = startYear

  for (let i = 0; i < count; i++) {
    month++
    if (month > 12) {
      month = 1
      year++
    }

    // Pick random activity type based on probabilities
    const roll = Math.random()
    let activitySet
    if (roll < 0.5) {
      activitySet = QUIET_ACTIVITIES.routine
    } else if (roll < 0.75) {
      activitySet = QUIET_ACTIVITIES.waiting
    } else {
      activitySet = QUIET_ACTIVITIES.positive
    }

    const activity = activitySet[Math.floor(Math.random() * activitySet.length)]

    activities.push({
      month,
      year,
      monthName: MONTHS[month],
      ...activity,
    })
  }

  return activities
}

export function QuietMonthsPanel({
  months,
  onSkip,
  onAdvanceOne,
  className,
}: QuietMonthsPanelProps) {
  const { currentMonth, currentYear } = useTimeStore()
  const { stats } = useCharacterStore()
  const { bankBalance, monthlyIncome, recurringExpenses } = useFinanceStore()

  // Generate activities for the quiet period
  const activities = useMemo(
    () => generateMonthActivities(months, currentMonth, currentYear),
    [months, currentMonth, currentYear]
  )

  // Calculate total monthly expenses from recurring expenses
  const totalMonthlyExpenses = useMemo(
    () => recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [recurringExpenses]
  )

  // Calculate projected finances after skip
  const projectedSavings = useMemo(() => {
    const monthlySavings = monthlyIncome - totalMonthlyExpenses
    return bankBalance + (monthlySavings * months)
  }, [bankBalance, monthlyIncome, totalMonthlyExpenses, months])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'bg-card border border-border rounded-xl p-6 shadow-lg',
        'max-w-md mx-auto',
        className
      )}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-serif font-semibold text-foreground">
          Quiet Period
        </h3>
        <p className="text-muted-foreground mt-1">
          {months} month{months > 1 ? 's' : ''} of everyday life...
        </p>
      </div>

      {/* Mini Calendar */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {activities.map((activity, index) => (
          <motion.div
            key={`${activity.month}-${activity.year}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-3 rounded-lg bg-muted/50 text-center',
              'border border-border/50',
              'hover:border-accent/30 transition-colors',
            )}
          >
            <div className="text-xs text-muted-foreground mb-1">
              {activity.monthName} {activity.year}
            </div>
            <activity.icon className="w-4 h-4 mx-auto text-accent/60 mb-1" />
            <div className="text-xs text-foreground/80 line-clamp-1">
              {activity.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Life Summary */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6 space-y-2">
        <p className="text-sm text-muted-foreground italic text-center">
          "Life continues quietly. Work, home, waiting..."
        </p>

        {/* Financial projection */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-success" />
          <span className="text-foreground">
            Projected balance: <span className="font-medium">${projectedSavings.toLocaleString()}</span>
          </span>
        </div>

        {/* Stats summary */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>Health: {stats.health}%</span>
          <span>Stress: {stats.stress}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          onClick={onAdvanceOne}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg border border-border',
            'text-sm font-medium text-foreground',
            'hover:bg-muted transition-colors',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          One Month
        </motion.button>

        <motion.button
          onClick={onSkip}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg',
            'bg-accent text-white text-sm font-medium',
            'hover:bg-accent/90 transition-colors',
            'shadow-md shadow-accent/20',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Skip {months} Months
        </motion.button>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd> to skip
      </p>
    </motion.div>
  )
}

// Compact version for inline display
export function QuietMonthsIndicator({
  months,
  className,
}: {
  months: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-muted/50 border border-border/50',
        'text-sm text-muted-foreground',
        className
      )}
    >
      <Calendar className="w-4 h-4" />
      <span>{months} quiet month{months > 1 ? 's' : ''} ahead</span>
    </motion.div>
  )
}

export default QuietMonthsPanel
