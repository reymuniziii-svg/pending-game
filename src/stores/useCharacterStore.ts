import { create } from 'zustand'
import type {
  CharacterProfile,
  CharacterStats,
  ImmigrationStatus,
  ImmigrationStatusType,
  StatusChange,
  Document,
  GameDate,
} from '@/types'
import { clamp } from '@/lib/utils'

interface CharacterState {
  // Profile reference
  profileId: string | null
  profile: CharacterProfile | null

  // Current status
  status: ImmigrationStatus | null
  statusHistory: StatusChange[]

  // Stats
  stats: CharacterStats

  // Documents
  documents: Document[]

  // Flags (for event conditions)
  flags: Record<string, string | number | boolean>

  // Actions
  initializeCharacter: (profile: CharacterProfile, startDate: GameDate) => void
  updateStatus: (newStatus: ImmigrationStatus, reason: string, date: GameDate, eventId?: string) => void
  modifyStat: (stat: keyof CharacterStats, delta: number) => void
  setStat: (stat: keyof CharacterStats, value: number) => void
  addDocument: (document: Document) => void
  removeDocument: (documentId: string) => void
  invalidateDocument: (documentId: string) => void
  setFlag: (key: string, value: string | number | boolean) => void
  getFlag: (key: string) => string | number | boolean | undefined
  incrementFlag: (key: string, amount?: number) => void
  addUnlawfulPresenceDays: (days: number) => void
  reset: () => void
}

const initialStats: CharacterStats = {
  health: 80,
  stress: 20,
  englishProficiency: 50,
  communityConnection: 30,
}

const initialState = {
  profileId: null,
  profile: null,
  status: null,
  statusHistory: [],
  stats: initialStats,
  documents: [],
  flags: {},
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  ...initialState,

  initializeCharacter: (profile, startDate) => {
    const initialStatus: ImmigrationStatus = {
      type: profile.initialStatus,
      startDate,
      workAuthorized: getInitialWorkAuth(profile.initialStatus),
      workAuthorizationType: getInitialWorkAuthType(profile.initialStatus),
      canTravel: getInitialTravelAuth(profile.initialStatus),
      advanceParoleRequired: profile.initialStatus === 'daca',
      reentryRisk: getReentryRisk(profile.initialStatus),
      validTransitions: getValidTransitions(profile.initialStatus),
      inRemovalProceedings: false,
      hasEAD: profile.initialStatus === 'daca',
      hasAdvanceParole: false,
      unlawfulPresenceDays: 0,
    }

    set({
      profileId: profile.id,
      profile,
      status: initialStatus,
      statusHistory: [],
      stats: { ...profile.initialStats },
      documents: [],
      flags: {},
    })
  },

  updateStatus: (newStatus, reason, date, eventId) => set((state) => {
    if (!state.status) return state

    const change: StatusChange = {
      fromStatus: state.status.type,
      toStatus: newStatus.type,
      date,
      reason,
      eventId,
    }

    return {
      status: newStatus,
      statusHistory: [...state.statusHistory, change],
    }
  }),

  modifyStat: (stat, delta) => set((state) => ({
    stats: {
      ...state.stats,
      [stat]: clamp(state.stats[stat] + delta, 0, 100),
    },
  })),

  setStat: (stat, value) => set((state) => ({
    stats: {
      ...state.stats,
      [stat]: clamp(value, 0, 100),
    },
  })),

  addDocument: (document) => set((state) => ({
    documents: [...state.documents, document],
  })),

  removeDocument: (documentId) => set((state) => ({
    documents: state.documents.filter(d => d.id !== documentId),
  })),

  invalidateDocument: (documentId) => set((state) => ({
    documents: state.documents.map(d =>
      d.id === documentId ? { ...d, isValid: false } : d
    ),
  })),

  setFlag: (key, value) => set((state) => ({
    flags: { ...state.flags, [key]: value },
  })),

  getFlag: (key) => get().flags[key],

  incrementFlag: (key, amount = 1) => set((state) => {
    const current = state.flags[key]
    const newValue = typeof current === 'number' ? current + amount : amount
    return {
      flags: { ...state.flags, [key]: newValue },
    }
  }),

  addUnlawfulPresenceDays: (days) => set((state) => {
    if (!state.status) return state
    return {
      status: {
        ...state.status,
        unlawfulPresenceDays: state.status.unlawfulPresenceDays + days,
      },
    }
  }),

  reset: () => set(initialState),
}))

// Helper functions for initial status setup
function getInitialWorkAuth(status: ImmigrationStatusType): boolean {
  const workStatuses: ImmigrationStatusType[] = [
    'daca', 'h1b-active', 'l1a-executive', 'l1b-specialized',
    'o1-extraordinary', 'green-card-conditional', 'green-card-permanent',
    'naturalized-citizen', 'asylum-granted', 'refugee',
    'student-f1-opt', 'student-f1-stem-opt', 'e2-investor',
  ]
  return workStatuses.includes(status)
}

function getInitialWorkAuthType(status: ImmigrationStatusType) {
  if (status === 'naturalized-citizen' || status === 'green-card-permanent' || status === 'green-card-conditional') {
    return 'unrestricted' as const
  }
  if (status === 'h1b-active' || status === 'l1a-executive' || status === 'l1b-specialized') {
    return 'employer-specific' as const
  }
  if (status === 'daca' || status === 'asylum-granted' || status === 'refugee') {
    return 'ead' as const
  }
  if (status === 'student-f1-opt' || status === 'student-f1-stem-opt') {
    return 'limited' as const
  }
  return 'none' as const
}

function getInitialTravelAuth(status: ImmigrationStatusType): boolean {
  const noTravelStatuses: ImmigrationStatusType[] = [
    'undocumented', 'undocumented-overstay', 'daca',
    'asylum-pending', 'removal-proceedings', 'deportation-order',
  ]
  return !noTravelStatuses.includes(status)
}

function getReentryRisk(status: ImmigrationStatusType) {
  if (status === 'undocumented' || status === 'undocumented-overstay') return 'extreme' as const
  if (status === 'daca') return 'high' as const
  if (status === 'asylum-pending') return 'extreme' as const
  return 'none' as const
}

function getValidTransitions(status: ImmigrationStatusType): ImmigrationStatusType[] {
  // Simplified - full implementation would have complete transition map
  const transitions: Partial<Record<ImmigrationStatusType, ImmigrationStatusType[]>> = {
    'daca': ['daca', 'undocumented', 'removal-proceedings'],
    'h1b-active': ['h1b-active', 'i485-pending', 'undocumented-overstay'],
    'h1b-pending': ['h1b-active', 'student-f1-opt', 'undocumented-overstay'],
    'asylum-pending': ['asylum-granted', 'removal-proceedings'],
    'undocumented': ['removal-proceedings', 'vawa-pending', 'i485-pending'],
    'green-card-conditional': ['green-card-permanent', 'removal-proceedings'],
    'green-card-permanent': ['naturalized-citizen'],
  }
  return transitions[status] || []
}
