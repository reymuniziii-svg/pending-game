import { create } from 'zustand'
import type { GlossaryTerm } from '@/data/glossary'

interface GlossaryState {
  // Tracking which terms the player has viewed
  viewedTermIds: Set<string>

  // Currently open term (for popup)
  activeTermId: string | null

  // Whether the full definition is expanded
  isExpanded: boolean

  // Statistics
  totalTermsViewed: number
  termsViewedThisSession: string[]

  // Actions
  markTermViewed: (termId: string) => void
  hasViewedTerm: (termId: string) => boolean
  openTerm: (termId: string) => void
  closeTerm: () => void
  toggleExpand: () => void
  getViewedTerms: () => string[]
  resetViewedTerms: () => void
}

const initialState = {
  viewedTermIds: new Set<string>(),
  activeTermId: null as string | null,
  isExpanded: false,
  totalTermsViewed: 0,
  termsViewedThisSession: [] as string[],
}

export const useGlossaryStore = create<GlossaryState>((set, get) => ({
  ...initialState,

  markTermViewed: (termId) => set((state) => {
    const newViewedIds = new Set(state.viewedTermIds)
    const isNew = !newViewedIds.has(termId)
    newViewedIds.add(termId)

    return {
      viewedTermIds: newViewedIds,
      totalTermsViewed: isNew ? state.totalTermsViewed + 1 : state.totalTermsViewed,
      termsViewedThisSession: isNew
        ? [...state.termsViewedThisSession, termId]
        : state.termsViewedThisSession,
    }
  }),

  hasViewedTerm: (termId) => get().viewedTermIds.has(termId),

  openTerm: (termId) => {
    // Mark as viewed when opened
    get().markTermViewed(termId)
    set({ activeTermId: termId, isExpanded: false })
  },

  closeTerm: () => set({ activeTermId: null, isExpanded: false }),

  toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),

  getViewedTerms: () => Array.from(get().viewedTermIds),

  resetViewedTerms: () => set({
    viewedTermIds: new Set<string>(),
    totalTermsViewed: 0,
    termsViewedThisSession: [],
  }),
}))

// Selector hooks for common patterns
export const useActiveTermId = () => useGlossaryStore((state) => state.activeTermId)
export const useIsExpanded = () => useGlossaryStore((state) => state.isExpanded)
export const useTotalTermsViewed = () => useGlossaryStore((state) => state.totalTermsViewed)

// Check if a term is new (not yet viewed)
export const useIsNewTerm = (termId: string) =>
  useGlossaryStore((state) => !state.viewedTermIds.has(termId))
