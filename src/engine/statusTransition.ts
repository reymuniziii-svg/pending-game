import type {
  ImmigrationStatus,
  ImmigrationStatusType,
  WorkAuthorizationType,
} from '@/types'

const transitionMap: Partial<Record<ImmigrationStatusType, ImmigrationStatusType[]>> = {
  daca: ['daca', 'undocumented', 'i485-pending', 'removal-proceedings'],
  'h1b-active': ['h1b-active', 'h1b-pending', 'i485-pending', 'undocumented-overstay'],
  'h1b-pending': ['h1b-active', 'undocumented-overstay'],
  'asylum-pending': ['asylum-granted', 'removal-proceedings'],
  undocumented: ['undocumented', 'i130-pending', 'vawa-pending', 'i485-pending', 'removal-proceedings'],
  'undocumented-overstay': ['undocumented-overstay', 'removal-proceedings'],
  'i485-pending': ['green-card-conditional', 'green-card-permanent', 'removal-proceedings'],
  'green-card-conditional': ['green-card-permanent', 'removal-proceedings'],
  'green-card-permanent': ['naturalized-citizen', 'removal-proceedings'],
}

function getWorkAuthorizationType(statusType: ImmigrationStatusType): WorkAuthorizationType {
  if (
    statusType === 'naturalized-citizen' ||
    statusType === 'green-card-permanent' ||
    statusType === 'green-card-conditional'
  ) {
    return 'unrestricted'
  }

  if (statusType === 'h1b-active' || statusType === 'l1a-executive' || statusType === 'l1b-specialized') {
    return 'employer-specific'
  }

  if (
    statusType === 'daca' ||
    statusType === 'asylum-granted' ||
    statusType === 'refugee' ||
    statusType === 'i485-pending'
  ) {
    return 'ead'
  }

  if (statusType === 'student-f1-opt' || statusType === 'student-f1-stem-opt') {
    return 'limited'
  }

  return 'none'
}

function canTravel(statusType: ImmigrationStatusType): boolean {
  const blocked: ImmigrationStatusType[] = [
    'undocumented',
    'undocumented-overstay',
    'asylum-pending',
    'deportation-order',
    'removal-proceedings',
  ]

  return !blocked.includes(statusType)
}

export function getValidTransitions(fromStatus: ImmigrationStatusType): ImmigrationStatusType[] {
  return transitionMap[fromStatus] ?? []
}

export function isStatusTransitionAllowed(
  fromStatus: ImmigrationStatusType,
  toStatus: ImmigrationStatusType,
  validTransitions?: ImmigrationStatusType[]
): boolean {
  if (fromStatus === toStatus) {
    return true
  }

  if (validTransitions && validTransitions.length > 0) {
    return validTransitions.includes(toStatus)
  }

  const allowed = transitionMap[fromStatus] || []
  return allowed.includes(toStatus)
}

export function buildNextStatus(current: ImmigrationStatus, toStatus: ImmigrationStatusType): ImmigrationStatus {
  const workAuthorizationType = getWorkAuthorizationType(toStatus)

  return {
    ...current,
    type: toStatus,
    startDate: current.startDate,
    workAuthorized: workAuthorizationType !== 'none',
    workAuthorizationType,
    canTravel: canTravel(toStatus),
    hasEAD: workAuthorizationType === 'ead',
    inRemovalProceedings: toStatus === 'removal-proceedings' || toStatus === 'deportation-order',
    validTransitions: transitionMap[toStatus] || current.validTransitions,
  }
}
