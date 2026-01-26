import { create } from 'zustand'
import type { Achievement, AchievementCategory } from '@/data/achievements'
import { getAchievementById, ACHIEVEMENTS, getTriumphRibbons } from '@/data/achievements'

interface UnlockedAchievement {
  id: string
  unlockedAt: Date
  // Whether the player has seen the unlock notification
  seen: boolean
}

interface AchievementState {
  // All unlocked achievements
  unlockedAchievements: Map<string, UnlockedAchievement>

  // Queue of achievements to show notifications for
  notificationQueue: string[]

  // Currently displaying notification
  currentNotification: string | null

  // Primary triumph ribbon (for ending screen)
  primaryRibbon: string | null

  // Stats
  totalUnlocked: number

  // Actions
  unlockAchievement: (achievementId: string) => boolean // Returns true if newly unlocked
  hasUnlocked: (achievementId: string) => boolean
  getUnlockedAchievements: () => Achievement[]
  getUnlockedInCategory: (category: AchievementCategory) => Achievement[]
  getUnlockedRibbons: () => Achievement[]
  markNotificationSeen: (achievementId: string) => void
  showNextNotification: () => void
  dismissNotification: () => void
  setPrimaryRibbon: (achievementId: string) => void
  resetAchievements: () => void

  // For checking multiple achievements at once
  checkAndUnlock: (achievementIds: string[]) => string[] // Returns newly unlocked IDs
}

const initialState = {
  unlockedAchievements: new Map<string, UnlockedAchievement>(),
  notificationQueue: [] as string[],
  currentNotification: null as string | null,
  primaryRibbon: null as string | null,
  totalUnlocked: 0,
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  ...initialState,

  unlockAchievement: (achievementId) => {
    const state = get()

    // Check if already unlocked
    if (state.unlockedAchievements.has(achievementId)) {
      return false
    }

    // Verify achievement exists
    const achievement = getAchievementById(achievementId)
    if (!achievement) {
      console.warn(`Achievement not found: ${achievementId}`)
      return false
    }

    // Create unlock record
    const unlockRecord: UnlockedAchievement = {
      id: achievementId,
      unlockedAt: new Date(),
      seen: false,
    }

    // Update state
    const newUnlocked = new Map(state.unlockedAchievements)
    newUnlocked.set(achievementId, unlockRecord)

    set({
      unlockedAchievements: newUnlocked,
      notificationQueue: [...state.notificationQueue, achievementId],
      totalUnlocked: state.totalUnlocked + 1,
    })

    // Auto-show notification if none currently showing
    if (!state.currentNotification) {
      get().showNextNotification()
    }

    return true
  },

  hasUnlocked: (achievementId) => {
    return get().unlockedAchievements.has(achievementId)
  },

  getUnlockedAchievements: () => {
    const unlockedIds = Array.from(get().unlockedAchievements.keys())
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id))
  },

  getUnlockedInCategory: (category) => {
    return get().getUnlockedAchievements().filter(a => a.category === category)
  },

  getUnlockedRibbons: () => {
    const ribbons = getTriumphRibbons()
    const unlockedIds = Array.from(get().unlockedAchievements.keys())
    return ribbons.filter(r => unlockedIds.includes(r.id))
  },

  markNotificationSeen: (achievementId) => {
    const state = get()
    const record = state.unlockedAchievements.get(achievementId)
    if (record) {
      const newUnlocked = new Map(state.unlockedAchievements)
      newUnlocked.set(achievementId, { ...record, seen: true })
      set({ unlockedAchievements: newUnlocked })
    }
  },

  showNextNotification: () => {
    const state = get()
    if (state.notificationQueue.length > 0) {
      const [next, ...remaining] = state.notificationQueue
      set({
        currentNotification: next,
        notificationQueue: remaining,
      })
    }
  },

  dismissNotification: () => {
    const state = get()
    if (state.currentNotification) {
      get().markNotificationSeen(state.currentNotification)
      set({ currentNotification: null })
      // Show next if there are more
      setTimeout(() => {
        get().showNextNotification()
      }, 300)
    }
  },

  setPrimaryRibbon: (achievementId) => {
    // Verify it's actually a ribbon and unlocked
    const achievement = getAchievementById(achievementId)
    if (achievement?.ribbonColor && get().hasUnlocked(achievementId)) {
      set({ primaryRibbon: achievementId })
    }
  },

  resetAchievements: () => {
    set({
      unlockedAchievements: new Map(),
      notificationQueue: [],
      currentNotification: null,
      primaryRibbon: null,
      totalUnlocked: 0,
    })
  },

  checkAndUnlock: (achievementIds) => {
    const newlyUnlocked: string[] = []
    for (const id of achievementIds) {
      if (get().unlockAchievement(id)) {
        newlyUnlocked.push(id)
      }
    }
    return newlyUnlocked
  },
}))

// Selector hooks
export const useTotalAchievements = () => useAchievementStore((state) => state.totalUnlocked)
export const useCurrentNotification = () => useAchievementStore((state) => state.currentNotification)
export const usePrimaryRibbon = () => useAchievementStore((state) => state.primaryRibbon)
export const useHasAchievement = (id: string) => useAchievementStore((state) => state.unlockedAchievements.has(id))
