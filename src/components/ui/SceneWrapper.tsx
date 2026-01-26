import { type ReactNode, useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { SceneType } from '@/types'
import { cn } from '@/lib/utils'

interface SceneWrapperProps {
  type: SceneType
  children: ReactNode
  className?: string
  showVignette?: boolean
  intensity?: 'light' | 'medium' | 'heavy'
  enableTransition?: boolean  // V3: Enable fade transitions
  enableParticles?: boolean   // V3: Enable ambient particles
}

// V3: Particle configurations for ambient effects
type ParticleType = 'papers' | 'dust' | 'warmth' | 'clinical' | 'none'

// Scene configurations with gradients, moods, and particles
const sceneConfigs: Record<SceneType, {
  gradient: string
  vignette: string
  mood: string
  textClass: string
  particles: ParticleType
  particleColor: string
}> = {
  home: {
    gradient: 'from-amber-50 via-orange-50/30 to-yellow-50/20',
    vignette: 'rgba(251, 191, 36, 0.1)',
    mood: 'warm',
    textClass: 'text-life-text',
    particles: 'warmth',
    particleColor: 'rgba(251, 191, 36, 0.3)',
  },
  uscis: {
    gradient: 'from-slate-100 via-gray-100 to-slate-50',
    vignette: 'rgba(71, 85, 105, 0.15)',
    mood: 'cold',
    textClass: 'text-system-text',
    particles: 'papers',
    particleColor: 'rgba(148, 163, 184, 0.4)',
  },
  work: {
    gradient: 'from-blue-50/50 via-slate-50 to-white',
    vignette: 'rgba(59, 130, 246, 0.05)',
    mood: 'neutral',
    textClass: 'text-foreground',
    particles: 'dust',
    particleColor: 'rgba(148, 163, 184, 0.2)',
  },
  airport: {
    gradient: 'from-slate-200 via-gray-300 to-slate-400',
    vignette: 'rgba(0, 0, 0, 0.25)',
    mood: 'tense',
    textClass: 'text-slate-800',
    particles: 'dust',
    particleColor: 'rgba(71, 85, 105, 0.3)',
  },
  court: {
    gradient: 'from-amber-100/50 via-stone-100 to-amber-50/30',
    vignette: 'rgba(120, 53, 15, 0.1)',
    mood: 'formal',
    textClass: 'text-stone-800',
    particles: 'papers',
    particleColor: 'rgba(180, 160, 120, 0.3)',
  },
  community: {
    gradient: 'from-green-50/50 via-emerald-50/30 to-teal-50/20',
    vignette: 'rgba(16, 185, 129, 0.05)',
    mood: 'hopeful',
    textClass: 'text-emerald-900',
    particles: 'warmth',
    particleColor: 'rgba(16, 185, 129, 0.2)',
  },
  hospital: {
    gradient: 'from-slate-50 via-white to-blue-50/20',
    vignette: 'rgba(71, 85, 105, 0.08)',
    mood: 'clinical',
    textClass: 'text-slate-700',
    particles: 'clinical',
    particleColor: 'rgba(147, 197, 253, 0.2)',
  },
  street: {
    gradient: 'from-gray-100 via-stone-100 to-gray-50',
    vignette: 'rgba(0, 0, 0, 0.05)',
    mood: 'everyday',
    textClass: 'text-foreground',
    particles: 'dust',
    particleColor: 'rgba(163, 163, 163, 0.15)',
  },
  neutral: {
    gradient: 'from-background via-white to-background',
    vignette: 'transparent',
    mood: 'neutral',
    textClass: 'text-foreground',
    particles: 'none',
    particleColor: 'transparent',
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
  enableTransition = true,
  enableParticles = false,
}: SceneWrapperProps) {
  const config = sceneConfigs[type] || sceneConfigs.neutral
  const prevTypeRef = useRef(type)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Track scene changes for transitions
  useEffect(() => {
    if (prevTypeRef.current !== type && enableTransition) {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 500)
      prevTypeRef.current = type
      return () => clearTimeout(timer)
    }
  }, [type, enableTransition])

  const vignetteStyle = useMemo(() => {
    if (!showVignette) return {}
    return {
      boxShadow: `inset 0 0 ${vignetteIntensity[intensity]} ${config.vignette}`,
    }
  }, [showVignette, intensity, config.vignette])

  return (
    <motion.div
      className={cn(
        'min-h-full relative overflow-hidden',
        `bg-gradient-to-br ${config.gradient}`,
        config.textClass,
        className
      )}
      style={vignetteStyle}
      data-scene={type}
      data-mood={config.mood}
      initial={enableTransition ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      key={type}
    >
      {/* V3: Scene transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none bg-background/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* V3: Ambient particles */}
      {enableParticles && config.particles !== 'none' && (
        <AmbientParticles type={config.particles} color={config.particleColor} />
      )}

      {/* Content */}
      <motion.div
        className="relative z-10"
        initial={enableTransition ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// V3: Ambient particles component
function AmbientParticles({
  type,
  color,
}: {
  type: ParticleType
  color: string
}) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    // Generate particles based on type
    const count = type === 'papers' ? 5 : type === 'warmth' ? 8 : type === 'clinical' ? 3 : 6
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: type === 'papers' ? 8 + Math.random() * 12 : 2 + Math.random() * 4,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
    }))
    setParticles(newParticles)
  }, [type])

  if (type === 'none') return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: type === 'papers' ? particle.size * 1.4 : particle.size,
            backgroundColor: color,
            borderRadius: type === 'papers' ? '2px' : '50%',
          }}
          animate={{
            y: type === 'papers' ? [0, 100, 200] : [0, -20, 0],
            x: type === 'papers' ? [0, 20, -10, 30] : [0, 10, -10, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: type === 'papers' ? [0, 45, -30, 60] : 0,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
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

// Component for scene transitions with crossfade
interface SceneTransitionProps {
  from: SceneType
  to: SceneType
  isActive?: boolean
  onComplete?: () => void
}

export function SceneTransition({ from, to, isActive = true, onComplete }: SceneTransitionProps) {
  const fromConfig = sceneConfigs[from]
  const toConfig = sceneConfigs[to]

  // Determine transition color based on mood change
  const getMoodColor = () => {
    if (fromConfig.mood === 'warm' && toConfig.mood === 'cold') {
      return 'rgba(148, 163, 184, 0.5)' // Slate overlay for warm→cold
    }
    if (fromConfig.mood === 'cold' && toConfig.mood === 'warm') {
      return 'rgba(251, 191, 36, 0.3)' // Amber overlay for cold→warm
    }
    if (toConfig.mood === 'tense') {
      return 'rgba(0, 0, 0, 0.4)' // Dark overlay for tense scenes
    }
    return 'rgba(255, 255, 255, 0.5)' // Default white fade
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: getMoodColor() }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  )
}

// V3: Time skip transition overlay
interface TimeSkipTransitionProps {
  months: number
  isActive: boolean
  onComplete?: () => void
}

export function TimeSkipTransition({ months, isActive, onComplete }: TimeSkipTransitionProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-background/90 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={onComplete}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-4xl font-serif text-muted-foreground mb-2">
              {months} month{months > 1 ? 's' : ''} later...
            </p>
            <p className="text-sm text-muted-foreground/60 italic">
              Time passes quietly
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SceneWrapper
