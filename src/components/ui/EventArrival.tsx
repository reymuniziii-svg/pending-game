import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Mail,
  Phone,
  User,
  Newspaper,
  Brain,
  Bell,
  FileText,
  AlertCircle,
  Building,
  Heart,
  Briefcase,
  Plane,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GameEvent } from '@/types'

// Event arrival types determine the entrance animation
export type ArrivalType =
  | 'letter'      // Envelope slides in, opens, unfolds
  | 'phone'       // Ring animation, answer to reveal
  | 'person'      // Doorbell, silhouette approaches
  | 'news'        // Breaking news banner slides across
  | 'internal'    // Thought bubble expands
  | 'official'    // Stamp, seal reveal
  | 'emergency'   // Flash, urgent pulse
  | 'default'     // Simple fade in

interface EventArrivalProps {
  event: GameEvent
  arrivalType?: ArrivalType
  onComplete: () => void
  className?: string
}

// Map scene types to arrival types
function getArrivalType(event: GameEvent): ArrivalType {
  // Check tags first
  if (event.tags?.includes('letter') || event.tags?.includes('mail')) return 'letter'
  if (event.tags?.includes('phone') || event.tags?.includes('call')) return 'phone'
  if (event.tags?.includes('visitor') || event.tags?.includes('meeting')) return 'person'
  if (event.tags?.includes('news')) return 'news'
  if (event.tags?.includes('thought') || event.tags?.includes('reflection')) return 'internal'
  if (event.tags?.includes('official') || event.tags?.includes('uscis') || event.tags?.includes('legal')) return 'official'
  if (event.tags?.includes('emergency') || event.tags?.includes('urgent')) return 'emergency'

  // Check scene type
  if (event.sceneType === 'uscis' || event.sceneType === 'court') return 'official'
  if (event.sceneType === 'home') return 'internal'
  if (event.sceneType === 'work') return 'person'
  if (event.sceneType === 'airport') return 'emergency'

  return 'default'
}

// Icons for arrival types
const arrivalIcons: Record<ArrivalType, ReactNode> = {
  letter: <Mail className="w-12 h-12" />,
  phone: <Phone className="w-12 h-12" />,
  person: <User className="w-12 h-12" />,
  news: <Newspaper className="w-12 h-12" />,
  internal: <Brain className="w-12 h-12" />,
  official: <FileText className="w-12 h-12" />,
  emergency: <AlertCircle className="w-12 h-12" />,
  default: <Bell className="w-12 h-12" />,
}

// Scene-specific icons
const sceneIcons: Record<string, ReactNode> = {
  home: <Heart className="w-8 h-8" />,
  work: <Briefcase className="w-8 h-8" />,
  uscis: <Building className="w-8 h-8" />,
  airport: <Plane className="w-8 h-8" />,
  court: <Building className="w-8 h-8" />,
}

export function EventArrival({
  event,
  arrivalType: forcedType,
  onComplete,
  className,
}: EventArrivalProps) {
  const [stage, setStage] = useState<'arriving' | 'opening' | 'revealed' | 'done'>('arriving')
  const arrivalType = forcedType || getArrivalType(event)

  // Progress through stages
  useEffect(() => {
    const timings: Record<typeof stage, number> = {
      arriving: 800,
      opening: 600,
      revealed: 400,
      done: 0,
    }

    if (stage === 'done') {
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      if (stage === 'arriving') setStage('opening')
      else if (stage === 'opening') setStage('revealed')
      else if (stage === 'revealed') setStage('done')
    }, timings[stage])

    return () => clearTimeout(timer)
  }, [stage, onComplete])

  return (
    <div className={cn(
      'fixed inset-0 flex items-center justify-center z-50',
      'bg-background/80 backdrop-blur-sm',
      className
    )}>
      <AnimatePresence mode="wait">
        {arrivalType === 'letter' && <LetterArrival stage={stage} event={event} />}
        {arrivalType === 'phone' && <PhoneArrival stage={stage} event={event} />}
        {arrivalType === 'person' && <PersonArrival stage={stage} event={event} />}
        {arrivalType === 'news' && <NewsArrival stage={stage} event={event} />}
        {arrivalType === 'internal' && <InternalArrival stage={stage} event={event} />}
        {arrivalType === 'official' && <OfficialArrival stage={stage} event={event} />}
        {arrivalType === 'emergency' && <EmergencyArrival stage={stage} event={event} />}
        {arrivalType === 'default' && <DefaultArrival stage={stage} event={event} />}
      </AnimatePresence>
    </div>
  )
}

// Letter arrival - envelope slides in, opens
function LetterArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="relative"
      initial={{ x: 300, opacity: 0, rotate: -10 }}
      animate={
        stage === 'arriving' ? { x: 0, opacity: 1, rotate: 0 } :
        stage === 'opening' ? { scale: 1.1, y: -20 } :
        { scale: 1, y: 0 }
      }
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Envelope */}
      <div className="relative w-64 h-40 bg-white border-2 border-border rounded-lg shadow-xl overflow-hidden">
        {/* Envelope flap */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-muted to-white origin-bottom"
          style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
          animate={
            stage === 'opening' || stage === 'revealed' || stage === 'done'
              ? { rotateX: 180, opacity: 0 }
              : { rotateX: 0 }
          }
          transition={{ duration: 0.4 }}
        />

        {/* Letter content preview */}
        <motion.div
          className="absolute inset-4 top-8 bg-white border border-border/50 rounded p-3"
          initial={{ y: 20, opacity: 0 }}
          animate={
            stage === 'revealed' || stage === 'done'
              ? { y: 0, opacity: 1 }
              : { y: 20, opacity: 0 }
          }
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-mono text-muted-foreground truncate">
            {event.title}
          </p>
        </motion.div>

        {/* Mail icon */}
        <div className="absolute bottom-3 right-3 text-accent/40">
          <Mail className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  )
}

// Phone arrival - ringing animation
function PhoneArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Phone icon with ring */}
      <motion.div
        className="relative p-6 bg-card rounded-full shadow-xl border-2 border-border"
        animate={
          stage === 'arriving'
            ? {
                rotate: [-5, 5, -5, 5, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }
            : { rotate: 0, scale: 1 }
        }
        transition={{
          duration: 0.5,
          repeat: stage === 'arriving' ? Infinity : 0,
          repeatDelay: 0.3,
        }}
      >
        <Phone className="w-12 h-12 text-accent" />

        {/* Ring waves */}
        {stage === 'arriving' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
      </motion.div>

      {/* Caller info */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={stage !== 'arriving' ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
      >
        <p className="text-lg font-medium text-foreground">{event.title}</p>
        <p className="text-sm text-muted-foreground">Incoming call...</p>
      </motion.div>
    </motion.div>
  )
}

// Person arrival - silhouette approaches
function PersonArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div className="flex flex-col items-center gap-6">
      {/* Doorbell ring */}
      {stage === 'arriving' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-lg font-medium text-foreground"
        >
          *knock knock*
        </motion.div>
      )}

      {/* Person silhouette */}
      <motion.div
        className="relative w-32 h-32"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={
          stage === 'arriving' ? { scale: 0.7, opacity: 0.3 } :
          stage === 'opening' ? { scale: 0.9, opacity: 0.6 } :
          { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <User className="w-full h-full text-foreground" />
        </div>
      </motion.div>

      {/* Name reveal */}
      <motion.p
        className="text-lg font-medium text-foreground"
        initial={{ opacity: 0 }}
        animate={stage === 'revealed' || stage === 'done' ? { opacity: 1 } : {}}
      >
        {event.title}
      </motion.p>
    </motion.div>
  )
}

// News arrival - banner slides across
function NewsArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="relative w-full max-w-lg"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="bg-danger text-white px-6 py-4 rounded-lg shadow-xl">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              Breaking News
            </p>
            <p className="font-medium">{event.title}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Internal thought - bubble expands
function InternalArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, opacity: 0 }}
      animate={
        stage === 'arriving' ? { scale: 0.5, opacity: 0.5 } :
        stage === 'opening' ? { scale: 0.8, opacity: 0.8 } :
        { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Thought bubble */}
      <div className="relative bg-card border-2 border-border rounded-2xl px-8 py-6 shadow-xl">
        <Brain className="w-8 h-8 text-accent mx-auto mb-3" />
        <p className="text-center font-serif text-lg text-foreground">
          {event.title}
        </p>

        {/* Bubble tail */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-3 h-3 bg-card border-2 border-border rounded-full" />
          <div className="w-2 h-2 bg-card border-2 border-border rounded-full mt-1" />
        </div>
      </div>
    </motion.div>
  )
}

// Official document - stamp seal
function OfficialArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="relative"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Document */}
      <div className="relative w-72 bg-white border-2 border-border rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <Building className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Official Notice
          </span>
        </div>

        {/* Content */}
        <p className="font-medium text-foreground mb-4">{event.title}</p>

        {/* Stamp */}
        <motion.div
          className="absolute bottom-4 right-4"
          initial={{ scale: 2, opacity: 0, rotate: -15 }}
          animate={
            stage === 'revealed' || stage === 'done'
              ? { scale: 1, opacity: 1, rotate: -5 }
              : { scale: 2, opacity: 0 }
          }
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-danger flex items-center justify-center bg-danger/10">
            <span className="text-danger font-bold text-xs text-center">
              OFFICIAL
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Emergency - flashing urgent
function EmergencyArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Pulsing alert */}
      <motion.div
        className="relative p-6 bg-danger/10 rounded-full border-4 border-danger"
        animate={
          stage === 'arriving'
            ? {
                scale: [1, 1.1, 1],
                borderColor: ['rgb(192, 57, 43)', 'rgb(255, 100, 80)', 'rgb(192, 57, 43)'],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: stage === 'arriving' ? Infinity : 0,
        }}
      >
        <AlertCircle className="w-12 h-12 text-danger" />
      </motion.div>

      {/* Urgent text */}
      <motion.div
        className="text-center"
        animate={stage === 'arriving' ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 0.5, repeat: stage === 'arriving' ? Infinity : 0 }}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-danger mb-1">
          Urgent
        </p>
        <p className="text-lg font-medium text-foreground">{event.title}</p>
      </motion.div>
    </motion.div>
  )
}

// Default - simple fade in
function DefaultArrival({ stage, event }: { stage: string; event: GameEvent }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="mb-4"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5 }}
      >
        {sceneIcons[event.sceneType || 'home'] || <Bell className="w-12 h-12 mx-auto text-accent" />}
      </motion.div>
      <p className="text-xl font-medium text-foreground">{event.title}</p>
    </motion.div>
  )
}

// Simple arrival indicator for compact spaces
export function ArrivalIndicator({
  type,
  className,
}: {
  type: ArrivalType
  className?: string
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-accent/10 text-accent text-sm',
        className
      )}
    >
      {arrivalIcons[type]}
      <span className="capitalize">{type}</span>
    </motion.div>
  )
}

export default EventArrival
