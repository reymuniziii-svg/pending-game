import type {
  EventOutcome,
  GameDate,
  CharacterStats,
  FormOutcomeType,
  ImmigrationStatusType,
  Document,
} from '@/types'

export interface OutcomeExecutionContext {
  getFlag: (key: string) => string | number | boolean | undefined
  setFlag: (key: string, value: string | number | boolean) => void
  modifyStat: (stat: keyof CharacterStats, delta: number) => void
  queueEvent: (eventId: string, priority?: number) => void
  queueScheduledEvent: (eventId: string, date: GameDate) => void
  addIncome: (amount: number, description: string, date: GameDate) => void
  addExpense: (amount: number, description: string, date: GameDate) => void
  changeRelationship: (id: string, delta: number, reason: string, date: GameDate) => void
  endGame: () => void
  transitionStatus: (toStatus: ImmigrationStatusType, reason: string, date: GameDate) => boolean
  fileApplication: (formId: string, date: GameDate) => boolean
  applyApplicationDecision: (target: string, outcome: FormOutcomeType, date: GameDate) => boolean
  triggerTrap: (trapId: string, date: GameDate) => boolean
  addDocument: (document: Document) => void
  removeDocument: (documentId: string) => void
  random: () => number
  addMonths: (date: GameDate, months: number) => GameDate
}

function passesProbability(outcome: EventOutcome, random: () => number): boolean {
  if (outcome.probability === undefined) {
    return true
  }
  return random() <= outcome.probability
}

function parseNumber(value: string | number | boolean | undefined, fallback = 0): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? fallback : parsed
  }

  return fallback
}

function parseBool(value: string | number | boolean | undefined, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return fallback
}

function parseDocumentType(value: string | number | boolean | undefined): Document['type'] {
  const fallback: Document['type'] = 'other'
  if (typeof value !== 'string') {
    return fallback
  }

  const knownTypes: Document['type'][] = [
    'passport',
    'visa',
    'ead',
    'green-card',
    'birth-certificate',
    'marriage-certificate',
    'diploma',
    'tax-return',
    'pay-stub',
    'bank-statement',
    'letter',
    'court-order',
    'other',
  ]

  return knownTypes.includes(value as Document['type'])
    ? (value as Document['type'])
    : fallback
}

export function executeOutcome(
  outcome: EventOutcome,
  currentDate: GameDate,
  context: OutcomeExecutionContext
): boolean {
  if (!passesProbability(outcome, context.random)) {
    return false
  }

  switch (outcome.type) {
    case 'flag-set': {
      context.setFlag(outcome.target, outcome.value ?? true)
      return true
    }
    case 'flag-increment': {
      const current = parseNumber(context.getFlag(outcome.target), 0)
      context.setFlag(outcome.target, current + parseNumber(outcome.value, 1))
      return true
    }
    case 'stat-change': {
      context.modifyStat(outcome.target as keyof CharacterStats, parseNumber(outcome.value, 0))
      return true
    }
    case 'queue-event': {
      const delay = parseNumber(outcome.delayMonths, 0)
      if (delay > 0) {
        context.queueScheduledEvent(outcome.target, context.addMonths(currentDate, delay))
      } else {
        context.queueEvent(outcome.target)
      }
      return true
    }
    case 'trigger-event': {
      context.queueEvent(outcome.target, 100)
      return true
    }
    case 'finance-add': {
      context.addIncome(parseNumber(outcome.value, 0), outcome.target, currentDate)
      return true
    }
    case 'finance-subtract': {
      context.addExpense(parseNumber(outcome.value, 0), outcome.target, currentDate)
      return true
    }
    case 'relationship-change': {
      context.changeRelationship(outcome.target, parseNumber(outcome.value, 0), 'Event outcome', currentDate)
      return true
    }
    case 'status-change': {
      return context.transitionStatus(
        outcome.target as ImmigrationStatusType,
        'Event outcome status transition',
        currentDate
      )
    }
    case 'file-application': {
      return context.fileApplication(outcome.target, currentDate)
    }
    case 'application-decision': {
      const decision = typeof outcome.value === 'string'
        ? (outcome.value as FormOutcomeType)
        : (parseBool(outcome.value, true) ? 'approved' : 'denied')
      return context.applyApplicationDecision(outcome.target, decision, currentDate)
    }
    case 'trigger-trap': {
      return context.triggerTrap(outcome.target, currentDate)
    }
    case 'add-document': {
      context.addDocument({
        id: `${outcome.target}-${Date.now()}`,
        name: outcome.target,
        type: parseDocumentType(outcome.value),
        isValid: true,
      })
      return true
    }
    case 'remove-document': {
      context.removeDocument(outcome.target)
      return true
    }
    case 'end-game': {
      context.endGame()
      return true
    }
    default: {
      const exhaustiveCheck: never = outcome.type
      console.warn('Unhandled outcome type', exhaustiveCheck)
      return false
    }
  }
}

export function executeOutcomes(
  outcomes: EventOutcome[],
  currentDate: GameDate,
  context: OutcomeExecutionContext
): number {
  let executed = 0
  for (const outcome of outcomes) {
    if (executeOutcome(outcome, currentDate, context)) {
      executed += 1
    }
  }
  return executed
}
