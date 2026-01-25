// ============ CORE TYPES ============

export type ScreenType =
  | 'title'
  | 'content-warning'
  | 'character-select'
  | 'opening'
  | 'game'
  | 'ending'

// ============ TIME ============

export interface GameDate {
  month: number  // 1-12
  year: number
}

export const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

// ============ IMMIGRATION STATUS ============

export type ImmigrationStatusType =
  // Undocumented / At-risk
  | 'undocumented'
  | 'undocumented-overstay'
  | 'daca'
  | 'tps'
  // Temporary statuses
  | 'tourist-b1b2'
  | 'student-f1'
  | 'student-f1-opt'
  | 'student-f1-stem-opt'
  | 'h1b-pending'
  | 'h1b-active'
  | 'h4-dependent'
  | 'l1a-executive'
  | 'l1b-specialized'
  | 'o1-extraordinary'
  | 'j1-exchange'
  | 'k1-fiance'
  | 'e2-investor'
  // Asylum/Refugee
  | 'asylum-pending'
  | 'asylum-granted'
  | 'refugee'
  | 'withholding-of-removal'
  // Family-based pending
  | 'i130-pending'
  | 'i485-pending'
  | 'consular-processing'
  // Permanent
  | 'green-card-conditional'
  | 'green-card-permanent'
  | 'naturalized-citizen'
  // Negative outcomes
  | 'removal-proceedings'
  | 'deportation-order'
  | 'voluntary-departure'
  | 'deported'
  // Special
  | 'vawa-pending'
  | 'sijs-pending'

export type WorkAuthorizationType =
  | 'unrestricted'
  | 'employer-specific'
  | 'ead'
  | 'limited'
  | 'none'

export interface ImmigrationStatus {
  type: ImmigrationStatusType
  startDate: GameDate
  expirationDate?: GameDate

  // Work authorization
  workAuthorized: boolean
  workAuthorizationType: WorkAuthorizationType
  employerName?: string  // For employer-specific

  // Travel restrictions
  canTravel: boolean
  advanceParoleRequired: boolean
  reentryRisk: 'none' | 'low' | 'medium' | 'high' | 'extreme'

  // Path forward
  validTransitions: ImmigrationStatusType[]

  // Risk flags
  inRemovalProceedings: boolean
  hasEAD: boolean
  hasAdvanceParole: boolean
  unlawfulPresenceDays: number
}

export interface StatusChange {
  fromStatus: ImmigrationStatusType
  toStatus: ImmigrationStatusType
  date: GameDate
  reason: string
  eventId?: string
}

// ============ CHARACTER ============

export interface CharacterProfile {
  id: string
  name: string
  age: number
  countryOfOrigin: string
  countryCode: string  // For flag icons
  nativeLanguage: string

  // Story
  tagline: string
  backstory: string
  motivations: string[]
  idealAmericaQuote: string

  // Starting conditions
  initialStatus: ImmigrationStatusType
  initialAge: number
  arrivalAge: number
  gameStartYear: number

  // Stats
  initialStats: CharacterStats
  initialFinances: InitialFinances
  initialRelationships: RelationshipData[]

  // Unique mechanics
  uniqueTraits: string[]
  profileEventIds: string[]

  // Difficulty indication
  difficulty: 'standard' | 'challenging' | 'brutal'
  difficultyReason: string

  // Opening sequence
  openingBeats: OpeningBeat[]

  // Possible endings
  possibleEndingIds: string[]
}

export interface CharacterStats {
  health: number           // 0-100
  stress: number           // 0-100
  englishProficiency: number  // 0-100
  communityConnection: number // 0-100
}

export interface InitialFinances {
  bankBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  debt: number
  hasHealthInsurance: boolean
}

export interface OpeningBeat {
  id: string
  title: string
  narrative: string
  choices?: OpeningChoice[]
  imageKey?: string
}

export interface OpeningChoice {
  id: string
  text: string
  response: string
}

// ============ EVENTS ============

export interface GameEvent {
  id: string

  // Display
  title: string
  description: string
  imageKey?: string

  // Timing
  timing: EventTiming

  // Conditions for triggering
  conditions: EventCondition[]

  // Weight for random selection (higher = more likely)
  weight: number

  // Character restrictions (empty = all characters)
  characterIds?: string[]

  // Status restrictions
  requiredStatuses?: ImmigrationStatusType[]
  excludedStatuses?: ImmigrationStatusType[]

  // Choices
  choices: EventChoice[]

  // Chain info
  chainId?: string
  chainPosition?: number
  isChainStart?: boolean

  // Tags for filtering
  tags: string[]

  // Flags
  isRepeatable: boolean
  isMandatory: boolean
  priority: number  // Higher = processed first
}

export interface EventTiming {
  type: 'immediate' | 'scheduled' | 'random' | 'triggered' | 'deadline'

  // For scheduled events
  month?: number
  year?: number

  // For random events
  earliestMonth?: number  // Months from game start
  latestMonth?: number

  // For triggered events
  triggerId?: string

  // For deadline events
  deadlineDate?: GameDate
}

export type ConditionOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in' | 'exists' | 'not-exists'

export interface EventCondition {
  type: 'status' | 'flag' | 'finance' | 'relationship' | 'stat' | 'date' | 'application' | 'character'

  // What to check
  target: string

  // Comparison
  operator: ConditionOperator
  value: string | number | boolean | string[]
}

export interface EventChoice {
  id: string
  text: string

  // Requirements to see this choice
  requirements?: EventCondition[]

  // Cost to select
  costs?: ChoiceCost[]

  // Results
  outcomes: EventOutcome[]

  // Narrative result
  outcomeText: string

  // Chain continuation
  nextEventId?: string

  // Visual
  isRecommended?: boolean
  isDangerous?: boolean
}

export interface ChoiceCost {
  type: 'money' | 'time' | 'relationship' | 'stat' | 'stress'
  target?: string
  amount: number
  description?: string
}

export type OutcomeType =
  | 'status-change'
  | 'flag-set'
  | 'flag-increment'
  | 'finance-add'
  | 'finance-subtract'
  | 'relationship-change'
  | 'stat-change'
  | 'trigger-event'
  | 'queue-event'
  | 'file-application'
  | 'application-decision'
  | 'trigger-trap'
  | 'add-document'
  | 'remove-document'
  | 'end-game'

export interface EventOutcome {
  type: OutcomeType
  target: string
  value?: string | number | boolean  // Optional - not all outcome types need value

  // For probabilistic outcomes
  probability?: number  // 0-1

  // For delayed outcomes
  delayMonths?: number
}

export interface EventChain {
  id: string
  name: string
  description: string
  eventIds: string[]
  currentPosition: number
  isInterruptible: boolean
  completionOutcomes?: EventOutcome[]
}

export interface CompletedEvent {
  eventId: string
  choiceId: string
  date: GameDate
  outcomes: EventOutcome[]
}

// ============ FORMS / APPLICATIONS ============

export type FormType =
  | 'i-130'      // Family petition
  | 'i-485'      // Adjustment of status
  | 'i-765'      // Work permit (EAD)
  | 'i-131'      // Travel document
  | 'i-821d'     // DACA
  | 'i-589'      // Asylum
  | 'i-360'      // VAWA self-petition
  | 'i-601a'     // Unlawful presence waiver
  | 'i-751'      // Remove conditions (marriage)
  | 'i-90'       // Green card renewal
  | 'n-400'      // Citizenship
  | 'ds-160'     // Visa application
  | 'ds-260'     // Immigrant visa
  | 'i-140'      // Employment petition
  | 'i-129'      // H-1B petition
  | 'i-539'      // Change of status

export interface ImmigrationForm {
  id: FormType
  formNumber: string
  officialName: string
  commonName: string

  // Purpose
  purpose: string

  // Requirements
  eligibleStatuses: ImmigrationStatusType[]
  requiredDocuments: string[]

  // Costs
  fee: number

  // Processing
  processingTimeMonths: {
    min: number
    typical: number
    max: number
  }

  // Outcomes
  possibleOutcomes: FormOutcomeType[]
  rfeCommonReasons: string[]
  denialReasons: string[]
  approvalLeadsTo: (ImmigrationStatusType | FormType)[]

  // Notes
  notes: string
}

export type FormOutcomeType =
  | 'approved'
  | 'denied'
  | 'rfe'
  | 'noid'
  | 'withdrawn'
  | 'interview-required'
  | 'referred-to-court'
  | 'administrative-processing'

export interface Application {
  id: string
  formId: FormType
  filedDate: GameDate
  receiptNumber: string

  status: 'pending' | 'rfe-issued' | 'rfe-responded' | 'interview-scheduled' | 'approved' | 'denied' | 'withdrawn'

  // Timeline
  estimatedDecisionDate: GameDate
  actualDecisionDate?: GameDate

  // Interview
  interviewDate?: GameDate
  interviewLocation?: string

  // RFE handling
  rfe?: RFE

  // Decision
  decision?: FormOutcomeType
  decisionReason?: string

  // Costs paid
  feesPaid: number
  legalFeesPaid: number
}

export interface RFE {
  id: string
  applicationId: string
  issuedDate: GameDate
  dueDate: GameDate
  requestedEvidence: string[]
  description: string
  responded: boolean
  responseDate?: GameDate
}

// ============ TRAPS ============

export type TrapSeverity = 'minor' | 'moderate' | 'severe' | 'catastrophic' | 'terminal'

export interface PolicyTrap {
  id: string
  name: string
  description: string

  // Educational content
  explanation: string
  realWorldExample: string

  // Trigger conditions
  triggers: EventCondition[]

  // Consequences
  consequences: EventOutcome[]

  // Can it be avoided?
  avoidanceConditions?: EventCondition[]
  avoidanceHint?: string

  // Severity
  severity: TrapSeverity

  // Recovery possible?
  isRecoverable: boolean
  recoveryPath?: string
}

// ============ RELATIONSHIPS ============

export type RelationshipType =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'partner'
  | 'friend'
  | 'employer'
  | 'coworker'
  | 'lawyer'
  | 'community-member'
  | 'official'

export interface RelationshipData {
  id: string
  name: string
  type: RelationshipType

  // Their status
  citizenshipStatus: 'usc' | 'lpr' | 'visa-holder' | 'undocumented' | 'abroad' | 'unknown'
  location: 'with-player' | 'same-city' | 'different-state' | 'abroad'

  // Relationship state
  level: number  // -100 to 100

  // Role in immigration
  isSponsor: boolean
  isPetitioner: boolean
  isDependent: boolean
  isDerivedFrom: boolean  // Status derived from this person

  // Additional info
  age?: number
  occupation?: string
  notes?: string
}

export type RelationshipLevel =
  | 'hostile'      // -100 to -60
  | 'strained'     // -59 to -20
  | 'neutral'      // -19 to 19
  | 'friendly'     // 20 to 59
  | 'close'        // 60 to 89
  | 'devoted'      // 90 to 100

export interface RelationshipChange {
  npcId: string
  previousLevel: number
  newLevel: number
  date: GameDate
  reason: string
}

// ============ FINANCES ============

export type TransactionType = 'income' | 'expense' | 'immigration-fee' | 'legal-fee' | 'remittance' | 'debt-payment' | 'gift' | 'emergency'

export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'healthcare'
  | 'childcare'
  | 'utilities'
  | 'insurance'
  | 'debt'
  | 'remittance'
  | 'immigration'
  | 'legal'
  | 'discretionary'
  | 'emergency'
  | 'other'

export interface Transaction {
  id: string
  date: GameDate
  type: TransactionType
  amount: number  // Positive for income, negative for expenses
  description: string
  category: ExpenseCategory
}

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  category: ExpenseCategory
  isRequired: boolean
  canReduce: boolean
  minimumAmount?: number
}

export interface PendingFee {
  id: string
  formId?: FormType
  type: 'filing' | 'biometrics' | 'legal' | 'expedite' | 'document' | 'translation'
  amount: number
  description: string
  dueDate?: GameDate
  isPaid: boolean
}

export interface MonthlyFinanceSummary {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  immigrationCosts: number
  remittances: number
  netChange: number
  endingBalance: number
}

// ============ DOCUMENTS ============

export interface Document {
  id: string
  name: string
  type: 'passport' | 'visa' | 'ead' | 'green-card' | 'birth-certificate' | 'marriage-certificate' | 'diploma' | 'tax-return' | 'pay-stub' | 'bank-statement' | 'letter' | 'court-order' | 'other'
  expirationDate?: GameDate
  isValid: boolean
  notes?: string
}

// ============ ENDINGS ============

export type EndingType =
  | 'citizenship'
  | 'green-card'
  | 'status-maintained'
  | 'still-waiting'
  | 'undocumented-rooted'
  | 'voluntary-departure'
  | 'deported'
  | 'returned-home'
  | 'died-waiting'

export interface Ending {
  id: string
  name: string
  type: EndingType

  // Trigger conditions
  triggerConditions: EventCondition[]

  // Or triggered by specific year
  triggerYear?: number

  // Display
  title: string
  subtitle: string
  description: string
  epilogue: string

  // Statistics to highlight
  statsToShow: string[]

  // Tone
  isPositive: boolean
  isNeutral: boolean
  isNegative: boolean
}

export interface GameEndState {
  endingId: string
  ending: Ending
  finalDate: GameDate
  statistics: GameStatistics
}

// ============ GAME STATISTICS ============

export interface GameStatistics {
  // Time
  totalMonthsPlayed: number
  yearsInUS: number

  // Status
  finalStatus: ImmigrationStatusType
  statusChanges: number

  // Financial
  totalEarned: number
  totalSpent: number
  totalImmigrationCosts: number
  totalLegalFees: number
  totalRemittances: number
  peakSavings: number
  lowestBalance: number

  // Applications
  applicationsField: number
  applicationsApproved: number
  applicationsDenied: number
  totalWaitingMonths: number

  // Life
  eventsExperienced: number
  decisionsMode: number
  trapsTriggered: number

  // Relationships
  relationshipsFormed: number
  familyEventsAbroad: number

  // Specific flags
  missedFunerals: number
  missedWeddings: number
  childrenBorn: number
}

// ============ SAVE DATA ============

export interface SaveData {
  version: string
  savedAt: string  // ISO date

  // Game meta
  gameId: string
  characterId: string
  playTimeMinutes: number

  // Time
  currentMonth: number
  currentYear: number
  totalMonthsElapsed: number

  // Character state
  characterState: {
    status: ImmigrationStatus
    statusHistory: StatusChange[]
    documents: Document[]
    stats: CharacterStats
    flags: Record<string, string | number | boolean>
  }

  // Finances
  financeState: {
    bankBalance: number
    monthlyIncome: number
    recurringExpenses: RecurringExpense[]
    pendingFees: PendingFee[]
    debt: number
    transactionHistory: Transaction[]
  }

  // Events
  eventState: {
    eventQueue: string[]
    completedEventIds: string[]
    activeChains: EventChain[]
    scheduledEvents: Array<{ eventId: string; date: GameDate }>
  }

  // Applications
  formState: {
    activeApplications: Application[]
    completedApplications: Application[]
  }

  // Relationships
  relationships: RelationshipData[]

  // Statistics
  statistics: GameStatistics

  // Checksum for validation
  checksum: string
}

export interface SaveSlot {
  slot: number
  isEmpty: boolean
  savedAt?: Date
  characterId?: string
  characterName?: string
  currentMonth?: number
  currentYear?: number
  status?: ImmigrationStatusType
  playTimeMinutes?: number
}

// ============ UI TYPES ============

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'danger' | 'success'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  eventId?: string
}

export interface YearSummary {
  year: number
  highlights: string[]
  lowlights: string[]
  statusAtYearEnd: ImmigrationStatusType
  financialSummary: MonthlyFinanceSummary
  relationshipChanges: RelationshipChange[]
  applicationsField: number
  applicationsResolved: number
  majorEvents: string[]
}
