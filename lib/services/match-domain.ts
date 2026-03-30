import type { Match } from '@/types/match'
import { MATCH_ERROR_CODES } from './match-errors'

const DEFAULT_HOST_MATCH_DURATION_MS = 2 * 60 * 60 * 1000

const getScheduleRangeMs = (startAt: string, endAt?: string) => {
  const start = new Date(startAt).getTime()
  if (Number.isNaN(start)) {
    throw new Error(MATCH_ERROR_CODES.invalidStartAt)
  }
  const end = endAt ? new Date(endAt).getTime() : start + DEFAULT_HOST_MATCH_DURATION_MS
  if (Number.isNaN(end)) {
    throw new Error(MATCH_ERROR_CODES.invalidEndAt)
  }
  if (end <= start) {
    throw new Error(MATCH_ERROR_CODES.invalidRange)
  }
  return { start, end }
}

const getMatchScheduleRangeMs = (m: Match) => getScheduleRangeMs(m.startAt, m.endAt)

const scheduleRangesOverlap = (
  a: { start: number; end: number },
  b: { start: number; end: number }
) => a.start < b.end && b.start < a.end

const isHostScheduleBlocker = (m: Match) => m.status !== 'CANCELLED' && m.status !== 'ENDED'

export const assertHostScheduleNoOverlapInMatches = (
  hostedMatches: Match[],
  startAt: string,
  endAt: string | undefined,
  excludeMatchId?: string
) => {
  const newRange = getScheduleRangeMs(startAt, endAt)
  for (const m of hostedMatches) {
    if (excludeMatchId && m.id === excludeMatchId) continue
    if (!isHostScheduleBlocker(m)) continue
    const existing = getMatchScheduleRangeMs(m)
    if (scheduleRangesOverlap(newRange, existing)) {
      throw new Error(MATCH_ERROR_CODES.hostScheduleOverlap)
    }
  }
}
