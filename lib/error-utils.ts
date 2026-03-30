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
  if (error instanceof ApiError) return fallback
  if (error instanceof Error && isSafeUserFacingMessage(error.message)) return error.message.trim()
  return fallback
}

const isSafeUserFacingMessage = (message: string): boolean => {
  const trimmed = message.trim()
  if (!trimmed) return false

  // JSON/HTML/스택 트레이스/원시 코드성 메시지는 사용자에게 직접 노출하지 않는다.
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return false
  if (trimmed.includes('<!DOCTYPE') || trimmed.includes('<html')) return false
  if (trimmed.includes('\n')) return false
  if (/^\w+_[\w_]+$/.test(trimmed)) return false
  if (/([A-Z]{2,}_){1,}[A-Z]{2,}/.test(trimmed)) return false
  if (/(Exception|Stack|Trace|ECONN|SQLSTATE|SyntaxError|ReferenceError|TypeError)/i.test(trimmed)) {
    return false
  }

  return true
}
