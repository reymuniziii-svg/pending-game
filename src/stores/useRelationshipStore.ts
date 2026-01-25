import { create } from 'zustand'
import type {
  RelationshipData,
  RelationshipType,
  RelationshipLevel,
  RelationshipChange,
  GameDate,
} from '@/types'
import { generateId, clamp, getRelationshipLevel } from '@/lib/utils'

interface RelationshipState {
  // All relationships
  relationships: RelationshipData[]

  // History
  relationshipChanges: RelationshipChange[]

  // Actions
  initialize: (relationships: RelationshipData[]) => void
  addRelationship: (relationship: Omit<RelationshipData, 'id'>) => RelationshipData
  removeRelationship: (id: string) => void
  modifyRelationship: (id: string, delta: number, reason: string, date: GameDate) => void
  setRelationshipLevel: (id: string, level: number) => void
  updateRelationship: (id: string, updates: Partial<RelationshipData>) => void
  getRelationship: (id: string) => RelationshipData | undefined
  getRelationshipsByType: (type: RelationshipType) => RelationshipData[]
  getSpouse: () => RelationshipData | undefined
  getSponsor: () => RelationshipData | undefined
  getPetitioner: () => RelationshipData | undefined
  getRelationshipLevel: (id: string) => RelationshipLevel
  hasUSCSpouse: () => boolean
  hasUSCParent: () => boolean
  hasUSCChild: () => boolean
  reset: () => void
}

const initialState = {
  relationships: [],
  relationshipChanges: [],
}

export const useRelationshipStore = create<RelationshipState>((set, get) => ({
  ...initialState,

  initialize: (relationships) => set({
    relationships: relationships.map(r => ({ ...r, id: r.id || generateId() })),
    relationshipChanges: [],
  }),

  addRelationship: (relationship) => {
    const newRelationship: RelationshipData = {
      ...relationship,
      id: generateId(),
    }

    set((state) => ({
      relationships: [...state.relationships, newRelationship],
    }))

    return newRelationship
  },

  removeRelationship: (id) => set((state) => ({
    relationships: state.relationships.filter(r => r.id !== id),
  })),

  modifyRelationship: (id, delta, reason, date) => set((state) => {
    const relationship = state.relationships.find(r => r.id === id)
    if (!relationship) return state

    const previousLevel = relationship.level
    const newLevel = clamp(relationship.level + delta, -100, 100)

    const change: RelationshipChange = {
      npcId: id,
      previousLevel,
      newLevel,
      date,
      reason,
    }

    return {
      relationships: state.relationships.map(r =>
        r.id === id ? { ...r, level: newLevel } : r
      ),
      relationshipChanges: [...state.relationshipChanges, change],
    }
  }),

  setRelationshipLevel: (id, level) => set((state) => ({
    relationships: state.relationships.map(r =>
      r.id === id ? { ...r, level: clamp(level, -100, 100) } : r
    ),
  })),

  updateRelationship: (id, updates) => set((state) => ({
    relationships: state.relationships.map(r =>
      r.id === id ? { ...r, ...updates } : r
    ),
  })),

  getRelationship: (id) => get().relationships.find(r => r.id === id),

  getRelationshipsByType: (type) => get().relationships.filter(r => r.type === type),

  getSpouse: () => get().relationships.find(r => r.type === 'spouse'),

  getSponsor: () => get().relationships.find(r => r.isSponsor),

  getPetitioner: () => get().relationships.find(r => r.isPetitioner),

  getRelationshipLevel: (id) => {
    const relationship = get().relationships.find(r => r.id === id)
    if (!relationship) return 'neutral'
    return getRelationshipLevel(relationship.level)
  },

  hasUSCSpouse: () => {
    const spouse = get().getSpouse()
    return spouse?.citizenshipStatus === 'usc'
  },

  hasUSCParent: () => {
    return get().relationships.some(r =>
      r.type === 'parent' && r.citizenshipStatus === 'usc'
    )
  },

  hasUSCChild: () => {
    return get().relationships.some(r =>
      r.type === 'child' && r.citizenshipStatus === 'usc'
    )
  },

  reset: () => set(initialState),
}))
