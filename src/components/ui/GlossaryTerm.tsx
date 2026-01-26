import { type ReactNode, type MouseEvent } from 'react'
import { motion } from 'motion/react'
import { useGlossaryStore, useIsNewTerm } from '@/stores'
import { CATEGORY_INFO, getTermById, type GlossaryTerm as GlossaryTermType } from '@/data/glossary'
import { cn } from '@/lib/utils'

interface GlossaryTermProps {
  termId: string
  termData?: GlossaryTermType
  children: ReactNode
  className?: string
  showIndicator?: boolean // Show "new" dot for unseen terms
  variant?: 'inline' | 'badge' // Display style
}

export function GlossaryTerm({
  termId,
  termData,
  children,
  className,
  showIndicator = true,
  variant = 'inline',
}: GlossaryTermProps) {
  const { openTerm } = useGlossaryStore()
  const isNew = useIsNewTerm(termId)

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openTerm(termId)
  }

  const categoryInfo = termData?.category
    ? CATEGORY_INFO[termData.category]
    : undefined

  if (variant === 'badge') {
    return (
      <motion.button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          'transition-all cursor-pointer',
          categoryInfo?.bgColor || 'bg-accent/10',
          categoryInfo?.color || 'text-accent',
          'hover:ring-2 hover:ring-offset-1 hover:ring-accent/30',
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
        {showIndicator && isNew && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        )}
      </motion.button>
    )
  }

  // Inline variant - dotted underline
  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'inline relative cursor-pointer',
        'border-b border-dotted border-current',
        'hover:border-solid hover:text-accent',
        'transition-colors focus:outline-none focus:text-accent',
        className
      )}
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
    >
      {children}
      {showIndicator && isNew && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-accent"
        />
      )}
    </motion.button>
  )
}

// Simplified component when you just have the text and know the term ID
interface SimpleGlossaryTermProps {
  termId: string
  className?: string
  variant?: 'inline' | 'badge'
}

export function SimpleGlossaryTerm({
  termId,
  className,
  variant = 'inline',
}: SimpleGlossaryTermProps) {
  const termData = getTermById(termId)

  if (!termData) {
    console.warn(`GlossaryTerm: Unknown term ID "${termId}"`)
    return null
  }

  return (
    <GlossaryTerm
      termId={termId}
      termData={termData}
      className={className}
      variant={variant}
    >
      {termData.term}
    </GlossaryTerm>
  )
}

// Status badge that's also a glossary term
interface StatusGlossaryBadgeProps {
  status: string // e.g., "DACA", "Green Card", "TPS"
  className?: string
}

export function StatusGlossaryBadge({
  status,
  className,
}: StatusGlossaryBadgeProps) {
  // Map common status names to term IDs
  const statusToTermId: Record<string, string> = {
    'DACA': 'daca',
    'TPS': 'tps',
    'Green Card': 'green-card',
    'H-1B': 'h1b',
    'H1B': 'h1b',
    'Asylum': 'asylum',
    'Citizen': 'naturalization',
    'Permanent Resident': 'green-card',
    'LPR': 'green-card',
    'EAD': 'ead',
  }

  const termId = statusToTermId[status]

  if (!termId) {
    // Not a glossary term, just render as a badge
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-muted text-muted-foreground',
        className
      )}>
        {status}
      </span>
    )
  }

  return (
    <SimpleGlossaryTerm
      termId={termId}
      variant="badge"
      className={className}
    />
  )
}

export default GlossaryTerm
