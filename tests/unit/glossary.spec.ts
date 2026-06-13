import { describe, expect, it } from 'vitest'
import { parseTextForTerms, getTermById, GLOSSARY_TERMS } from '@/data/glossary'

// SPEC behavior 4: clicking a real immigration term explains it (glossary lookup).
describe('glossary', () => {
  it('detects a known term in narrative text', () => {
    const segments = parseTextForTerms('You must file your application with USCIS to begin.')
    const terms = segments.filter((s) => s.type === 'term')
    expect(terms.length).toBeGreaterThan(0)
    expect(terms.some((s) => s.termId === 'uscis')).toBe(true)
  })

  it('returns a full definition for a looked-up term', () => {
    const uscis = getTermById('uscis')
    expect(uscis).toBeDefined()
    expect(uscis?.fullDefinition.length).toBeGreaterThan(0)
  })

  it('only highlights the first occurrence of each term', () => {
    const segments = parseTextForTerms('USCIS reviews it, then USCIS decides.')
    const uscisSegments = segments.filter((s) => s.type === 'term' && s.termId === 'uscis')
    expect(uscisSegments.length).toBe(1)
  })

  it('every glossary term has an id, a short and a full definition', () => {
    const malformed = GLOSSARY_TERMS.filter(
      (t) => !t.id || !t.shortDefinition || !t.fullDefinition
    ).map((t) => t.id || t.term)
    expect(malformed).toEqual([])
  })
})
