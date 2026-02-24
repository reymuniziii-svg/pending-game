import type { EventChain, GameEvent } from '@/types'

export function shouldStartChain(event: GameEvent): boolean {
  return Boolean(event.chainId && event.isChainStart)
}

export function getChainById(chains: EventChain[], chainId: string): EventChain | null {
  return chains.find((chain) => chain.id === chainId) || null
}

export function getNextChainEventId(
  chain: EventChain,
  currentEventId: string
): string | null {
  const currentIndex = chain.eventIds.indexOf(currentEventId)
  if (currentIndex < 0) {
    return null
  }

  const nextIndex = currentIndex + 1
  if (nextIndex >= chain.eventIds.length) {
    return null
  }

  return chain.eventIds[nextIndex]
}
