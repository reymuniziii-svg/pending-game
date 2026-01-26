import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronDown, ChevronUp, AlertTriangle, Info, ExternalLink, BookOpen } from 'lucide-react'
import { useGlossaryStore, useActiveTermId, useIsExpanded } from '@/stores'
import { getTermById, CATEGORY_INFO, type GlossaryTerm } from '@/data/glossary'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface GlossaryPopupProps {
  className?: string
}

export function GlossaryPopup({ className }: GlossaryPopupProps) {
  const activeTermId = useActiveTermId()
  const isExpanded = useIsExpanded()
  const { closeTerm, toggleExpand, openTerm } = useGlossaryStore()
  const popupRef = useRef<HTMLDivElement>(null)

  const termData = activeTermId ? getTermById(activeTermId) : null

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTerm()
      }
    }

    if (activeTermId) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeTermId, closeTerm])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        closeTerm()
      }
    }

    if (activeTermId) {
      // Delay to prevent immediate close on the click that opened it
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [activeTermId, closeTerm])

  const categoryInfo = termData?.category
    ? CATEGORY_INFO[termData.category]
    : { label: 'Term', color: 'text-foreground', bgColor: 'bg-muted' }

  const handleRelatedTermClick = (termId: string) => {
    openTerm(termId)
  }

  return (
    <AnimatePresence>
      {activeTermId && termData && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeTerm}
          />

          {/* Popup */}
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
              'md:w-full md:max-w-lg md:max-h-[80vh]',
              'bg-card border border-border rounded-2xl shadow-2xl z-50',
              'flex flex-col overflow-hidden',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    categoryInfo.bgColor,
                    categoryInfo.color
                  )}>
                    {categoryInfo.label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {termData.term}
                </h2>
              </div>
              <button
                onClick={closeTerm}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Short Definition */}
              <p className="text-base text-foreground leading-relaxed">
                {termData.shortDefinition}
              </p>

              {/* Expand/Collapse for Full Definition */}
              <button
                onClick={toggleExpand}
                className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isExpanded ? 'Show less' : 'Learn more'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Definition */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {termData.fullDefinition}
                      </p>
                    </div>

                    {/* Real World Context */}
                    {termData.realWorldContext && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                              Real World Context
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                              {termData.realWorldContext}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Common Misconceptions */}
                    {termData.commonMisconceptions && termData.commonMisconceptions.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                              Common Misconceptions
                            </h4>
                            <ul className="space-y-1">
                              {termData.commonMisconceptions.map((misconception, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed flex items-start gap-2"
                                >
                                  <span className="text-amber-500 mt-1">•</span>
                                  <span>{misconception}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Related Terms */}
              {termData.relatedTerms && termData.relatedTerms.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Related Terms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {termData.relatedTerms.map((relatedId) => {
                      const relatedTerm = getTermById(relatedId)
                      if (!relatedTerm) return null
                      const relatedCategory = CATEGORY_INFO[relatedTerm.category]
                      return (
                        <button
                          key={relatedId}
                          onClick={() => handleRelatedTermClick(relatedId)}
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            'transition-all hover:ring-2 hover:ring-offset-1 hover:ring-accent/30',
                            relatedCategory.bgColor,
                            relatedCategory.color
                          )}
                        >
                          {relatedTerm.term}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={closeTerm}
                className="w-full"
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Compact version for embedding in other components
export function GlossaryMiniPopup({
  termId,
  className,
}: {
  termId: string
  className?: string
}) {
  const termData = getTermById(termId)
  if (!termData) return null

  const categoryInfo = CATEGORY_INFO[termData.category]

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-3 shadow-lg',
      'max-w-xs',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
          categoryInfo.bgColor,
          categoryInfo.color
        )}>
          {categoryInfo.label}
        </span>
        <span className="font-semibold text-sm">{termData.term}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {termData.shortDefinition}
      </p>
    </div>
  )
}

export default GlossaryPopup
