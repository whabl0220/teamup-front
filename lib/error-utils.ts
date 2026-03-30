import { ApiError, isNetworkOrTimeoutError } from '@/lib/services/client'

export const getErrorMessage = (error: unknown, fallback = '알 수 없는 오류'): string =>
  error instanceof Error ? error.message : fallback

export const isRecoverableNetworkError = (error: unknown): boolean =>
  isNetworkOrTimeoutError(error)

export const isHostScheduleOverlapError = (error: unknown): boolean =>
  error instanceof Error && error.message === 'HOST_SCHEDULE_OVERLAP'

export const isSelfHostApplyForbiddenError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes('SELF_HOST_APPLY_FORBIDDEN')

export const toUserErrorMessage = (
  error: unknown,
  options?: {
    fallback?: string
    networkMessage?: string
  }
): string => {
  const fallback = options?.fallback ?? '요청 처리 중 오류가 발생했습니다.'
  const networkMessage =
    options?.networkMessage ?? '네트워크 연결이 불안정합니다. 잠시 후 다시 시도해주세요.'

  if (isNetworkOrTimeoutError(error)) return networkMessage
  if (error instanceof ApiError && error.message.trim().length > 0) return error.message
  if (error instanceof Error && error.message.trim().length > 0) return error.message
  return fallback
}
