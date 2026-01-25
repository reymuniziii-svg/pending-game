import { create } from 'zustand'
import type {
  Application,
  FormType,
  FormOutcomeType,
  RFE,
  GameDate,
  PendingFee,
} from '@/types'
import { generateId, generateReceiptNumber, addMonths } from '@/lib/utils'

// Form data with real costs and processing times
export const FORM_DATA: Record<FormType, {
  name: string
  filingFee: number
  biometricsFee: number
  avgProcessingMonths: number
  processingRange: [number, number]
}> = {
  'i-130': { name: 'Petition for Alien Relative', filingFee: 625, biometricsFee: 0, avgProcessingMonths: 12, processingRange: [6, 24] },
  'i-485': { name: 'Adjustment of Status', filingFee: 1225, biometricsFee: 85, avgProcessingMonths: 18, processingRange: [12, 36] },
  'i-765': { name: 'Employment Authorization', filingFee: 410, biometricsFee: 0, avgProcessingMonths: 5, processingRange: [3, 7] },
  'i-131': { name: 'Travel Document', filingFee: 630, biometricsFee: 0, avgProcessingMonths: 5, processingRange: [3, 7] },
  'i-821d': { name: 'DACA Request', filingFee: 495, biometricsFee: 0, avgProcessingMonths: 6, processingRange: [4, 8] },
  'i-589': { name: 'Asylum Application', filingFee: 0, biometricsFee: 0, avgProcessingMonths: 48, processingRange: [36, 72] },
  'i-360': { name: 'VAWA Self-Petition', filingFee: 0, biometricsFee: 0, avgProcessingMonths: 18, processingRange: [12, 24] },
  'i-601a': { name: 'Provisional Waiver', filingFee: 630, biometricsFee: 85, avgProcessingMonths: 12, processingRange: [6, 24] },
  'i-751': { name: 'Remove Conditions', filingFee: 595, biometricsFee: 85, avgProcessingMonths: 18, processingRange: [12, 24] },
  'i-90': { name: 'Green Card Renewal', filingFee: 540, biometricsFee: 85, avgProcessingMonths: 8, processingRange: [6, 12] },
  'n-400': { name: 'Naturalization', filingFee: 760, biometricsFee: 85, avgProcessingMonths: 12, processingRange: [8, 14] },
  'ds-160': { name: 'Nonimmigrant Visa', filingFee: 185, biometricsFee: 0, avgProcessingMonths: 2, processingRange: [1, 6] },
  'ds-260': { name: 'Immigrant Visa', filingFee: 325, biometricsFee: 0, avgProcessingMonths: 6, processingRange: [3, 12] },
  'i-140': { name: 'Immigrant Petition', filingFee: 715, biometricsFee: 0, avgProcessingMonths: 6, processingRange: [4, 12] },
  'i-129': { name: 'H-1B Petition', filingFee: 780, biometricsFee: 0, avgProcessingMonths: 4, processingRange: [2, 8] },
  'i-539': { name: 'Change of Status', filingFee: 400, biometricsFee: 85, avgProcessingMonths: 6, processingRange: [4, 10] },
}

interface FormState {
  // Active applications
  activeApplications: Application[]

  // Completed
  approvedApplications: Application[]
  deniedApplications: Application[]
  withdrawnApplications: Application[]

  // Actions
  fileApplication: (formId: FormType, filedDate: GameDate) => Application
  respondToRFE: (applicationId: string, responseDate: GameDate) => void
  processApplicationDecision: (applicationId: string, outcome: FormOutcomeType, reason: string, date: GameDate) => void
  withdrawApplication: (applicationId: string, date: GameDate) => void
  issueRFE: (applicationId: string, rfe: Omit<RFE, 'id' | 'applicationId' | 'responded'>) => void
  scheduleInterview: (applicationId: string, date: GameDate, location: string) => void
  getApplication: (applicationId: string) => Application | undefined
  getActiveApplicationsForForm: (formId: FormType) => Application[]
  processMonthlyApplications: (currentDate: GameDate) => Array<{ applicationId: string; outcome: FormOutcomeType }>
  getTotalFees: (formId: FormType) => number
  reset: () => void
}

const initialState = {
  activeApplications: [],
  approvedApplications: [],
  deniedApplications: [],
  withdrawnApplications: [],
}

export const useFormStore = create<FormState>((set, get) => ({
  ...initialState,

  fileApplication: (formId, filedDate) => {
    const formData = FORM_DATA[formId]
    const processingMonths = formData.avgProcessingMonths +
      Math.floor(Math.random() * (formData.processingRange[1] - formData.processingRange[0]))

    const application: Application = {
      id: generateId(),
      formId,
      filedDate,
      receiptNumber: generateReceiptNumber(),
      status: 'pending',
      estimatedDecisionDate: addMonths(filedDate, processingMonths),
      feesPaid: formData.filingFee + formData.biometricsFee,
      legalFeesPaid: 0,
    }

    set((state) => ({
      activeApplications: [...state.activeApplications, application],
    }))

    return application
  },

  respondToRFE: (applicationId, responseDate) => set((state) => ({
    activeApplications: state.activeApplications.map(app => {
      if (app.id !== applicationId || !app.rfe) return app
      return {
        ...app,
        status: 'rfe-responded' as const,
        rfe: { ...app.rfe, responded: true, responseDate },
      }
    }),
  })),

  processApplicationDecision: (applicationId, outcome, reason, date) => set((state) => {
    const app = state.activeApplications.find(a => a.id === applicationId)
    if (!app) return state

    const updatedApp: Application = {
      ...app,
      status: outcome === 'approved' ? 'approved' : 'denied',
      decision: outcome,
      decisionReason: reason,
      actualDecisionDate: date,
    }

    const newActive = state.activeApplications.filter(a => a.id !== applicationId)

    if (outcome === 'approved') {
      return {
        activeApplications: newActive,
        approvedApplications: [...state.approvedApplications, updatedApp],
      }
    } else {
      return {
        activeApplications: newActive,
        deniedApplications: [...state.deniedApplications, updatedApp],
      }
    }
  }),

  withdrawApplication: (applicationId, date) => set((state) => {
    const app = state.activeApplications.find(a => a.id === applicationId)
    if (!app) return state

    return {
      activeApplications: state.activeApplications.filter(a => a.id !== applicationId),
      withdrawnApplications: [...state.withdrawnApplications, {
        ...app,
        status: 'withdrawn' as const,
        actualDecisionDate: date,
      }],
    }
  }),

  issueRFE: (applicationId, rfe) => set((state) => ({
    activeApplications: state.activeApplications.map(app => {
      if (app.id !== applicationId) return app
      return {
        ...app,
        status: 'rfe-issued' as const,
        rfe: { ...rfe, id: generateId(), applicationId, responded: false },
      }
    }),
  })),

  scheduleInterview: (applicationId, date, location) => set((state) => ({
    activeApplications: state.activeApplications.map(app => {
      if (app.id !== applicationId) return app
      return {
        ...app,
        status: 'interview-scheduled' as const,
        interviewDate: date,
        interviewLocation: location,
      }
    }),
  })),

  getApplication: (applicationId) => {
    const state = get()
    return state.activeApplications.find(a => a.id === applicationId) ||
           state.approvedApplications.find(a => a.id === applicationId) ||
           state.deniedApplications.find(a => a.id === applicationId)
  },

  getActiveApplicationsForForm: (formId) => {
    return get().activeApplications.filter(a => a.formId === formId)
  },

  processMonthlyApplications: (currentDate) => {
    const state = get()
    const decisions: Array<{ applicationId: string; outcome: FormOutcomeType }> = []

    // Check for applications that should have decisions
    for (const app of state.activeApplications) {
      // Skip if estimated decision is in the future
      if (app.estimatedDecisionDate.year > currentDate.year ||
          (app.estimatedDecisionDate.year === currentDate.year &&
           app.estimatedDecisionDate.month > currentDate.month)) {
        continue
      }

      // Random chance of decision this month (increases as time passes)
      const monthsPastEstimate = (currentDate.year - app.estimatedDecisionDate.year) * 12 +
                                  (currentDate.month - app.estimatedDecisionDate.month)
      const decisionChance = Math.min(0.3 + monthsPastEstimate * 0.1, 0.8)

      if (Math.random() < decisionChance) {
        // Determine outcome (simplified - base rate + RFE response consideration)
        const baseApprovalRate = 0.75
        const hasRespondedToRFE = app.rfe?.responded ?? true
        const approvalRate = hasRespondedToRFE ? baseApprovalRate : baseApprovalRate * 0.5

        const outcome: FormOutcomeType = Math.random() < approvalRate ? 'approved' : 'denied'
        decisions.push({ applicationId: app.id, outcome })
      }
    }

    return decisions
  },

  getTotalFees: (formId) => {
    const formData = FORM_DATA[formId]
    return formData.filingFee + formData.biometricsFee
  },

  reset: () => set(initialState),
}))
