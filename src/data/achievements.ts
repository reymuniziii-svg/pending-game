// Achievement System for Pending
// 30+ achievements across journey, resilience, community, sacrifice, and triumph categories

export type AchievementCategory = 'journey' | 'resilience' | 'community' | 'sacrifice' | 'triumph'

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  rarity: AchievementRarity
  // Icon name (using lucide-react icons)
  icon: string
  // For triumph ribbons - special styling
  ribbonColor?: string
  // Condition description for players
  hint?: string
  // Whether this is hidden until unlocked
  secret?: boolean
}

// Achievement condition type - used by the achievement checker
export interface AchievementCondition {
  achievementId: string
  // Check function receives game state and returns true if unlocked
  check: (state: AchievementCheckState) => boolean
}

// State passed to achievement check functions
export interface AchievementCheckState {
  totalMonthsElapsed: number
  currentStatus: string
  eventsCompleted: string[]
  choicesMade: Record<string, string>
  stats: {
    health: number
    stress: number
    wellbeing: number
    stability: number
  }
  finances: {
    bankBalance: number
    totalSpent: number
    totalEarned: number
  }
  relationships: Record<string, number>
  flags: Record<string, boolean>
  // Character-specific
  characterId: string
  // Ending-specific
  endingId?: string
  endingType?: 'positive' | 'negative' | 'neutral' | 'bittersweet'
}

export const ACHIEVEMENTS: Achievement[] = [
  // === JOURNEY ACHIEVEMENTS ===
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Began your immigration journey.',
    category: 'journey',
    rarity: 'common',
    icon: 'Footprints',
    hint: 'Start a new game',
  },
  {
    id: 'year-one',
    name: 'Year One',
    description: 'Survived your first year in the system.',
    category: 'journey',
    rarity: 'common',
    icon: 'Calendar',
    hint: 'Play for 12 months',
  },
  {
    id: 'half-decade',
    name: 'Half a Decade',
    description: 'Five years of waiting, hoping, persevering.',
    category: 'journey',
    rarity: 'uncommon',
    icon: 'Clock',
    hint: 'Play for 60 months',
  },
  {
    id: 'the-long-wait',
    name: 'The Long Wait',
    description: 'A decade in the immigration system.',
    category: 'journey',
    rarity: 'rare',
    icon: 'Hourglass',
    hint: 'Play for 120 months',
  },
  {
    id: 'paper-trail',
    name: 'Paper Trail',
    description: 'Filed your first major immigration form.',
    category: 'journey',
    rarity: 'common',
    icon: 'FileText',
    hint: 'Submit an immigration form',
  },
  {
    id: 'bureaucracy-veteran',
    name: 'Bureaucracy Veteran',
    description: 'Filed 5 or more immigration forms.',
    category: 'journey',
    rarity: 'uncommon',
    icon: 'Files',
    hint: 'Submit 5 different forms',
  },
  {
    id: 'interview-ready',
    name: 'Interview Ready',
    description: 'Attended an immigration interview.',
    category: 'journey',
    rarity: 'uncommon',
    icon: 'Users',
    hint: 'Complete an interview event',
  },

  // === RESILIENCE ACHIEVEMENTS ===
  {
    id: 'unbroken',
    name: 'Unbroken',
    description: 'Maintained hope despite a denial.',
    category: 'resilience',
    rarity: 'uncommon',
    icon: 'Heart',
    hint: 'Continue playing after a denial',
  },
  {
    id: 'stress-tested',
    name: 'Stress Tested',
    description: 'Survived a period of extreme stress.',
    category: 'resilience',
    rarity: 'uncommon',
    icon: 'Activity',
    hint: 'Reach 90% stress and recover',
  },
  {
    id: 'second-wind',
    name: 'Second Wind',
    description: 'Recovered from near-crisis.',
    category: 'resilience',
    rarity: 'rare',
    icon: 'Wind',
    hint: 'Recover from below 20% health',
  },
  {
    id: 'never-give-up',
    name: 'Never Give Up',
    description: 'Appealed a denied application.',
    category: 'resilience',
    rarity: 'rare',
    icon: 'RotateCcw',
    hint: 'File an appeal after denial',
  },
  {
    id: 'financial-survivor',
    name: 'Financial Survivor',
    description: 'Recovered from near bankruptcy.',
    category: 'resilience',
    rarity: 'rare',
    icon: 'DollarSign',
    hint: 'Drop below $500 and recover to $5000+',
  },
  {
    id: 'the-long-game',
    name: 'The Long Game',
    description: 'Persevered through multiple setbacks.',
    category: 'resilience',
    rarity: 'epic',
    icon: 'TrendingUp',
    hint: 'Experience 3+ negative events and still reach a positive ending',
    secret: true,
  },

  // === COMMUNITY ACHIEVEMENTS ===
  {
    id: 'connected',
    name: 'Connected',
    description: 'Built a meaningful relationship.',
    category: 'community',
    rarity: 'common',
    icon: 'Users',
    hint: 'Reach high relationship with any character',
  },
  {
    id: 'support-network',
    name: 'Support Network',
    description: 'Built strong bonds with multiple people.',
    category: 'community',
    rarity: 'uncommon',
    icon: 'Network',
    hint: 'Have 3+ relationships above 70%',
  },
  {
    id: 'voice-for-others',
    name: 'Voice for Others',
    description: 'Advocated for the immigrant community.',
    category: 'community',
    rarity: 'rare',
    icon: 'Megaphone',
    hint: 'Choose to speak out or advocate for others',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Helped someone else through the process.',
    category: 'community',
    rarity: 'rare',
    icon: 'GraduationCap',
    hint: 'Make a choice that helps another immigrant',
  },
  {
    id: 'family-first',
    name: 'Family First',
    description: 'Prioritized family above all else.',
    category: 'community',
    rarity: 'uncommon',
    icon: 'Home',
    hint: 'Make a significant sacrifice for family',
  },
  {
    id: 'found-family',
    name: 'Found Family',
    description: 'Built deep bonds beyond blood.',
    category: 'community',
    rarity: 'rare',
    icon: 'HeartHandshake',
    hint: 'Max relationship with a non-family character',
    secret: true,
  },

  // === SACRIFICE ACHIEVEMENTS ===
  {
    id: 'the-hardest-choice',
    name: 'The Hardest Choice',
    description: 'Made an impossible decision.',
    category: 'sacrifice',
    rarity: 'rare',
    icon: 'Scale',
    hint: 'Face a major dilemma event',
  },
  {
    id: 'delayed-dreams',
    name: 'Delayed Dreams',
    description: 'Put your goals on hold for something greater.',
    category: 'sacrifice',
    rarity: 'uncommon',
    icon: 'PauseCircle',
    hint: 'Choose to delay a personal goal for others',
  },
  {
    id: 'love-across-borders',
    name: 'Love Across Borders',
    description: 'Maintained a relationship despite distance.',
    category: 'sacrifice',
    rarity: 'rare',
    icon: 'Globe',
    hint: 'Keep a relationship strong despite separation',
  },
  {
    id: 'bitter-medicine',
    name: 'Bitter Medicine',
    description: 'Made a choice you knew would hurt.',
    category: 'sacrifice',
    rarity: 'rare',
    icon: 'HeartCrack',
    hint: 'Choose a painful but necessary option',
  },
  {
    id: 'ultimate-sacrifice',
    name: 'Ultimate Sacrifice',
    description: 'Gave up your chance for someone else.',
    category: 'sacrifice',
    rarity: 'epic',
    icon: 'Shield',
    hint: 'Make the ultimate sacrifice for family',
    secret: true,
  },

  // === TRIUMPH RIBBONS ===
  // These are the major ending achievements with special ribbon styling
  {
    id: 'ribbon-citizen',
    name: 'American Dream',
    description: 'Achieved United States citizenship.',
    category: 'triumph',
    rarity: 'legendary',
    icon: 'Award',
    ribbonColor: 'gold',
    hint: 'Reach citizenship through naturalization',
  },
  {
    id: 'ribbon-permanent-resident',
    name: 'Green Card',
    description: 'Obtained lawful permanent residence.',
    category: 'triumph',
    rarity: 'epic',
    icon: 'CreditCard',
    ribbonColor: 'emerald',
    hint: 'Successfully obtain a green card',
  },
  {
    id: 'ribbon-dreamer',
    name: 'Dreamer\'s Hope',
    description: 'Maintained DACA protection.',
    category: 'triumph',
    rarity: 'rare',
    icon: 'Star',
    ribbonColor: 'blue',
    hint: 'Successfully renew DACA and maintain status',
  },
  {
    id: 'ribbon-survivor',
    name: 'Survivor',
    description: 'Endured despite everything.',
    category: 'triumph',
    rarity: 'rare',
    icon: 'Flame',
    ribbonColor: 'silver',
    hint: 'Survive a difficult journey with dignity intact',
  },
  {
    id: 'ribbon-advocate',
    name: 'Voice of Change',
    description: 'Became an advocate for immigrant rights.',
    category: 'triumph',
    rarity: 'epic',
    icon: 'Flag',
    ribbonColor: 'purple',
    hint: 'End the game as an advocate',
    secret: true,
  },
  {
    id: 'ribbon-return',
    name: 'Homeward',
    description: 'Chose to return with dignity.',
    category: 'triumph',
    rarity: 'rare',
    icon: 'Plane',
    ribbonColor: 'amber',
    hint: 'Choose voluntary return on your own terms',
  },

  // === SECRET ACHIEVEMENTS ===
  {
    id: 'against-all-odds',
    name: 'Against All Odds',
    description: 'Achieved the impossible.',
    category: 'triumph',
    rarity: 'legendary',
    icon: 'Sparkles',
    hint: '???',
    secret: true,
  },
  {
    id: 'perfect-run',
    name: 'Perfect Journey',
    description: 'Completed the journey with maximum wellbeing.',
    category: 'resilience',
    rarity: 'legendary',
    icon: 'Crown',
    hint: '???',
    secret: true,
  },
]

// Get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

// Get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

// Get achievements by rarity
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity)
}

// Get all triumph ribbons
export function getTriumphRibbons(): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === 'triumph' && a.ribbonColor)
}

// Get non-secret achievements (for display before unlock)
export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => !a.secret)
}

// Category display info
export const CATEGORY_INFO: Record<AchievementCategory, {
  label: string
  icon: string
  color: string
  bgColor: string
}> = {
  journey: {
    label: 'Journey',
    icon: 'Map',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  resilience: {
    label: 'Resilience',
    icon: 'Shield',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  community: {
    label: 'Community',
    icon: 'Users',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  sacrifice: {
    label: 'Sacrifice',
    icon: 'Heart',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  triumph: {
    label: 'Triumph',
    icon: 'Trophy',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
}

// Rarity display info
export const RARITY_INFO: Record<AchievementRarity, {
  label: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  common: {
    label: 'Common',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
  },
}

// Ribbon color styles
export const RIBBON_COLORS: Record<string, {
  gradient: string
  border: string
  text: string
  glow: string
}> = {
  gold: {
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    border: 'border-yellow-500',
    text: 'text-yellow-900',
    glow: 'shadow-yellow-400/50',
  },
  emerald: {
    gradient: 'from-emerald-400 via-green-300 to-emerald-500',
    border: 'border-emerald-500',
    text: 'text-emerald-900',
    glow: 'shadow-emerald-400/50',
  },
  blue: {
    gradient: 'from-blue-400 via-sky-300 to-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-900',
    glow: 'shadow-blue-400/50',
  },
  silver: {
    gradient: 'from-slate-300 via-gray-200 to-slate-400',
    border: 'border-slate-400',
    text: 'text-slate-900',
    glow: 'shadow-slate-400/50',
  },
  purple: {
    gradient: 'from-purple-400 via-violet-300 to-purple-500',
    border: 'border-purple-500',
    text: 'text-purple-900',
    glow: 'shadow-purple-400/50',
  },
  amber: {
    gradient: 'from-amber-400 via-orange-300 to-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-900',
    glow: 'shadow-amber-400/50',
  },
}
