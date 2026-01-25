import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { GameDate, RelationshipLevel, ImmigrationStatusType, MONTH_NAMES } from '@/types'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a GameDate for display
 */
export function formatDate(date: GameDate): string {
  const months = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[date.month]} ${date.year}`
}

/**
 * Format a GameDate as short string
 */
export function formatDateShort(date: GameDate): string {
  return `${date.month}/${date.year}`
}

/**
 * Calculate months between two dates
 */
export function monthsBetween(from: GameDate, to: GameDate): number {
  return (to.year - from.year) * 12 + (to.month - from.month)
}

/**
 * Add months to a date
 */
export function addMonths(date: GameDate, months: number): GameDate {
  let totalMonths = date.year * 12 + date.month + months
  const year = Math.floor((totalMonths - 1) / 12)
  const month = ((totalMonths - 1) % 12) + 1
  return { month, year }
}

/**
 * Check if date A is before date B
 */
export function isBefore(a: GameDate, b: GameDate): boolean {
  if (a.year !== b.year) return a.year < b.year
  return a.month < b.month
}

/**
 * Check if date A is after date B
 */
export function isAfter(a: GameDate, b: GameDate): boolean {
  if (a.year !== b.year) return a.year > b.year
  return a.month > b.month
}

/**
 * Check if two dates are equal
 */
export function isSameDate(a: GameDate, b: GameDate): boolean {
  return a.year === b.year && a.month === b.month
}

/**
 * Get relationship level label from numeric value
 */
export function getRelationshipLevel(value: number): RelationshipLevel {
  if (value <= -60) return 'hostile'
  if (value <= -20) return 'strained'
  if (value <= 19) return 'neutral'
  if (value <= 59) return 'friendly'
  if (value <= 89) return 'close'
  return 'devoted'
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format currency with sign for positive/negative
 */
export function formatCurrencyWithSign(amount: number): string {
  const formatted = formatCurrency(Math.abs(amount))
  if (amount > 0) return `+${formatted}`
  if (amount < 0) return `-${formatted}`
  return formatted
}

/**
 * Get human-readable status name
 */
export function getStatusDisplayName(status: ImmigrationStatusType): string {
  const names: Record<ImmigrationStatusType, string> = {
    'undocumented': 'Undocumented',
    'undocumented-overstay': 'Visa Overstay',
    'daca': 'DACA',
    'tps': 'Temporary Protected Status',
    'tourist-b1b2': 'Tourist Visa (B-1/B-2)',
    'student-f1': 'Student Visa (F-1)',
    'student-f1-opt': 'OPT',
    'student-f1-stem-opt': 'STEM OPT Extension',
    'h1b-pending': 'H-1B Pending',
    'h1b-active': 'H-1B',
    'h4-dependent': 'H-4 Dependent',
    'l1a-executive': 'L-1A Executive',
    'l1b-specialized': 'L-1B Specialized',
    'o1-extraordinary': 'O-1 Extraordinary Ability',
    'j1-exchange': 'J-1 Exchange Visitor',
    'k1-fiance': 'K-1 Fiancé(e)',
    'e2-investor': 'E-2 Treaty Investor',
    'asylum-pending': 'Asylum Pending',
    'asylum-granted': 'Asylee',
    'refugee': 'Refugee',
    'withholding-of-removal': 'Withholding of Removal',
    'i130-pending': 'Family Petition Pending',
    'i485-pending': 'Green Card Application Pending',
    'consular-processing': 'Consular Processing',
    'green-card-conditional': 'Conditional Green Card',
    'green-card-permanent': 'Permanent Resident',
    'naturalized-citizen': 'U.S. Citizen',
    'removal-proceedings': 'In Removal Proceedings',
    'deportation-order': 'Deportation Order',
    'voluntary-departure': 'Voluntary Departure',
    'deported': 'Deported',
    'vawa-pending': 'VAWA Pending',
    'sijs-pending': 'SIJS Pending',
  }
  return names[status] || status
}

/**
 * Get status color class
 */
export function getStatusColor(status: ImmigrationStatusType): string {
  if (status === 'naturalized-citizen') return 'text-success'
  if (status === 'green-card-permanent' || status === 'green-card-conditional') return 'text-success'
  if (status === 'deported' || status === 'deportation-order' || status === 'removal-proceedings') return 'text-danger'
  if (status === 'undocumented' || status === 'undocumented-overstay') return 'text-danger'
  if (status.includes('pending')) return 'text-warning'
  if (status === 'daca' || status === 'tps') return 'text-status-daca'
  if (status.includes('h1b') || status === 'h4-dependent') return 'text-status-h1b'
  if (status.includes('asylum') || status === 'refugee') return 'text-status-asylum'
  return 'text-foreground'
}

/**
 * Generate a simple unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * Generate a receipt number (mock)
 */
export function generateReceiptNumber(): string {
  const prefix = ['MSC', 'LIN', 'SRC', 'WAC', 'EAC'][Math.floor(Math.random() * 5)]
  const numbers = Math.floor(Math.random() * 9000000000 + 1000000000)
  return `${prefix}${numbers}`
}

/**
 * Weighted random selection
 */
export function weightedRandom<T extends { weight: number }>(items: T[]): T | null {
  if (items.length === 0) return null

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight === 0) return items[Math.floor(Math.random() * items.length)]

  let random = Math.random() * totalWeight
  for (const item of items) {
    random -= item.weight
    if (random <= 0) return item
  }

  return items[items.length - 1]
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Compute simple checksum for save data validation
 */
export function computeChecksum(data: object): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}
