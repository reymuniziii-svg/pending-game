import { create } from 'zustand'
import type {
  Transaction,
  RecurringExpense,
  PendingFee,
  MonthlyFinanceSummary,
  GameDate,
  ExpenseCategory,
} from '@/types'
import { generateId } from '@/lib/utils'

interface FinanceState {
  // Current balance
  bankBalance: number

  // Income
  monthlyIncome: number
  incomeSource: string

  // Expenses
  recurringExpenses: RecurringExpense[]

  // Immigration costs
  pendingFees: PendingFee[]
  paidFees: PendingFee[]

  // Debt
  totalDebt: number
  monthlyDebtPayment: number

  // History
  transactionHistory: Transaction[]
  monthlySummaries: MonthlyFinanceSummary[]

  // Cumulative tracking
  totalImmigrationSpending: number
  totalRemittancesSent: number
  peakBalance: number
  lowestBalance: number

  // Actions
  initialize: (
    balance: number,
    income: number,
    expenses: RecurringExpense[],
    debt: number
  ) => void
  setIncome: (amount: number, source: string) => void
  addRecurringExpense: (expense: RecurringExpense) => void
  removeRecurringExpense: (id: string) => void
  updateRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => void
  addPendingFee: (fee: Omit<PendingFee, 'id' | 'isPaid'>) => void
  payFee: (feeId: string, date: GameDate) => boolean
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  addIncome: (amount: number, description: string, date: GameDate) => void
  addExpense: (amount: number, description: string, category: ExpenseCategory, date: GameDate) => void
  sendRemittance: (amount: number, date: GameDate) => boolean
  processMonthEnd: (date: GameDate) => MonthlyFinanceSummary
  canAfford: (amount: number) => boolean
  getMonthlyNetIncome: () => number
  reset: () => void
}

const initialState = {
  bankBalance: 0,
  monthlyIncome: 0,
  incomeSource: '',
  recurringExpenses: [],
  pendingFees: [],
  paidFees: [],
  totalDebt: 0,
  monthlyDebtPayment: 0,
  transactionHistory: [],
  monthlySummaries: [],
  totalImmigrationSpending: 0,
  totalRemittancesSent: 0,
  peakBalance: 0,
  lowestBalance: 0,
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  ...initialState,

  initialize: (balance, income, expenses, debt) => set({
    bankBalance: balance,
    monthlyIncome: income,
    recurringExpenses: expenses,
    totalDebt: debt,
    monthlyDebtPayment: debt > 0 ? Math.min(debt * 0.02, 200) : 0, // 2% or $200/mo minimum
    peakBalance: balance,
    lowestBalance: balance,
  }),

  setIncome: (amount, source) => set({
    monthlyIncome: amount,
    incomeSource: source,
  }),

  addRecurringExpense: (expense) => set((state) => ({
    recurringExpenses: [...state.recurringExpenses, expense],
  })),

  removeRecurringExpense: (id) => set((state) => ({
    recurringExpenses: state.recurringExpenses.filter(e => e.id !== id),
  })),

  updateRecurringExpense: (id, updates) => set((state) => ({
    recurringExpenses: state.recurringExpenses.map(e =>
      e.id === id ? { ...e, ...updates } : e
    ),
  })),

  addPendingFee: (fee) => set((state) => ({
    pendingFees: [...state.pendingFees, { ...fee, id: generateId(), isPaid: false }],
  })),

  payFee: (feeId, date) => {
    const state = get()
    const fee = state.pendingFees.find(f => f.id === feeId)
    if (!fee) return false
    if (state.bankBalance < fee.amount) return false

    const transaction: Transaction = {
      id: generateId(),
      date,
      type: fee.type === 'legal' ? 'legal-fee' : 'immigration-fee',
      amount: -fee.amount,
      description: fee.description,
      category: fee.type === 'legal' ? 'legal' : 'immigration',
    }

    set({
      bankBalance: state.bankBalance - fee.amount,
      pendingFees: state.pendingFees.filter(f => f.id !== feeId),
      paidFees: [...state.paidFees, { ...fee, isPaid: true }],
      transactionHistory: [...state.transactionHistory, transaction],
      totalImmigrationSpending: state.totalImmigrationSpending + fee.amount,
      lowestBalance: Math.min(state.lowestBalance, state.bankBalance - fee.amount),
    })

    return true
  },

  addTransaction: (transaction) => set((state) => {
    const newTransaction = { ...transaction, id: generateId() }
    const newBalance = state.bankBalance + transaction.amount

    return {
      bankBalance: newBalance,
      transactionHistory: [...state.transactionHistory, newTransaction],
      peakBalance: Math.max(state.peakBalance, newBalance),
      lowestBalance: Math.min(state.lowestBalance, newBalance),
    }
  }),

  addIncome: (amount, description, date) => {
    get().addTransaction({
      date,
      type: 'income',
      amount,
      description,
      category: 'other',
    })
  },

  addExpense: (amount, description, category, date) => {
    get().addTransaction({
      date,
      type: 'expense',
      amount: -Math.abs(amount),
      description,
      category,
    })
  },

  sendRemittance: (amount, date) => {
    const state = get()
    if (state.bankBalance < amount) return false

    const transaction: Transaction = {
      id: generateId(),
      date,
      type: 'remittance',
      amount: -amount,
      description: 'Remittance to family',
      category: 'remittance',
    }

    set({
      bankBalance: state.bankBalance - amount,
      transactionHistory: [...state.transactionHistory, transaction],
      totalRemittancesSent: state.totalRemittancesSent + amount,
      lowestBalance: Math.min(state.lowestBalance, state.bankBalance - amount),
    })

    return true
  },

  processMonthEnd: (date) => {
    const state = get()

    // Calculate totals
    const totalExpenses = state.recurringExpenses.reduce((sum, e) => sum + e.amount, 0)
    const immigrationCosts = state.pendingFees
      .filter(f => f.dueDate && f.dueDate.month === date.month && f.dueDate.year === date.year)
      .reduce((sum, f) => sum + f.amount, 0)

    // Get remittances for this month
    const remittances = state.transactionHistory
      .filter(t =>
        t.type === 'remittance' &&
        t.date.month === date.month &&
        t.date.year === date.year
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Process income
    const incomeTransaction: Transaction = {
      id: generateId(),
      date,
      type: 'income',
      amount: state.monthlyIncome,
      description: `Monthly income - ${state.incomeSource || 'Employment'}`,
      category: 'other',
    }

    // Process expenses
    const expenseTransactions: Transaction[] = state.recurringExpenses.map(expense => ({
      id: generateId(),
      date,
      type: 'expense' as const,
      amount: -expense.amount,
      description: expense.name,
      category: expense.category,
    }))

    // Calculate net
    const netChange = state.monthlyIncome - totalExpenses - state.monthlyDebtPayment
    const newBalance = state.bankBalance + netChange

    // Update debt
    const newDebt = Math.max(0, state.totalDebt - state.monthlyDebtPayment)

    const summary: MonthlyFinanceSummary = {
      month: date.month,
      year: date.year,
      totalIncome: state.monthlyIncome,
      totalExpenses,
      immigrationCosts,
      remittances,
      netChange,
      endingBalance: newBalance,
    }

    set({
      bankBalance: newBalance,
      totalDebt: newDebt,
      transactionHistory: [...state.transactionHistory, incomeTransaction, ...expenseTransactions],
      monthlySummaries: [...state.monthlySummaries, summary],
      peakBalance: Math.max(state.peakBalance, newBalance),
      lowestBalance: Math.min(state.lowestBalance, newBalance),
    })

    return summary
  },

  canAfford: (amount) => get().bankBalance >= amount,

  getMonthlyNetIncome: () => {
    const state = get()
    const totalExpenses = state.recurringExpenses.reduce((sum, e) => sum + e.amount, 0)
    return state.monthlyIncome - totalExpenses - state.monthlyDebtPayment
  },

  reset: () => set(initialState),
}))
