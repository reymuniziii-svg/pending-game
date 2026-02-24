import { create } from 'zustand'
import seedrandom from 'seedrandom'

type SimulationStream = 'core' | 'events' | 'forms' | 'traps'

interface StreamCounters {
  core: number
  events: number
  forms: number
  traps: number
}

interface SimulationState {
  seed: string
  turn: number
  bundleVersion: string
  streamCounters: StreamCounters
  initialize: (seed?: string) => void
  nextRandom: (stream?: SimulationStream) => number
  setBundleVersion: (version: string) => void
  reset: () => void
}

const initialCounters = (): StreamCounters => ({
  core: 0,
  events: 0,
  forms: 0,
  traps: 0,
})

const createSeed = (): string => {
  const randomPart = Math.random().toString(36).slice(2)
  const timestampPart = Date.now().toString(36)
  return `pending-${timestampPart}-${randomPart}`
}

const initialState = {
  seed: createSeed(),
  turn: 0,
  bundleVersion: 'local-dev',
  streamCounters: initialCounters(),
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  ...initialState,

  initialize: (seed) => set({
    seed: seed || createSeed(),
    turn: 0,
    streamCounters: initialCounters(),
  }),

  nextRandom: (stream = 'core') => {
    const state = get()
    const streamTurn = state.streamCounters[stream]
    const rng = seedrandom(`${state.seed}:${stream}:${streamTurn}`)
    const value = rng()

    set({
      turn: state.turn + 1,
      streamCounters: {
        ...state.streamCounters,
        [stream]: streamTurn + 1,
      },
    })

    return value
  },

  setBundleVersion: (version) => set({ bundleVersion: version }),

  reset: () => set({
    ...initialState,
    seed: createSeed(),
  }),
}))

export { createSeed as createSimulationSeed }
