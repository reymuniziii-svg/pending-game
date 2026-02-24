import { POLICY_TRAPS } from '@/data/traps'
import type {
  EventOutcome,
  GameDate,
  ImmigrationStatusType,
} from '@/types'
import { evaluateConditions, type ConditionContext } from './conditionEvaluator'

interface TrapContext extends ConditionContext {
  currentDate: GameDate
  getFlag: (key: string) => string | number | boolean | undefined
  setFlag: (key: string, value: string | number | boolean) => void
  statusType?: ImmigrationStatusType
}

export interface LegalRuleResult {
  id: string
  triggered: boolean
  message: string
}

export function processPolicyTraps(
  context: TrapContext,
  applyOutcome: (outcome: EventOutcome) => void
): string[] {
  const triggeredTrapIds: string[] = []

  for (const trap of POLICY_TRAPS) {
    const alreadyTriggered = context.getFlag(`${trap.id}_triggered`) === true
    if (alreadyTriggered) {
      continue
    }

    const meetsTriggers = evaluateConditions(trap.triggers, context)
    if (!meetsTriggers) {
      continue
    }

    const avoided = trap.avoidanceConditions
      ? evaluateConditions(trap.avoidanceConditions, context)
      : false

    if (avoided) {
      context.setFlag(`${trap.id}_avoided`, true)
      continue
    }

    for (const consequence of trap.consequences) {
      applyOutcome(consequence)
    }

    context.setFlag(`${trap.id}_triggered`, true)
    triggeredTrapIds.push(trap.id)
  }

  return triggeredTrapIds
}

export function evaluateLegalRuleChecks(context: TrapContext): LegalRuleResult[] {
  const results: LegalRuleResult[] = []

  // DACA policy reality check: renewals only as current baseline.
  if (context.statusType === 'daca') {
    results.push({
      id: 'rule_daca_renewal_only',
      triggered: true,
      message: 'DACA remains renewal-focused; new initial grants are not available in this simulation baseline.',
    })
  }

  const unlawfulPresenceDays = Number(context.flags.unlawfulPresenceDays || 0)
  const departed = context.flags.departed_us === true
  if (departed && unlawfulPresenceDays >= 180 && unlawfulPresenceDays < 365) {
    results.push({
      id: 'rule_3_year_bar',
      triggered: true,
      message: 'Departure after 180+ days unlawful presence may trigger a 3-year bar.',
    })
  }

  if (departed && unlawfulPresenceDays >= 365) {
    results.push({
      id: 'rule_10_year_bar',
      triggered: true,
      message: 'Departure after 365+ days unlawful presence may trigger a 10-year bar.',
    })
  }

  if (context.flags.h1b_terminated === true && Number(context.flags.daysSinceTermination || 0) > 60) {
    results.push({
      id: 'rule_h1b_60_day_clock',
      triggered: true,
      message: 'H-1B grace period exceeded without transfer or status change.',
    })
  }

  if (context.flags.seeking_asylum === true && Number(context.flags.monthsSinceArrival || 0) > 12 && !context.flags.asylum_filed) {
    results.push({
      id: 'rule_asylum_one_year_deadline',
      triggered: true,
      message: 'Asylum filing occurred beyond one-year deadline without documented exception.',
    })
  }

  if (context.flags.moved_addresses === true && Number(context.flags.daysSinceMove || 0) > 10 && !context.flags.ar11_filed) {
    results.push({
      id: 'rule_ar11',
      triggered: true,
      message: 'Address change was not reported within AR-11 ten-day expectation.',
    })
  }

  if (context.flags.visa_bulletin_regressed === true) {
    results.push({
      id: 'rule_visa_bulletin_regression',
      triggered: true,
      message: 'Visa bulletin regression may block adjustment despite prior progress.',
    })
  }

  return results
}
