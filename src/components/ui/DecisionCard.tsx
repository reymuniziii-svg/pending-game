import { type ReactNode, useMemo } from 'react'
import type { EventChoice, ChoiceCost } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import {
  Clock,
  DollarSign,
  Heart,
  AlertTriangle,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Scale,
} from 'lucide-react'

interface DecisionCardProps {
  title: string
  description: string
  choices: EventChoice[]
  onChoiceSelect: (choiceId: string) => void
  disabled?: boolean
  canAfford?: (choice: EventChoice) => boolean
  className?: string
  isHeavyDecision?: boolean
  showStakes?: boolean
}

// Stake icons based on cost type
const stakeIcons: Record<string, ReactNode> = {
  money: <DollarSign className="h-3.5 w-3.5" />,
  time: <Clock className="h-3.5 w-3.5" />,
  relationship: <Users className="h-3.5 w-3.5" />,
  stat: <TrendingDown className="h-3.5 w-3.5" />,
  stress: <Zap className="h-3.5 w-3.5" />,
}

// Calculate total stakes for a choice
function calculateStakes(costs?: ChoiceCost[]): { type: string; amount: number; label: string }[] {
  if (!costs || costs.length === 0) return []

  return costs.map(cost => ({
    type: cost.type,
    amount: cost.amount,
    label: cost.description || `${cost.type}: ${cost.amount}`,
  }))
}

// Determine if this is a heavy decision based on costs and outcomes
function isHeavyChoice(choice: EventChoice): boolean {
  const hasMoneyCost = choice.costs?.some(c => c.type === 'money' && c.amount > 500)
  const hasRelationshipCost = choice.costs?.some(c => c.type === 'relationship')
  const isDangerous = choice.isDangerous
  const hasStatusChange = choice.outcomes?.some(o => o.type === 'status-change')

  return !!(hasMoneyCost || hasRelationshipCost || isDangerous || hasStatusChange)
}

export function DecisionCard({
  title,
  description,
  choices,
  onChoiceSelect,
  disabled = false,
  canAfford,
  className,
  isHeavyDecision: forceHeavy,
  showStakes = true,
}: DecisionCardProps) {
  // Determine if this is a heavy decision
  const isHeavy = forceHeavy ?? choices.some(isHeavyChoice)

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isHeavy && 'ring-2 ring-warning/30 shadow-lg',
        className
      )}
    >
      <CardHeader className={cn(isHeavy && 'bg-warning/5 border-b border-warning/20')}>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Narrative Description */}
        <p className="narrative text-lg leading-relaxed">{description}</p>

        {/* Stakes Summary (if heavy decision) */}
        {isHeavy && showStakes && (
          <div className="flex flex-wrap gap-3 py-3 border-y border-border/50">
            <StakeBadge icon={<Scale className="h-3.5 w-3.5" />} label="Important Decision" variant="warning" />
            {choices.some(c => c.costs?.some(cost => cost.type === 'money')) && (
              <StakeBadge icon={<DollarSign className="h-3.5 w-3.5" />} label="Financial Impact" />
            )}
            {choices.some(c => c.isDangerous) && (
              <StakeBadge icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Risk Involved" variant="danger" />
            )}
          </div>
        )}

        {/* Choice Buttons */}
        <div className="space-y-3">
          {choices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              onClick={() => onChoiceSelect(choice.id)}
              disabled={disabled || (canAfford && !canAfford(choice))}
              showStakes={showStakes}
              isHeavy={isHeavyChoice(choice)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Individual choice button with stakes display
interface ChoiceButtonProps {
  choice: EventChoice
  onClick: () => void
  disabled?: boolean
  showStakes?: boolean
  isHeavy?: boolean
}

function ChoiceButton({
  choice,
  onClick,
  disabled,
  showStakes,
  isHeavy,
}: ChoiceButtonProps) {
  const stakes = useMemo(() => calculateStakes(choice.costs), [choice.costs])

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
        'hover:border-accent hover:bg-accent/5 hover:shadow-md',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent hover:shadow-none',
        isHeavy && 'border-warning/40 bg-warning/5',
        choice.isRecommended && 'border-success/40 bg-success/5',
        choice.isDangerous && 'border-danger/40 bg-danger/5',
        !isHeavy && !choice.isRecommended && !choice.isDangerous && 'border-border bg-card'
      )}
    >
      {/* Choice Text */}
      <div className="flex items-start justify-between gap-4">
        <span className="font-medium text-foreground">{choice.text}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {choice.isRecommended && (
            <span className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Recommended
            </span>
          )}
          {choice.isDangerous && (
            <span className="text-xs text-danger flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Risky
            </span>
          )}
        </div>
      </div>

      {/* Stakes Display */}
      {showStakes && stakes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {stakes.map((stake, i) => (
            <span
              key={i}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs',
                stake.type === 'money' && 'bg-amber-100 text-amber-800',
                stake.type === 'time' && 'bg-blue-100 text-blue-800',
                stake.type === 'relationship' && 'bg-pink-100 text-pink-800',
                stake.type === 'stress' && 'bg-orange-100 text-orange-800',
                stake.type === 'stat' && 'bg-purple-100 text-purple-800'
              )}
            >
              {stakeIcons[stake.type]}
              {stake.type === 'money' ? `$${stake.amount.toLocaleString()}` : stake.label}
            </span>
          ))}
        </div>
      )}

      {/* Disabled Reason */}
      {disabled && (
        <p className="mt-2 text-xs text-muted-foreground italic">
          You cannot afford this option
        </p>
      )}
    </button>
  )
}

// Stake badge component
interface StakeBadgeProps {
  icon: ReactNode
  label: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
}

function StakeBadge({ icon, label, variant = 'default' }: StakeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-muted text-muted-foreground',
        variant === 'warning' && 'bg-warning/10 text-warning',
        variant === 'danger' && 'bg-danger/10 text-danger',
        variant === 'success' && 'bg-success/10 text-success'
      )}
    >
      {icon}
      {label}
    </span>
  )
}

// Simple decision card for non-heavy choices
interface SimpleDecisionCardProps {
  title: string
  description: string
  choices: { id: string; text: string }[]
  onChoiceSelect: (choiceId: string) => void
  className?: string
}

export function SimpleDecisionCard({
  title,
  description,
  choices,
  onChoiceSelect,
  className,
}: SimpleDecisionCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="narrative">{description}</p>
        <div className="flex flex-wrap gap-2">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoiceSelect(choice.id)}
              className="px-4 py-2 rounded-md border border-border hover:border-accent hover:bg-accent/5 transition-colors text-sm"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default DecisionCard
