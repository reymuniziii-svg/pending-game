import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface SceneImageProps {
  src: string
  alt: string
  className?: string
  fadeIn?: boolean
  overlay?: 'none' | 'light' | 'dark' | 'gradient'
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1' | '3:4'
}

export function SceneImage({
  src,
  alt,
  className,
  fadeIn = true,
  overlay = 'none',
  aspectRatio = 'auto',
}: SceneImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  const aspectClasses = {
    'auto': '',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
  }

  const overlayClasses = {
    'none': '',
    'light': 'after:absolute after:inset-0 after:bg-white/20',
    'dark': 'after:absolute after:inset-0 after:bg-black/30',
    'gradient': 'after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/50 after:to-transparent',
  }

  if (error) {
    return (
      <div 
        className={cn(
          'bg-muted flex items-center justify-center text-muted-foreground',
          aspectClasses[aspectRatio],
          className
        )}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        aspectClasses[aspectRatio],
        overlayClasses[overlay],
        className
      )}
    >
      <AnimatePresence>
        {fadeIn && !loaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-muted animate-pulse"
          />
        )}
      </AnimatePresence>
      
      <motion.img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover',
          fadeIn && 'transition-opacity duration-500',
          fadeIn && !loaded && 'opacity-0',
        )}
        initial={fadeIn ? { opacity: 0 } : false}
        animate={fadeIn ? { opacity: loaded ? 1 : 0 } : false}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

interface CharacterPortraitProps {
  characterId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
}

const PORTRAIT_PATHS: Record<string, string> = {
  maria: '/images/characters/maria-portrait.png',
  david: '/images/characters/david-portrait.png',
  fatima: '/images/characters/fatima-portrait.png',
  elena: '/images/characters/elena-portrait.png',
}

export function CharacterPortrait({
  characterId,
  size = 'md',
  className,
  showBorder = true,
}: CharacterPortraitProps) {
  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-24 h-32',
    lg: 'w-32 h-44',
    xl: 'w-48 h-64',
  }

  const src = PORTRAIT_PATHS[characterId] || PORTRAIT_PATHS.maria

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg',
        showBorder && 'border-2 border-border shadow-md',
        sizeClasses[size],
        className
      )}
    >
      <SceneImage
        src={src}
        alt={`${characterId} portrait`}
        aspectRatio="3:4"
        className="w-full h-full"
      />
    </div>
  )
}

interface EventSceneProps {
  sceneType?: string
  tags?: string[]
  className?: string
}

const SCENE_PATHS: Record<string, string> = {
  mailbox: '/images/scenes/mailbox-waiting.png',
  paperwork: '/images/scenes/paperwork-burden.png',
  waiting: '/images/scenes/waiting-room.png',
  calendar: '/images/scenes/calendar-waiting.png',
  classroom: '/images/scenes/classroom-teaching.png',
  office: '/images/scenes/office-late-night.png',
  family: '/images/scenes/family-dinner.png',
  airport: '/images/scenes/airport-separation.png',
  phone: '/images/scenes/phone-checking.png',
  hope: '/images/scenes/hopeful-sunrise.png',
}

const TAG_TO_SCENE: Record<string, string> = {
  'mail': 'mailbox',
  'letter': 'mailbox',
  'uscis': 'paperwork',
  'form': 'paperwork',
  'application': 'paperwork',
  'wait': 'waiting',
  'office': 'office',
  'work': 'office',
  'job': 'office',
  'family': 'family',
  'home': 'family',
  'airport': 'airport',
  'travel': 'airport',
  'deadline': 'calendar',
  'renewal': 'calendar',
  'hope': 'hope',
  'success': 'hope',
  'approved': 'hope',
  'school': 'classroom',
  'teaching': 'classroom',
  'phone': 'phone',
  'call': 'phone',
  'news': 'phone',
}

export function EventScene({
  sceneType,
  tags = [],
  className,
}: EventSceneProps) {
  let scenePath = SCENE_PATHS.waiting

  if (sceneType && SCENE_PATHS[sceneType]) {
    scenePath = SCENE_PATHS[sceneType]
  } else {
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase()
      if (TAG_TO_SCENE[normalizedTag] && SCENE_PATHS[TAG_TO_SCENE[normalizedTag]]) {
        scenePath = SCENE_PATHS[TAG_TO_SCENE[normalizedTag]]
        break
      }
    }
  }

  return (
    <SceneImage
      src={scenePath}
      alt="Scene illustration"
      aspectRatio="16:9"
      overlay="gradient"
      className={cn('rounded-lg', className)}
    />
  )
}
