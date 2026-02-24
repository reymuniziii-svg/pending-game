import seedrandom from 'seedrandom'

export type RNGStream = 'core' | 'events' | 'forms' | 'traps'

export function seededFloat(seed: string, stream: RNGStream, turn: number): number {
  const rng = seedrandom(`${seed}:${stream}:${turn}`)
  return rng()
}

export function pickIndex(seed: string, stream: RNGStream, turn: number, length: number): number {
  if (length <= 0) {
    return -1
  }

  const value = seededFloat(seed, stream, turn)
  return Math.floor(value * length)
}

export function weightedPick<T extends { weight: number }>(
  items: T[],
  randomValue: number
): T | null {
  if (items.length === 0) {
    return null
  }

  const totalWeight = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0)
  if (totalWeight <= 0) {
    return items[Math.floor(randomValue * items.length)]
  }

  let cursor = randomValue * totalWeight
  for (const item of items) {
    cursor -= Math.max(0, item.weight)
    if (cursor <= 0) {
      return item
    }
  }

  return items[items.length - 1]
}
