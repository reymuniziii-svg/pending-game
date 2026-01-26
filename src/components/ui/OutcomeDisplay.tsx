import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Heart,
  HeartCrack,
  Zap,
  Brain,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'
import type { EventOutcome } from '@/types'
import { cn } from '@/lib/utils'
import { ApprovalAnimation, DenialAnimation } from './LottieAnimation'

interface OutcomeDisplayProps {
  outcomes: EventOutcome[]
  narrativeText?: string
  onComplete?: () => void
  className?: string
}

// Map outcome types to display info
const outcomeIcons: Record<string, ReactNode> = {
  'stat-change': <Activity className="w-5 h-5" />,
  'finance-add': <DollarSign className="w-5 h-5 text-success" />,
  'finance-subtract': <DollarSign className="w-5 h-5 text-danger" />,
  'relationship-change': <Heart className="w-5 h-5" />,
  'flag-set': <Sparkles className="w-5 h-5" />,
  'status-change': <AlertTriangle className="w-5 h-5" />,
}

// Stat icons
const statIcons: Record<string, ReactNode> = {
  health: <Activity className="w-4 h-4" />,
  stress: <Zap className="w-4 h-4" />,
  wellbeing: <Brain className="w-4 h-4" />,
  stability: <TrendingUp className="w-4 h-4" />,
}

interface StatDelta {
  type: 'stat' | 'money' | 'relationship' | 'status'
  label: string
  value: number | string
  isPositive: boolean
  icon?: ReactNode
}

// Parse outcomes into display-friendly deltas
function parseOutcomesToDeltas(outcomes: EventOutcome[]): StatDelta[] {
  const deltas: StatDelta[] = []

  for (const outcome of outcomes) {
    switch (outcome.type) {
      case 'stat-change':
        const statValue = outcome.value as number
        deltas.push({
          type: 'stat',
          label: outcome.target.charAt(0).toUpperCase() + outcome.target.slice(1),
          value: statValue,
          isPositive: statValue > 0,
          icon: statIcons[outcome.target] || <Activity className="w-4 h-4" />,
        })
        break

      case 'finance-add':
        deltas.push({
          type: 'money',
          label: 'Money',
          value: outcome.value as number,
          isPositive: true,
          icon: <DollarSign className="w-4 h-4" />,
        })
        break

      case 'finance-subtract':
        deltas.push({
          type: 'money',
          label: 'Money',
          value: -(outcome.value as number),
          isPositive: false,
          icon: <DollarSign className="w-4 h-4" />,
        })
        break

      case 'relationship-change':
        const relValue = outcome.value as number
        deltas.push({
          type: 'relationship',
          label: outcome.target,
          value: relValue,
          isPositive: relValue > 0,
          icon: relValue > 0 ? <Heart className="w-4 h-4" /> : <HeartCrack className="w-4 h-4" />,
        })
        break

      case 'status-change':
        deltas.push({
          type: 'status',
          label: 'Status',
          value: outcome.target,
          isPositive: !outcome.target.toLowerCase().includes('denied'),
          icon: <AlertTriangle className="w-4 h-4" />,
        })
        break
    }
  }

  return deltas
}

export function OutcomeDisplay({
  outcomes,
  narrativeText,
  onComplete,
  className,
}: OutcomeDisplayProps) {
  const [showDeltas, setShowDeltas] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [textComplete, setTextComplete] = useState(false)

  const deltas = parseOutcomesToDeltas(outcomes)

  // Check for major status changes
  const hasApproval = outcomes.some(o =>
    o.type === 'status-change' && o.target.toLowerCase().includes('approved')
  )
  const hasDenial = outcomes.some(o =>
    o.type === 'status-change' && o.target.toLowerCase().includes('denied')
  )

  // Typewriter effect for narrative text
  useEffect(() => {
    if (!narrativeText) {
      setTextComplete(true)
      setShowDeltas(true)
      return
    }

    let index = 0
    const speed = 30 // ms per character

    const timer = setInterval(() => {
      if (index < narrativeText.length) {
        setDisplayedText(narrativeText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setTextComplete(true)
        // Show deltas after text completes
        setTimeout(() => setShowDeltas(true), 300)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [narrativeText])

  // Handle completion
  useEffect(() => {
    if (textComplete && showDeltas) {
      // Allow time for delta animations before calling onComplete
      const timer = setTimeout(() => {
        onComplete?.()
      }, deltas.length * 200 + 1000)

      return () => clearTimeout(timer)
    }
  }, [textComplete, showDeltas, deltas.length, onComplete])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Major Status Animation */}
      <AnimatePresence>
        {hasApproval && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <ApprovalAnimation className="w-24 h-24" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-success font-bold text-lg"
              >
                APPROVED
              </motion.div>
            </div>
          </motion.div>
        )}

        {hasDenial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <DenialAnimation className="w-24 h-24" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-danger font-bold text-lg"
              >
                DENIED
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narrative Text with Typewriter Effect */}
      {narrativeText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="narrative text-lg leading-relaxed text-center"
        >
          {displayedText}
          {!textComplete && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-foreground ml-0.5 align-middle"
            />
          )}
        </motion.div>
      )}

      {/* Stat Deltas - Floating Up Animation */}
      <AnimatePresence>
        {showDeltas && deltas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {deltas.map((delta, index) => (
              <DeltaChip
                key={`${delta.type}-${delta.label}-${index}`}
                delta={delta}
                delay={index * 0.15}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Individual delta chip with floating animation
function DeltaChip({ delta, delay }: { delta: StatDelta; delay: number }) {
  const formatValue = () => {
    if (delta.type === 'money') {
      const num = delta.value as number
      const prefix = num >= 0 ? '+$' : '-$'
      return `${prefix}${Math.abs(num).toLocaleString()}`
    }
    if (delta.type === 'status') {
      return delta.value as string
    }
    const num = delta.value as number
    return `${num >= 0 ? '+' : ''}${num}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        delay,
        duration: 0.4,
        ease: 'easeOut',
      }}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full',
        'font-medium text-sm shadow-lg',
        delta.isPositive
          ? 'bg-success/10 text-success border border-success/30'
          : 'bg-danger/10 text-danger border border-danger/30',
      )}
    >
      {delta.icon}
      <span>{delta.label}</span>
      <motion.span
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
        className="font-bold"
      >
        {formatValue()}
      </motion.span>
    </motion.div>
  )
}

// Compact outcome display for inline use
interface CompactOutcomeProps {
  type: 'positive' | 'negative' | 'neutral'
  text: string
  className?: string
}

export function CompactOutcome({ type, text, className }: CompactOutcomeProps) {
  const icon = {
    positive: <CheckCircle2 className="w-4 h-4 text-success" />,
    negative: <XCircle className="w-4 h-4 text-danger" />,
    neutral: <Clock className="w-4 h-4 text-muted-foreground" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-2 text-sm',
        type === 'positive' && 'text-success',
        type === 'negative' && 'text-danger',
        type === 'neutral' && 'text-muted-foreground',
        className
      )}
    >
      {icon[type]}
      <span>{text}</span>
    </motion.div>
  )
}

// Money counter animation
export function MoneyCounter({
  from,
  to,
  duration = 1500,
  className,
}: {
  from: number
  to: number
  duration?: number
  className?: string
}) {
  const [current, setCurrent] = useState(from)

  useEffect(() => {
    const startTime = Date.now()
    const diff = to - from

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(from + diff * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [from, to, duration])

  const isGain = to > from

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-center gap-2 font-mono text-xl font-bold',
        isGain ? 'text-success' : 'text-danger',
        className
      )}
    >
      <DollarSign className="w-5 h-5" />
      <span>{current.toLocaleString()}</span>
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm"
      >
        ({isGain ? '+' : ''}{(to - from).toLocaleString()})
      </motion.span>
    </motion.div>
  )
}

export default OutcomeDisplay
