import { isNetworkOrTimeoutError } from '@/lib/services/client'

export const getErrorMessage = (error: unknown, fallback = '알 수 없는 오류'): string =>
  error instanceof Error ? error.message : fallback

export const isRecoverableNetworkError = (error: unknown): boolean =>
  isNetworkOrTimeoutError(error)

export const isHostScheduleOverlapError = (error: unknown): boolean =>
  error instanceof Error && error.message === 'HOST_SCHEDULE_OVERLAP'

export const isSelfHostApplyForbiddenError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes('SELF_HOST_APPLY_FORBIDDEN')
