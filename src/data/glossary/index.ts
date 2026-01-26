// Glossary exports and text parsing utilities

export * from './terms'
export { GLOSSARY_TERMS, getTermById, getTermsByCategory, searchTerms } from './terms'
export type { GlossaryTerm } from './terms'

import { GLOSSARY_TERMS, type GlossaryTerm } from './terms'

// Build a lookup map for efficient text matching
// Maps lowercase term/alias to the term object
const termLookup: Map<string, GlossaryTerm> = new Map()

// Populate lookup with all terms and aliases
GLOSSARY_TERMS.forEach(term => {
  // Add main term
  termLookup.set(term.term.toLowerCase(), term)

  // Add all aliases
  term.aliases?.forEach(alias => {
    termLookup.set(alias.toLowerCase(), term)
  })
})

// Sort by length (longest first) to match longer terms before shorter ones
// e.g., "Unlawful Presence" before "Presence"
const sortedTermStrings = Array.from(termLookup.keys()).sort((a, b) => b.length - a.length)

// Escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Build a combined regex pattern for all terms
// Uses word boundaries to avoid partial matches
const termPattern = new RegExp(
  `\\b(${sortedTermStrings.map(escapeRegex).join('|')})\\b`,
  'gi'
)

export interface TextSegment {
  type: 'text' | 'term'
  content: string
  termId?: string
  termData?: GlossaryTerm
}

/**
 * Parse text and identify glossary terms
 * Returns an array of segments - either plain text or identified terms
 */
export function parseTextForTerms(text: string): TextSegment[] {
  if (!text) return []

  const segments: TextSegment[] = []
  let lastIndex = 0
  const seenTerms = new Set<string>() // Only highlight first occurrence of each term

  // Reset regex
  termPattern.lastIndex = 0

  let match
  while ((match = termPattern.exec(text)) !== null) {
    const matchedText = match[0]
    const matchStart = match.index

    // Get the term data
    const termData = termLookup.get(matchedText.toLowerCase())
    if (!termData) continue

    // Skip if we've already seen this term in this text
    if (seenTerms.has(termData.id)) continue
    seenTerms.add(termData.id)

    // Add text before this match
    if (matchStart > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, matchStart),
      })
    }

    // Add the term
    segments.push({
      type: 'term',
      content: matchedText,
      termId: termData.id,
      termData,
    })

    lastIndex = matchStart + matchedText.length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return segments
}

/**
 * Check if text contains any glossary terms
 */
export function containsGlossaryTerms(text: string): boolean {
  termPattern.lastIndex = 0
  return termPattern.test(text)
}

/**
 * Get all terms found in a piece of text
 */
export function getTermsInText(text: string): GlossaryTerm[] {
  const terms: GlossaryTerm[] = []
  const seenIds = new Set<string>()

  termPattern.lastIndex = 0

  let match
  while ((match = termPattern.exec(text)) !== null) {
    const termData = termLookup.get(match[0].toLowerCase())
    if (termData && !seenIds.has(termData.id)) {
      seenIds.add(termData.id)
      terms.push(termData)
    }
  }

  return terms
}

/**
 * Get category display info
 */
export const CATEGORY_INFO: Record<GlossaryTerm['category'], {
  label: string
  color: string
  bgColor: string
}> = {
  agency: {
    label: 'Agency',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  status: {
    label: 'Status',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  form: {
    label: 'Form',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  concept: {
    label: 'Concept',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  penalty: {
    label: 'Penalty',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
}
