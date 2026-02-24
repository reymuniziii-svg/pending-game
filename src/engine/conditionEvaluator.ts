import type {
  EventCondition,
  ConditionOperator,
  CharacterStats,
  GameDate,
  ImmigrationStatusType,
} from '@/types'

interface ConditionContext {
  statusType?: ImmigrationStatusType
  flags: Record<string, string | number | boolean | undefined>
  bankBalance: number
  relationships: Record<string, number>
  stats: CharacterStats
  date: GameDate
  characterId?: string | null
  applications?: Record<string, unknown>
}

function compareOperator(
  operator: ConditionOperator,
  left: unknown,
  right: string | number | boolean | string[]
): boolean {
  switch (operator) {
    case '==':
      return left === right
    case '!=':
      return left !== right
    case '>':
      return typeof left === 'number' && typeof right === 'number' && left > right
    case '<':
      return typeof left === 'number' && typeof right === 'number' && left < right
    case '>=':
      return typeof left === 'number' && typeof right === 'number' && left >= right
    case '<=':
      return typeof left === 'number' && typeof right === 'number' && left <= right
    case 'in':
      return Array.isArray(right) && right.includes(String(left))
    case 'not-in':
      return Array.isArray(right) && !right.includes(String(left))
    case 'exists':
      return left !== undefined && left !== null
    case 'not-exists':
      return left === undefined || left === null
    default:
      return false
  }
}

export function resolveConditionValue(condition: EventCondition, context: ConditionContext): unknown {
  switch (condition.type) {
    case 'status':
      return context.statusType
    case 'flag':
      return context.flags[condition.target]
    case 'finance':
      if (condition.target === 'balance') {
        return context.bankBalance
      }
      return undefined
    case 'relationship':
      return context.relationships[condition.target] ?? 0
    case 'stat':
      return context.stats[condition.target as keyof CharacterStats] ?? 0
    case 'date':
      if (condition.target === 'month') {
        return context.date.month
      }
      if (condition.target === 'year') {
        return context.date.year
      }
      return undefined
    case 'character':
      return context.characterId
    case 'application':
      return context.applications?.[condition.target]
    default:
      return undefined
  }
}

export function evaluateCondition(condition: EventCondition, context: ConditionContext): boolean {
  const value = resolveConditionValue(condition, context)
  return compareOperator(condition.operator, value, condition.value)
}

export function evaluateConditions(conditions: EventCondition[], context: ConditionContext): boolean {
  return conditions.every((condition) => evaluateCondition(condition, context))
}

export type { ConditionContext }
