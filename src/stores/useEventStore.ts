import { create } from 'zustand'
import type {
  GameEvent,
  EventChoice,
  EventChain,
  CompletedEvent,
  EventOutcome,
  GameDate,
} from '@/types'
import { generateId } from '@/lib/utils'

interface QueuedEvent {
  eventId: string
  priority: number
  scheduledDate?: GameDate
}

interface EventState {
  // Event queue
  eventQueue: QueuedEvent[]
  currentEvent: GameEvent | null
  currentChoices: EventChoice[]

  // History
  eventHistory: CompletedEvent[]
  completedEventIds: Set<string>

  // Chains
  activeChains: EventChain[]

  // Scheduled events
  scheduledEvents: Array<{ eventId: string; date: GameDate }>

  // Outcome display
  lastOutcomeText: string | null
  showingOutcome: boolean

  // Actions
  queueEvent: (eventId: string, priority?: number) => void
  queueScheduledEvent: (eventId: string, date: GameDate) => void
  setCurrentEvent: (event: GameEvent) => void
  clearCurrentEvent: () => void
  selectChoice: (choiceId: string, date: GameDate) => CompletedEvent | null
  showOutcome: (text: string) => void
  hideOutcome: () => void
  completeEvent: (eventId: string, choiceId: string, date: GameDate, outcomes: EventOutcome[]) => void
  hasCompletedEvent: (eventId: string) => boolean
  getScheduledEventsForDate: (date: GameDate) => string[]
  startChain: (chain: EventChain) => void
  advanceChain: (chainId: string) => string | null
  isChainActive: (chainId: string) => boolean
  getNextQueuedEvent: () => QueuedEvent | null
  reset: () => void
}

const initialState = {
  eventQueue: [],
  currentEvent: null,
  currentChoices: [],
  eventHistory: [],
  completedEventIds: new Set<string>(),
  activeChains: [],
  scheduledEvents: [],
  lastOutcomeText: null,
  showingOutcome: false,
}

export const useEventStore = create<EventState>((set, get) => ({
  ...initialState,

  queueEvent: (eventId, priority = 0) => set((state) => {
    // Don't queue duplicates
    if (state.eventQueue.some(e => e.eventId === eventId)) {
      return state
    }

    const newQueue = [...state.eventQueue, { eventId, priority }]
    // Sort by priority (higher first)
    newQueue.sort((a, b) => b.priority - a.priority)

    return { eventQueue: newQueue }
  }),

  queueScheduledEvent: (eventId, date) => set((state) => ({
    scheduledEvents: [...state.scheduledEvents, { eventId, date }],
  })),

  setCurrentEvent: (event) => set({
    currentEvent: event,
    currentChoices: event.choices,
    showingOutcome: false,
    lastOutcomeText: null,
  }),

  clearCurrentEvent: () => set({
    currentEvent: null,
    currentChoices: [],
    showingOutcome: false,
    lastOutcomeText: null,
  }),

  selectChoice: (choiceId, date) => {
    const state = get()
    if (!state.currentEvent) return null

    const choice = state.currentChoices.find(c => c.id === choiceId)
    if (!choice) return null

    const completedEvent: CompletedEvent = {
      eventId: state.currentEvent.id,
      choiceId,
      date,
      outcomes: choice.outcomes,
    }

    set((s) => ({
      eventHistory: [...s.eventHistory, completedEvent],
      completedEventIds: new Set([...s.completedEventIds, state.currentEvent!.id]),
      lastOutcomeText: choice.outcomeText,
      showingOutcome: true,
    }))

    return completedEvent
  },

  showOutcome: (text) => set({
    lastOutcomeText: text,
    showingOutcome: true,
  }),

  hideOutcome: () => set({
    showingOutcome: false,
  }),

  completeEvent: (eventId, choiceId, date, outcomes) => set((state) => ({
    eventHistory: [...state.eventHistory, { eventId, choiceId, date, outcomes }],
    completedEventIds: new Set([...state.completedEventIds, eventId]),
    eventQueue: state.eventQueue.filter(e => e.eventId !== eventId),
  })),

  hasCompletedEvent: (eventId) => get().completedEventIds.has(eventId),

  getScheduledEventsForDate: (date) => {
    return get().scheduledEvents
      .filter(e => e.date.month === date.month && e.date.year === date.year)
      .map(e => e.eventId)
  },

  startChain: (chain) => set((state) => ({
    activeChains: [...state.activeChains, { ...chain, currentPosition: 0 }],
  })),

  advanceChain: (chainId) => {
    const state = get()
    const chain = state.activeChains.find(c => c.id === chainId)
    if (!chain) return null

    const nextPosition = chain.currentPosition + 1

    if (nextPosition >= chain.eventIds.length) {
      // Chain complete
      set({
        activeChains: state.activeChains.filter(c => c.id !== chainId),
      })
      return null
    }

    set({
      activeChains: state.activeChains.map(c =>
        c.id === chainId ? { ...c, currentPosition: nextPosition } : c
      ),
    })

    return chain.eventIds[nextPosition]
  },

  isChainActive: (chainId) => {
    return get().activeChains.some(c => c.id === chainId)
  },

  getNextQueuedEvent: () => {
    const queue = get().eventQueue
    return queue.length > 0 ? queue[0] : null
  },

  reset: () => set({
    ...initialState,
    completedEventIds: new Set(),
  }),
}))
