import { useMemo, useRef, useEffect, useState } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import { cn } from '@/lib/utils'

// Animation type definitions
export type AnimationType =
  | 'document-processing'
  | 'waiting'
  | 'stamp-approved'
  | 'stamp-denied'
  | 'heart-pulse'
  | 'loading'
  | 'success-check'
  | 'alert-warning'
  | 'clock-ticking'
  | 'paper-shuffle'
  | 'hourglass'
  | 'sad-emotion'
  | 'celebration'
  | 'thinking'

// LottieFiles animation URLs (cached externally)
const ANIMATION_URLS: Partial<Record<AnimationType, string>> = {
  'hourglass': 'https://lottie.host/9e34c296-af27-470c-b1b3-93c4f6c8d25c/ZfhV1n2H0j.json',
  'waiting': 'https://lottie.host/7dd6f4b9-e8c2-4a52-9d43-c81e1f5b1f7c/2ZZl9OJxKA.json',
  'sad-emotion': 'https://lottie.host/c1f37c8a-e9c1-4c49-8e6c-fa39d2b2b0c0/pl1RMRaoNi.json',
  'document-processing': 'https://lottie.host/0a5eb8e4-95f8-4e95-a7ee-a8c7d0e7a234/papers.json',
  'celebration': 'https://lottie.host/5e8c1a8d-96a2-4b45-9d35-6e0f8c7d9b43/celebration.json',
  'thinking': 'https://lottie.host/3d4f8c9a-e1b2-4c56-8f90-2a3b4c5d6e7f/thinking.json',
}

// Animation cache to avoid re-fetching
const animationCache: Map<string, object> = new Map()

// Animation speed presets based on design philosophy
// Bureaucratic = SLOW (weight of waiting)
// Emotional = GENTLE (give space to feel)
// Approval = NORMAL (relief, not celebration)
// Denial = FAST + ABRUPT (shock)
const animationSpeeds: Record<AnimationType, number> = {
  'document-processing': 0.5,
  'waiting': 0.3,
  'stamp-approved': 1.0,
  'stamp-denied': 1.2,
  'heart-pulse': 0.8,
  'loading': 0.5,
  'success-check': 1.0,
  'alert-warning': 0.8,
  'clock-ticking': 0.5,
  'paper-shuffle': 0.6,
  'hourglass': 0.4,
  'sad-emotion': 0.6,
  'celebration': 1.0,
  'thinking': 0.5,
}

// Hook to load animation data from URL with caching
function useAnimationData(type: AnimationType) {
  const [data, setData] = useState<object | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = ANIMATION_URLS[type]

    // First check inline animations
    if (inlineAnimations[type]) {
      setData(inlineAnimations[type] as object)
      return
    }

    // Check cache
    if (url && animationCache.has(url)) {
      setData(animationCache.get(url)!)
      return
    }

    // If no URL, fall back to inline loading animation
    if (!url) {
      setData(inlineAnimations['loading'] as object)
      return
    }

    // Fetch from URL
    setLoading(true)
    setError(null)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch animation')
        return res.json()
      })
      .then(json => {
        animationCache.set(url, json)
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        console.warn(`Failed to load animation ${type}:`, err)
        setError(err.message)
        setLoading(false)
        // Fall back to loading animation
        setData(inlineAnimations['loading'] as object)
      })
  }, [type])

  return { data, loading, error }
}

// Inline animation data (simple animations that don't need external files)
// These are basic placeholder animations - in production, load from files or API
const inlineAnimations: Partial<Record<AnimationType, object>> = {
  'loading': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: 'Loading',
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{
        ty: 'el',
        s: { a: 0, k: [60, 60] },
        p: { a: 0, k: [0, 0] },
        nm: 'Ellipse'
      }, {
        ty: 'st',
        c: { a: 0, k: [0.2, 0.4, 0.8, 1] },
        o: { a: 0, k: 100 },
        w: { a: 0, k: 4 },
        lc: 2,
        lj: 1,
        nm: 'Stroke',
        d: [{ n: 'd', nm: 'dash', v: { a: 0, k: 40 } }, { n: 'g', nm: 'gap', v: { a: 0, k: 100 } }]
      }],
      ip: 0,
      op: 60,
      st: 0
    }]
  },
  'success-check': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 30,
    w: 100,
    h: 100,
    nm: 'Check',
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Check',
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [0], e: [100] }, { t: 10, s: [100] }] },
        p: { a: 0, k: [50, 50, 0] },
        s: { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [100, 100, 100] }, { t: 15, s: [100, 100, 100] }] }
      },
      shapes: [{
        ty: 'gr',
        it: [{
          ty: 'sh',
          d: 1,
          ks: {
            a: 0,
            k: {
              c: false,
              v: [[-20, 0], [-5, 15], [20, -15]],
              i: [[0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0]]
            }
          }
        }, {
          ty: 'st',
          c: { a: 0, k: [0.15, 0.68, 0.38, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 6 },
          lc: 2,
          lj: 2
        }, {
          ty: 'tr',
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 }
        }],
        nm: 'Check'
      }],
      ip: 0,
      op: 30,
      st: 0
    }]
  },
  'alert-warning': {
    v: '5.5.7',
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: 'Warning',
    ddd: 0,
    assets: [],
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Warning',
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100], e: [50] }, { t: 30, s: [50], e: [100] }, { t: 60, s: [100] }] },
        p: { a: 0, k: [50, 50, 0] },
        s: { a: 1, k: [{ t: 0, s: [100, 100], e: [105, 105] }, { t: 30, s: [105, 105], e: [100, 100] }, { t: 60, s: [100, 100] }] }
      },
      shapes: [{
        ty: 'gr',
        it: [{
          ty: 'sh',
          d: 1,
          ks: {
            a: 0,
            k: {
              c: true,
              v: [[0, -30], [26, 20], [-26, 20]],
              i: [[0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0]]
            }
          }
        }, {
          ty: 'st',
          c: { a: 0, k: [0.9, 0.5, 0.13, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 },
          lc: 2,
          lj: 2
        }, {
          ty: 'fl',
          c: { a: 0, k: [1, 0.95, 0.8, 1] },
          o: { a: 0, k: 100 }
        }, {
          ty: 'tr',
          p: { a: 0, k: [0, 5] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 }
        }],
        nm: 'Triangle'
      }],
      ip: 0,
      op: 60,
      st: 0
    }]
  },
}

interface LottieAnimationProps {
  type: AnimationType
  className?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
  onComplete?: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

export function LottieAnimation({
  type,
  className,
  loop = false,
  autoplay = true,
  speed,
  onComplete,
  size = 'md',
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  // Get animation data (from cache, URL, or inline)
  const { data: animationData, loading } = useAnimationData(type)

  // Apply speed based on animation type or custom speed
  const effectiveSpeed = speed ?? animationSpeeds[type] ?? 1.0

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(effectiveSpeed)
    }
  }, [effectiveSpeed])

  // Show loading state while fetching external animations
  if (loading || !animationData) {
    return (
      <div className={cn(sizeClasses[size], 'flex items-center justify-center', className)}>
        <div className="animate-pulse rounded-full bg-accent/20 w-full h-full" />
      </div>
    )
  }

  return (
    <div className={cn(sizeClasses[size], className)}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        className="w-full h-full"
      />
    </div>
  )
}

// Specialized animation components for common use cases

export function DocumentProcessingAnimation({ className }: { className?: string }) {
  return (
    <LottieAnimation
      type="document-processing"
      loop={true}
      size="lg"
      className={className}
    />
  )
}

export function WaitingAnimation({ className }: { className?: string }) {
  return (
    <LottieAnimation
      type="waiting"
      loop={true}
      size="xl"
      className={cn('opacity-60', className)}
    />
  )
}

export function ApprovalAnimation({ onComplete, className }: { onComplete?: () => void; className?: string }) {
  return (
    <LottieAnimation
      type="success-check"
      loop={false}
      size="lg"
      onComplete={onComplete}
      className={className}
    />
  )
}

export function DenialAnimation({ onComplete, className }: { onComplete?: () => void; className?: string }) {
  return (
    <LottieAnimation
      type="alert-warning"
      loop={false}
      speed={1.5}
      size="lg"
      onComplete={onComplete}
      className={cn('text-danger', className)}
    />
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <LottieAnimation
      type="loading"
      loop={true}
      size="md"
      className={className}
    />
  )
}

// V3: Additional specialized animations

export function HourglassAnimation({ className }: { className?: string }) {
  return (
    <LottieAnimation
      type="hourglass"
      loop={true}
      size="lg"
      className={cn('opacity-80', className)}
    />
  )
}

export function SadEmotionAnimation({ onComplete, className }: { onComplete?: () => void; className?: string }) {
  return (
    <LottieAnimation
      type="sad-emotion"
      loop={false}
      size="lg"
      onComplete={onComplete}
      className={className}
    />
  )
}

export function CelebrationAnimation({ onComplete, className }: { onComplete?: () => void; className?: string }) {
  return (
    <LottieAnimation
      type="celebration"
      loop={false}
      size="xl"
      onComplete={onComplete}
      className={className}
    />
  )
}

export function ThinkingAnimation({ className }: { className?: string }) {
  return (
    <LottieAnimation
      type="thinking"
      loop={true}
      size="md"
      className={cn('opacity-70', className)}
    />
  )
}

export default LottieAnimation
