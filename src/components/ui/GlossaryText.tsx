import { useMemo, type ReactNode } from 'react'
import { parseTextForTerms, containsGlossaryTerms, type TextSegment } from '@/data/glossary'
import { GlossaryTerm } from './GlossaryTerm'
import { cn } from '@/lib/utils'

interface GlossaryTextProps {
  children: string
  className?: string
  enableHighlight?: boolean // Whether to highlight glossary terms
  showIndicator?: boolean // Show "new" dot for unseen terms
  as?: 'p' | 'span' | 'div' // Wrapper element
}

/**
 * GlossaryText automatically parses text and makes glossary terms clickable.
 * Only the first occurrence of each term in the text is highlighted.
 *
 * @example
 * <GlossaryText>
 *   Your DACA application has been received by USCIS.
 * </GlossaryText>
 */
export function GlossaryText({
  children,
  className,
  enableHighlight = true,
  showIndicator = true,
  as: Component = 'span',
}: GlossaryTextProps) {
  const segments = useMemo(() => {
    if (!enableHighlight || typeof children !== 'string') {
      return null
    }
    return parseTextForTerms(children)
  }, [children, enableHighlight])

  // If highlighting is disabled or no terms found, render plain text
  if (!segments || segments.length === 0) {
    return <Component className={className}>{children}</Component>
  }

  // If only one segment and it's text, render plain
  if (segments.length === 1 && segments[0].type === 'text') {
    return <Component className={className}>{children}</Component>
  }

  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>
        }

        return (
          <GlossaryTerm
            key={`${segment.termId}-${index}`}
            termId={segment.termId!}
            termData={segment.termData}
            showIndicator={showIndicator}
          >
            {segment.content}
          </GlossaryTerm>
        )
      })}
    </Component>
  )
}

/**
 * Check if text contains any glossary terms (useful for conditional rendering)
 */
export function hasGlossaryTerms(text: string): boolean {
  return containsGlossaryTerms(text)
}

/**
 * GlossaryParagraph - for longer narrative text with term highlighting
 */
interface GlossaryParagraphProps {
  children: string
  className?: string
  enableHighlight?: boolean
}

export function GlossaryParagraph({
  children,
  className,
  enableHighlight = true,
}: GlossaryParagraphProps) {
  return (
    <GlossaryText
      as="p"
      className={cn('leading-relaxed', className)}
      enableHighlight={enableHighlight}
    >
      {children}
    </GlossaryText>
  )
}

/**
 * GlossaryDescription - for decision card descriptions
 * Slightly more compact styling
 */
interface GlossaryDescriptionProps {
  children: string
  className?: string
}

export function GlossaryDescription({
  children,
  className,
}: GlossaryDescriptionProps) {
  return (
    <GlossaryText
      as="span"
      className={cn('text-muted-foreground', className)}
      enableHighlight={true}
      showIndicator={false} // Don't show indicators in descriptions
    >
      {children}
    </GlossaryText>
  )
}

/**
 * Render narrative text with optional glossary integration
 * Falls back gracefully if text is not a string
 */
interface NarrativeTextProps {
  text: string | ReactNode
  className?: string
  enableGlossary?: boolean
}

export function NarrativeText({
  text,
  className,
  enableGlossary = true,
}: NarrativeTextProps) {
  // If not a string, just render as-is
  if (typeof text !== 'string') {
    return <span className={className}>{text}</span>
  }

  if (!enableGlossary) {
    return <span className={className}>{text}</span>
  }

  return (
    <GlossaryText
      as="span"
      className={className}
      enableHighlight={true}
    >
      {text}
    </GlossaryText>
  )
}

export default GlossaryText
