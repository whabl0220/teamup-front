import { isNetworkOrTimeoutError } from './client'
import type {
  CreateMatchRequest,
  Match,
  MatchApplication,
  MatchListParams,
  UpdateMatchRequest,
  UpdateMatchStatusRequest,
} from '@/types/match'
import { matchApi } from './match-api'
import {
  applyToMatchLocal,
  cancelApplicationLocal,
  confirmApplicationLocal,
  createMatchLocal,
  getLocalUser,
  getMatchLocal,
  listApplicationsLocal,
  listHostedMatchesFromLocal,
  listMatchesLocal,
  refundApplicationLocal,
  updateMatchLocal,
  updateMatchStatusLocal,
} from './match-local'
export { getLocalUser } from './match-local'

/** 종료 미입력 시 일정 겹침 판단용 기본 진행 시간(픽업 게임 가정) */
const DEFAULT_HOST_MATCH_DURATION_MS = 2 * 60 * 60 * 1000

const getScheduleRangeMs = (startAt: string, endAt?: string) => {
  const start = new Date(startAt).getTime()
  if (Number.isNaN(start)) {
    throw new Error('INVALID_START_AT')
  }
  const end = endAt ? new Date(endAt).getTime() : start + DEFAULT_HOST_MATCH_DURATION_MS
  if (Number.isNaN(end)) {
    throw new Error('INVALID_END_AT')
  }
  if (end <= start) {
    throw new Error('INVALID_RANGE')
  }
  return { start, end }
}

const getMatchScheduleRangeMs = (m: Match) => getScheduleRangeMs(m.startAt, m.endAt)

const scheduleRangesOverlap = (
  a: { start: number; end: number },
  b: { start: number; end: number }
) => a.start < b.end && b.start < a.end

/** 취소/종료된 경기는 일정 슬롯으로 보지 않음 */
const isHostScheduleBlocker = (m: Match) => m.status !== 'CANCELLED' && m.status !== 'ENDED'

const shouldFallbackToLocal = (error: unknown) => isNetworkOrTimeoutError(error)

/** listHostedMatches와 동일 병합(정렬 제외) — 일정 검증용 */
const fetchHostedMatchesMerged = async (): Promise<Match[]> => {
  const { userId } = getLocalUser()
  const localHosted = listHostedMatchesFromLocal()
  try {
    const remote = await matchApi.listMatches()
    const byId = new Map<string, Match>()
    for (const m of localHosted) {
      byId.set(m.id, m)
    }
    for (const m of remote) {
      if (m.hostId === userId) {
        byId.set(m.id, m)
      }
    }
    return Array.from(byId.values())
  } catch (error) {
    if (!shouldFallbackToLocal(error)) throw error
    return localHosted
  }
}

const assertHostScheduleNoOverlap = async (
  startAt: string,
  endAt: string | undefined,
  excludeMatchId?: string
) => {
  const newRange = getScheduleRangeMs(startAt, endAt)
  const hosted = await fetchHostedMatchesMerged()
  for (const m of hosted) {
    if (excludeMatchId && m.id === excludeMatchId) continue
    if (!isHostScheduleBlocker(m)) continue
    const existing = getMatchScheduleRangeMs(m)
    if (scheduleRangesOverlap(newRange, existing)) {
      throw new Error('HOST_SCHEDULE_OVERLAP')
    }
  }
}

export const matchService = {
  // 참가자용: 매치 목록 조회
  listMatches: async (params?: MatchListParams): Promise<Match[]> => {
    try {
      return await matchApi.listMatches(params)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return listMatchesLocal(params)
    }
  },

  // 참가자용: 매치 상세 조회
  getMatch: async (matchId: string): Promise<Match> => {
    try {
      return await matchApi.getMatch(matchId)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return getMatchLocal(matchId)
    }
  },

  // 참가자용: 매치 신청(입금 대기)
  applyToMatch: async (matchId: string): Promise<MatchApplication> => {
    try {
      const match = await matchService.getMatch(matchId)
      const { userId } = getLocalUser()
      if (match.hostId === userId) {
        throw new Error('SELF_HOST_APPLY_FORBIDDEN')
      }
      return await matchApi.applyToMatch(matchId)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return applyToMatchLocal(matchId)
    }
  },

  // 참가자용: 신청 취소
  cancelApplication: async (matchId: string, applicationId: string): Promise<void> => {
    try {
      return await matchApi.cancelApplication(matchId, applicationId)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return cancelApplicationLocal(matchId, applicationId)
    }
  },

  // 주최자용: 매치 생성
  createMatch: async (data: CreateMatchRequest): Promise<Match> => {
    await assertHostScheduleNoOverlap(data.startAt, data.endAt)
    try {
      return await matchApi.createMatch(data)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return createMatchLocal(data)
    }
  },

  // 주최자용: 내 매치 목록 조회 (로컬 전용 주최 + API 주최 병합, 동일 id는 API 우선)
  listHostedMatches: async (): Promise<Match[]> => {
    const merged = await fetchHostedMatchesMerged()
    return merged.sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    )
  },

  // 주최자용: 신청자 목록 조회
  listApplications: async (matchId: string): Promise<MatchApplication[]> => {
    try {
      return await matchApi.listApplications(matchId)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return listApplicationsLocal(matchId)
    }
  },

  // 주최자용: 입금 확인 후 참가 확정
  confirmApplication: async (matchId: string, applicationId: string): Promise<MatchApplication> => {
    try {
      return await matchApi.confirmApplication(matchId, applicationId)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return confirmApplicationLocal(matchId, applicationId)
    }
  },

  // 주최자용: 환불 처리 완료
  refundApplication: async (matchId: string, applicationId: string): Promise<MatchApplication> => {
    try {
      return await matchApi.refundApplication(matchId, applicationId)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return refundApplicationLocal(matchId, applicationId)
    }
  },

  // 주최자용: 상태 변경(마감/취소/종료)
  updateMatchStatus: async (matchId: string, data: UpdateMatchStatusRequest): Promise<Match> => {
    try {
      return await matchApi.updateMatchStatus(matchId, data)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return updateMatchStatusLocal(matchId, data)
    }
  },

  // 주최자용: 매치 수정
  updateMatch: async (matchId: string, data: UpdateMatchRequest): Promise<Match> => {
    await assertHostScheduleNoOverlap(data.startAt, data.endAt, matchId)
    try {
      return await matchApi.updateMatch(matchId, data)
    } catch (error) {
      if (!shouldFallbackToLocal(error)) throw error
      return updateMatchLocal(matchId, data)
    }
  },
}

