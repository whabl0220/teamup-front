import { ApiError, isNetworkOrTimeoutError } from '@/lib/services/client'
import { MATCH_ERROR_CODES } from '@/lib/services/match-errors'

export const getErrorMessage = (error: unknown, fallback = '알 수 없는 오류'): string =>
  error instanceof Error ? error.message : fallback

export const isRecoverableNetworkError = (error: unknown): boolean =>
  isNetworkOrTimeoutError(error)

export const isHostScheduleOverlapError = (error: unknown): boolean =>
  error instanceof Error && error.message === MATCH_ERROR_CODES.hostScheduleOverlap

export const isSelfHostApplyForbiddenError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes(MATCH_ERROR_CODES.selfHostApplyForbidden)

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
