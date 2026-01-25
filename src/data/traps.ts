import type { PolicyTrap, TrapSeverity, EventCondition, EventOutcome } from '@/types'

// Policy traps represent real dysfunctions in the immigration system
// These are the "gotcha" moments that can derail someone's immigration journey

export const POLICY_TRAPS: PolicyTrap[] = [
  {
    id: 'trap_aging_out',
    name: 'Aging Out',
    description: 'Children who turn 21 while their parent\'s petition is pending may lose their derivative status.',
    explanation: 'Under INA Section 203(h), a child who turns 21 during the waiting period may no longer qualify as a "child" for immigration purposes. Some protections exist (CSPA), but many fall through the cracks.',
    realWorldExample: 'A family petition filed when a child is 15 may take 10+ years to become current. By then, the child is 25+ and no longer qualifies.',
    triggers: [
      { type: 'stat', target: 'childAge', operator: '>=', value: 21 },
      { type: 'flag', target: 'has_pending_family_petition', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'aged_out', value: true },
      { type: 'stat-change', target: 'stress', value: 40 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'cspa_protected', operator: '==', value: true },
    ],
    avoidanceHint: 'The Child Status Protection Act (CSPA) may help in some cases, but the formula is complex.',
    severity: 'catastrophic',
    isRecoverable: false,
    recoveryPath: undefined,
  },
  {
    id: 'trap_3_year_bar',
    name: '3-Year Unlawful Presence Bar',
    description: 'If you leave the U.S. after being unlawfully present for 180+ days but less than 1 year, you are barred from returning for 3 years.',
    explanation: 'INA Section 212(a)(9)(B)(i)(I). The bar is triggered by departure, not by the unlawful presence itself. Many people don\'t realize the trap until they leave.',
    realWorldExample: 'A student who overstays their visa by 200 days, then leaves for a consular interview, triggers a 3-year bar from reentering.',
    triggers: [
      { type: 'stat', target: 'unlawfulPresenceDays', operator: '>=', value: 180 },
      { type: 'stat', target: 'unlawfulPresenceDays', operator: '<', value: 365 },
      { type: 'flag', target: 'departed_us', operator: '==', value: true },
    ],
    consequences: [
      { type: 'status-change', target: 'barred-3-year', value: true },
      { type: 'stat-change', target: 'stress', value: 50 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'has_approved_waiver', operator: '==', value: true },
    ],
    avoidanceHint: 'The I-601A provisional waiver may help if you have a qualifying relative and can prove extreme hardship.',
    severity: 'catastrophic',
    isRecoverable: true,
    recoveryPath: 'Wait out the bar or apply for a waiver through I-601.',
  },
  {
    id: 'trap_10_year_bar',
    name: '10-Year Unlawful Presence Bar',
    description: 'If you leave the U.S. after being unlawfully present for 1+ year, you are barred from returning for 10 years.',
    explanation: 'INA Section 212(a)(9)(B)(i)(II). This is the most common trap for undocumented immigrants who want to legalize through a U.S. citizen spouse.',
    realWorldExample: 'Elena entered without inspection 13 years ago. If she leaves to attend a consular interview, she triggers a 10-year bar.',
    triggers: [
      { type: 'stat', target: 'unlawfulPresenceDays', operator: '>=', value: 365 },
      { type: 'flag', target: 'departed_us', operator: '==', value: true },
    ],
    consequences: [
      { type: 'status-change', target: 'barred-10-year', value: true },
      { type: 'stat-change', target: 'stress', value: 60 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'has_approved_waiver', operator: '==', value: true },
      { type: 'flag', target: 'i601a_approved', operator: '==', value: true },
    ],
    avoidanceHint: 'The I-601A waiver must be approved BEFORE departure. This is the only safe path.',
    severity: 'catastrophic',
    isRecoverable: true,
    recoveryPath: 'Wait 10 years or obtain a waiver proving extreme hardship to a USC/LPR spouse or parent.',
  },
  {
    id: 'trap_permanent_bar',
    name: 'Permanent Bar',
    description: 'If you reenter illegally after being unlawfully present for 1+ year and then departing, you face a permanent bar.',
    explanation: 'INA Section 212(a)(9)(C)(i)(I). This is the most severe penalty. No waiver is available until you wait 10 years OUTSIDE the U.S.',
    realWorldExample: 'Someone deported after unlawful presence, who then reenters without inspection, is permanently barred.',
    triggers: [
      { type: 'flag', target: 'previously_barred', operator: '==', value: true },
      { type: 'flag', target: 'entered_illegally_after_bar', operator: '==', value: true },
    ],
    consequences: [
      { type: 'status-change', target: 'permanent-bar', value: true },
      { type: 'stat-change', target: 'stress', value: 80 },
    ],
    severity: 'terminal',
    isRecoverable: false,
    recoveryPath: undefined,
  },
  {
    id: 'trap_1_year_asylum_deadline',
    name: '1-Year Asylum Filing Deadline',
    description: 'Asylum applications must generally be filed within 1 year of arrival in the U.S.',
    explanation: 'INA Section 208(a)(2)(B). Exceptions exist for changed or extraordinary circumstances, but they\'re difficult to prove.',
    realWorldExample: 'Fatima arrived in fear but didn\'t know about the asylum process. By the time she learned, it had been 14 months.',
    triggers: [
      { type: 'stat', target: 'monthsSinceArrival', operator: '>', value: 12 },
      { type: 'flag', target: 'asylum_filed', operator: 'not-exists', value: true },
      { type: 'flag', target: 'seeking_asylum', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'asylum_deadline_missed', value: true },
      { type: 'stat-change', target: 'stress', value: 35 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'asylum_filed', operator: '==', value: true },
    ],
    avoidanceHint: 'File for asylum as soon as possible after arrival. Don\'t wait.',
    severity: 'severe',
    isRecoverable: true,
    recoveryPath: 'Prove changed circumstances in your home country or extraordinary circumstances that prevented timely filing.',
  },
  {
    id: 'trap_visa_bulletin_regression',
    name: 'Visa Bulletin Regression',
    description: 'Priority dates can move backward, extending wait times by years.',
    explanation: 'When demand exceeds supply, USCIS can "regress" the visa bulletin, moving the cutoff date backward.',
    realWorldExample: 'David\'s priority date became current, but before he could file I-485, the bulletin regressed and he had to wait another 2 years.',
    triggers: [
      { type: 'flag', target: 'visa_bulletin_regressed', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'waiting_longer', value: true },
      { type: 'stat-change', target: 'stress', value: 30 },
    ],
    severity: 'moderate',
    isRecoverable: true,
    recoveryPath: 'Wait for the bulletin to advance again. Nothing can be done to speed it up.',
  },
  {
    id: 'trap_60_day_clock',
    name: 'H-1B 60-Day Grace Period',
    description: 'H-1B workers who are laid off have only 60 days to find a new sponsor or leave the country.',
    explanation: 'After employment ends, you have a 60-day grace period to transfer to a new employer, change status, or depart.',
    realWorldExample: 'David is laid off. In 60 days, he must find a new H-1B sponsor, file for a change of status, or leave his life behind.',
    triggers: [
      { type: 'flag', target: 'h1b_terminated', operator: '==', value: true },
      { type: 'stat', target: 'daysSinceTermination', operator: '>', value: 60 },
      { type: 'flag', target: 'found_new_sponsor', operator: 'not-exists', value: true },
    ],
    consequences: [
      { type: 'status-change', target: 'undocumented-overstay', value: true },
      { type: 'stat-change', target: 'stress', value: 50 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'new_h1b_filed', operator: '==', value: true },
      { type: 'flag', target: 'departed_us', operator: '==', value: true },
    ],
    avoidanceHint: 'Start job searching before any layoff rumors. H-1B transfer can be filed immediately with a new employer.',
    severity: 'severe',
    isRecoverable: true,
    recoveryPath: 'Find new sponsor quickly. Some change of status options (like F-1) may buy time.',
  },
  {
    id: 'trap_ar11_violation',
    name: 'Address Change Violation (AR-11)',
    description: 'Failure to report address changes within 10 days can be a deportable offense.',
    explanation: 'INA Section 265 requires all non-citizens to report address changes within 10 days. Few people know this.',
    realWorldExample: 'You move apartments and forget to update USCIS. Years later, this comes up as a violation during your citizenship interview.',
    triggers: [
      { type: 'flag', target: 'moved_addresses', operator: '==', value: true },
      { type: 'flag', target: 'ar11_filed', operator: 'not-exists', value: true },
      { type: 'stat', target: 'daysSinceMove', operator: '>', value: 10 },
    ],
    consequences: [
      { type: 'flag-set', target: 'ar11_violation', value: true },
      { type: 'stat-change', target: 'stress', value: 20 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'ar11_filed', operator: '==', value: true },
    ],
    avoidanceHint: 'File AR-11 online immediately after any move. It takes 5 minutes.',
    severity: 'moderate',
    isRecoverable: true,
    recoveryPath: 'File the AR-11 late and hope no one notices. Explain the delay if asked.',
  },
  {
    id: 'trap_public_charge',
    name: 'Public Charge Inadmissibility',
    description: 'Use of certain public benefits can be grounds for denial of status adjustment.',
    explanation: 'The public charge rule considers whether someone is likely to become primarily dependent on government benefits.',
    realWorldExample: 'Using food stamps during a temporary hardship is later used as evidence against your green card application.',
    triggers: [
      { type: 'flag', target: 'received_public_benefits', operator: '==', value: true },
      { type: 'flag', target: 'adjusting_status', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'public_charge_concern', value: true },
      { type: 'stat-change', target: 'stress', value: 25 },
    ],
    avoidanceConditions: [
      { type: 'finance', target: 'balance', operator: '>=', value: 10000 },
    ],
    avoidanceHint: 'Avoid non-exempt benefits if possible. Build savings to show financial stability.',
    severity: 'moderate',
    isRecoverable: true,
    recoveryPath: 'Strong Affidavit of Support, employment history, and assets can overcome public charge concerns.',
  },
  {
    id: 'trap_derivative_status_loss',
    name: 'Derivative Status Loss',
    description: 'Spouses and children in dependent visa status lose their status if the principal\'s status ends.',
    explanation: 'H-4, L-2, and other derivative statuses depend entirely on the principal. Divorce, death, or status change affects derivatives.',
    realWorldExample: 'Priya\'s H-4 status depends on David\'s H-1B. If David is laid off, Priya also loses status.',
    triggers: [
      { type: 'flag', target: 'principal_lost_status', operator: '==', value: true },
      { type: 'flag', target: 'is_derivative', operator: '==', value: true },
    ],
    consequences: [
      { type: 'status-change', target: 'undocumented-overstay', value: true },
      { type: 'stat-change', target: 'stress', value: 40 },
    ],
    severity: 'severe',
    isRecoverable: true,
    recoveryPath: 'Change to own status if eligible, or maintain status through principal\'s status.',
  },
  {
    id: 'trap_j1_requirement',
    name: 'J-1 Two-Year Home Residency Requirement',
    description: 'J-1 visa holders in certain categories must return home for 2 years before changing to H-1B or getting a green card.',
    explanation: 'If your J-1 was government-funded or on the skills list, you must live in your home country for 2 years before applying for H or L visas.',
    realWorldExample: 'A researcher on J-1 wants to stay permanently but discovers they must return home for 2 years first.',
    triggers: [
      { type: 'flag', target: 'j1_subject_to_requirement', operator: '==', value: true },
      { type: 'flag', target: 'attempting_status_change', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'j1_blocked', value: true },
      { type: 'stat-change', target: 'stress', value: 30 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'j1_waiver_approved', operator: '==', value: true },
    ],
    avoidanceHint: 'Apply for a J-1 waiver through State Department before attempting status change.',
    severity: 'severe',
    isRecoverable: true,
    recoveryPath: 'Obtain a waiver based on no objection letter, hardship, or persecution.',
  },
  {
    id: 'trap_priority_date_backlog',
    name: 'Priority Date Backlog (India EB-2/EB-3)',
    description: 'For Indian nationals in employment-based categories, the wait for a green card can exceed 40 years.',
    explanation: 'Per-country limits combined with high demand from India create multi-decade backlogs.',
    realWorldExample: 'David, a skilled software engineer from India, realizes his "fast track" EB-2 will take until he\'s 69.',
    triggers: [
      { type: 'flag', target: 'indian_national', operator: '==', value: true },
      { type: 'flag', target: 'eb2_or_eb3_filed', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'decades_long_wait', value: true },
      { type: 'stat-change', target: 'stress', value: 35 },
    ],
    severity: 'severe',
    isRecoverable: false,
    recoveryPath: undefined,
  },
  {
    id: 'trap_daca_uncertainty',
    name: 'DACA Policy Uncertainty',
    description: 'DACA provides no permanent protection and can be rescinded by administrative action.',
    explanation: 'DACA is a policy, not a law. It has survived multiple court challenges but remains precarious.',
    realWorldExample: 'Maria renews her DACA every 2 years, never knowing if this will be the last time.',
    triggers: [
      { type: 'status', target: 'type', operator: '==', value: 'daca' },
      { type: 'flag', target: 'policy_change_announced', operator: '==', value: true },
    ],
    consequences: [
      { type: 'stat-change', target: 'stress', value: 40 },
      { type: 'flag-set', target: 'status_threatened', value: true },
    ],
    severity: 'severe',
    isRecoverable: false,
    recoveryPath: undefined,
  },
  {
    id: 'trap_ewi_catch22',
    name: 'Entry Without Inspection (EWI) Catch-22',
    description: 'Those who entered without inspection cannot adjust status inside the U.S., but leaving triggers the 10-year bar.',
    explanation: 'The law requires consular processing for EWI, but consular processing requires leaving, which triggers bars.',
    realWorldExample: 'Elena married a U.S. citizen but cannot become a resident because she crossed without papers at age 19.',
    triggers: [
      { type: 'flag', target: 'entered_without_inspection', operator: '==', value: true },
      { type: 'flag', target: 'married_to_usc', operator: '==', value: true },
    ],
    consequences: [
      { type: 'flag-set', target: 'ewi_trapped', value: true },
      { type: 'stat-change', target: 'stress', value: 35 },
    ],
    avoidanceConditions: [
      { type: 'flag', target: 'i601a_approved', operator: '==', value: true },
    ],
    avoidanceHint: 'The I-601A waiver is the only path. Approval rate is about 90%, but denial means the bar is triggered.',
    severity: 'catastrophic',
    isRecoverable: true,
    recoveryPath: 'Apply for I-601A waiver proving extreme hardship to USC/LPR spouse or parent.',
  },
]

// Helper function to check if a trap condition is triggered
export function checkTrapConditions(
  trap: PolicyTrap,
  gameState: {
    status?: string
    flags?: Record<string, boolean | number>
    stats?: Record<string, number>
  }
): boolean {
  if (!trap.triggers || trap.triggers.length === 0) return false

  return trap.triggers.every(condition => {
    // This is a simplified check - the full implementation would use the event engine's condition evaluator
    const { type, target, operator, value } = condition

    switch (type) {
      case 'flag':
        const flagValue = gameState.flags?.[target]
        if (operator === '==') return flagValue === value
        if (operator === 'not-exists') return flagValue === undefined
        return false

      case 'stat':
        const statValue = gameState.stats?.[target] || 0
        if (operator === '>=') return statValue >= (value as number)
        if (operator === '<') return statValue < (value as number)
        if (operator === '>') return statValue > (value as number)
        return false

      case 'status':
        return gameState.status === value

      default:
        return false
    }
  })
}

// Get traps by severity
export function getTrapsBySeverity(severity: TrapSeverity): PolicyTrap[] {
  return POLICY_TRAPS.filter(trap => trap.severity === severity)
}

// Get traps that could affect a specific status
export function getTrapsForStatus(status: string): PolicyTrap[] {
  return POLICY_TRAPS.filter(trap =>
    trap.triggers?.some(t =>
      (t.type === 'status' && t.value === status) ||
      (t.type === 'flag' && t.target.includes(status))
    )
  )
}
