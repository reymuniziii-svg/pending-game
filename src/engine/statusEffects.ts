import type { ImmigrationStatusType } from '@/types'

export interface MonthlyStatusEffectsContext {
  statusType: ImmigrationStatusType | undefined
  getFlag: (key: string) => string | number | boolean | undefined
  setFlag: (key: string, value: string | number | boolean) => void
  addUnlawfulPresenceDays: (days: number) => void
}

const DAYS_PER_MONTH = 30

/**
 * Accrue the time-based inputs that legal traps key on, once per in-game month.
 *
 * The trap engine is correct, but its numeric triggers (`unlawfulPresenceDays`,
 * `daysSinceTermination`) only ever grow if something advances them during play. Events set
 * the boolean preconditions (e.g. `h1b_terminated`, a departure); this advances the clocks so
 * the bars and the H-1B grace-period trap can actually fire over time.
 */
export function accrueMonthlyStatusEffects(context: MonthlyStatusEffectsContext): void {
  // Unlawful presence accrues while a person is out of status.
  if (context.statusType === 'undocumented' || context.statusType === 'undocumented-overstay') {
    context.addUnlawfulPresenceDays(DAYS_PER_MONTH)
  }

  // The H-1B 60-day grace clock runs after a termination until a new sponsor is secured.
  if (context.getFlag('h1b_terminated') === true && context.getFlag('found_new_sponsor') !== true) {
    const elapsed = Number(context.getFlag('daysSinceTermination') ?? 0)
    context.setFlag('daysSinceTermination', elapsed + DAYS_PER_MONTH)
  }
}
