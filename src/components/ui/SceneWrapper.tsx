import { type ReactNode, useMemo } from 'react'
import type { SceneType } from '@/types'
import { cn } from '@/lib/utils'

interface SceneWrapperProps {
  type: SceneType
  children: ReactNode
  className?: string
  showVignette?: boolean
  intensity?: 'light' | 'medium' | 'heavy'
}

// Scene configurations with gradients and moods
const sceneConfigs: Record<SceneType, {
  gradient: string
  vignette: string
  mood: string
  textClass: string
}> = {
  home: {
    gradient: 'from-amber-50 via-orange-50/30 to-yellow-50/20',
    vignette: 'rgba(251, 191, 36, 0.1)',
    mood: 'warm',
    textClass: 'text-life-text',
  },
  uscis: {
    gradient: 'from-slate-100 via-gray-100 to-slate-50',
    vignette: 'rgba(71, 85, 105, 0.15)',
    mood: 'cold',
    textClass: 'text-system-text',
  },
  work: {
    gradient: 'from-blue-50/50 via-slate-50 to-white',
    vignette: 'rgba(59, 130, 246, 0.05)',
    mood: 'neutral',
    textClass: 'text-foreground',
  },
  airport: {
    gradient: 'from-slate-200 via-gray-300 to-slate-400',
    vignette: 'rgba(0, 0, 0, 0.25)',
    mood: 'tense',
    textClass: 'text-slate-800',
  },
  court: {
    gradient: 'from-amber-100/50 via-stone-100 to-amber-50/30',
    vignette: 'rgba(120, 53, 15, 0.1)',
    mood: 'formal',
    textClass: 'text-stone-800',
  },
  community: {
    gradient: 'from-green-50/50 via-emerald-50/30 to-teal-50/20',
    vignette: 'rgba(16, 185, 129, 0.05)',
    mood: 'hopeful',
    textClass: 'text-emerald-900',
  },
  hospital: {
    gradient: 'from-slate-50 via-white to-blue-50/20',
    vignette: 'rgba(71, 85, 105, 0.08)',
    mood: 'clinical',
    textClass: 'text-slate-700',
  },
  street: {
    gradient: 'from-gray-100 via-stone-100 to-gray-50',
    vignette: 'rgba(0, 0, 0, 0.05)',
    mood: 'everyday',
    textClass: 'text-foreground',
  },
  neutral: {
    gradient: 'from-background via-white to-background',
    vignette: 'transparent',
    mood: 'neutral',
    textClass: 'text-foreground',
  },
}

// Intensity levels for vignette effect
const vignetteIntensity = {
  light: '60px',
  medium: '100px',
  heavy: '150px',
}

export function SceneWrapper({
  type,
  children,
  className,
  showVignette = false,
  intensity = 'medium',
}: SceneWrapperProps) {
  const config = sceneConfigs[type] || sceneConfigs.neutral

  const vignetteStyle = useMemo(() => {
    if (!showVignette) return {}
    return {
      boxShadow: `inset 0 0 ${vignetteIntensity[intensity]} ${config.vignette}`,
    }
  }, [showVignette, intensity, config.vignette])

  return (
    <div
      className={cn(
        'min-h-full transition-all duration-500 ease-in-out',
        `bg-gradient-to-br ${config.gradient}`,
        config.textClass,
        showVignette && 'relative',
        className
      )}
      style={vignetteStyle}
      data-scene={type}
      data-mood={config.mood}
    >
      {children}
    </div>
  )
}

// Hook to determine scene type from event context
export function useSceneType(
  sceneType?: SceneType,
  eventTags?: string[]
): SceneType {
  return useMemo(() => {
    if (sceneType) return sceneType

    // Infer scene from event tags if not specified
    if (eventTags) {
      if (eventTags.includes('uscis') || eventTags.includes('immigration-office')) return 'uscis'
      if (eventTags.includes('court') || eventTags.includes('hearing')) return 'court'
      if (eventTags.includes('airport') || eventTags.includes('travel')) return 'airport'
      if (eventTags.includes('hospital') || eventTags.includes('medical')) return 'hospital'
      if (eventTags.includes('work') || eventTags.includes('career')) return 'work'
      if (eventTags.includes('community') || eventTags.includes('celebration')) return 'community'
      if (eventTags.includes('home') || eventTags.includes('family')) return 'home'
    }

    return 'neutral'
  }, [sceneType, eventTags])
}

// Component for scene transitions
interface SceneTransitionProps {
  from: SceneType
  to: SceneType
  onComplete?: () => void
}

export function SceneTransition({ from, to, onComplete }: SceneTransitionProps) {
  const fromConfig = sceneConfigs[from]
  const toConfig = sceneConfigs[to]

  // Determine if transitioning between warm and cold
  const isWarmToCold = fromConfig.mood === 'warm' && toConfig.mood === 'cold'
  const isColdToWarm = fromConfig.mood === 'cold' && toConfig.mood === 'warm'

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none z-50',
        'transition-opacity duration-500',
        isWarmToCold && 'animate-scene-fade bg-slate-200/50',
        isColdToWarm && 'animate-scene-fade bg-amber-100/50'
      )}
      onAnimationEnd={onComplete}
    />
  )
}

export default SceneWrapper
