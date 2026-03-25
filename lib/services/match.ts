import { del, get, post, put } from './client'
import { ensureMatchesSeeded, patchStoredMatch, upsertStoredMatch } from '@/lib/match-local-matches-store'
import type {
  CreateMatchRequest,
  Match,
  MatchApplication,
  MatchListParams,
  UpdateMatchStatusRequest,
} from '@/types/match'
import {
  getStoredApplicationsByMatchId,
  updateStoredApplicationStatus,
  upsertStoredApplication,
} from '@/lib/match-local-store'
import { getMatchCourtById } from '@/lib/match-courts'
import { pushNotification } from '@/lib/local-notifications'

const isBrowser = (): boolean => typeof window !== 'undefined'

const getLocalUser = () => {
  if (!isBrowser()) return { userId: 'local-user', userName: '내 계정' }

  // 기존 appData 구조가 남아있는 경우 활용
  const raw = localStorage.getItem('teamup_app_data')
  if (!raw) return { userId: 'local-user', userName: '내 계정' }

  try {
    const parsed = JSON.parse(raw) as {
      user?: { id?: string; nickname?: string; name?: string }
    }
    const id = parsed.user?.id ? String(parsed.user.id) : 'local-user'
    const name = parsed.user?.nickname || parsed.user?.name || '내 계정'
    return { userId: id, userName: name }
  } catch {
    return { userId: 'local-user', userName: '내 계정' }
  }
}

const recalcMatchCounts = (match: Match): Match => {
  const apps = getStoredApplicationsByMatchId(match.id)
  const pendingCount = apps.filter((a) => a.status === 'PENDING_DEPOSIT').length
  const confirmedCount = apps.filter((a) => a.status === 'CONFIRMED').length

  const nextStatus: Match['status'] =
    match.status === 'CANCELLED' || match.status === 'ENDED'
      ? match.status
      : confirmedCount >= match.capacity
        ? 'FULL'
        : 'RECRUITING'

  return patchStoredMatch(match.id, {
    pendingCount,
    confirmedCount,
    status: nextStatus,
  })
}

const listMatchesLocal = (params?: MatchListParams): Match[] => {
  const matches = ensureMatchesSeeded()
  if (!params) return matches

  return matches.filter((m) => {
    if (params.status && m.status !== params.status) return false
    if (params.level && params.level !== m.level) return false
    // from/to는 아직 프론트 필터 로직이 있으므로 일단 무시
    return true
  })
}

const getMatchLocal = (matchId: string): Match => {
  const matches = ensureMatchesSeeded()
  const found = matches.find((m) => m.id === matchId)
  if (!found) throw new Error(`Match not found: ${matchId}`)
  return found
}

const getApplicationsLocal = (matchId: string): MatchApplication[] => {
  return getStoredApplicationsByMatchId(matchId)
}

const applyToMatchLocal = (matchId: string): MatchApplication => {
  const match = getMatchLocal(matchId)
  if (match.status !== 'RECRUITING') {
    throw new Error('Match not recruiting')
  }

  const { userId, userName } = getLocalUser()

  // 이미 신청한 경우: 중복 신청 방지
  const existing = getStoredApplicationsByMatchId(matchId).find(
    (a) => a.userId === userId && (a.status === 'PENDING_DEPOSIT' || a.status === 'CONFIRMED')
  )
  if (existing) {
    return existing
  }

  const application: MatchApplication = {
    id: `app-${Date.now()}`,
    matchId,
    userId,
    userName,
    status: 'PENDING_DEPOSIT',
    requestedAt: new Date().toISOString(),
  }

  upsertStoredApplication(application)
  const updatedMatch = recalcMatchCounts(match)
  void updatedMatch
  pushNotification({
    type: 'MATCH_APPLIED',
    actor: 'USER',
    title: '참가 신청 완료',
    message: `${match.title} 매치 신청이 접수되었습니다. 입금 후 승인 대기 상태입니다.`,
    meta: {
      matchId: match.id,
      matchTitle: match.title,
      applicationId: application.id,
      userId,
      userName,
    },
  })
  return application
}

const cancelApplicationLocal = (matchId: string, applicationId: string): void => {
  const applications = getStoredApplicationsByMatchId(matchId)
  const found = applications.find((a) => a.id === applicationId)
  if (!found) throw new Error('Application not found')

  updateStoredApplicationStatus(applicationId, 'CANCELLED')

  const match = getMatchLocal(matchId)
  recalcMatchCounts(match)
}

const listApplicationsLocal = (matchId: string): MatchApplication[] => {
  return getApplicationsLocal(matchId)
}

const confirmApplicationLocal = (matchId: string, applicationId: string): MatchApplication => {
  const match = getMatchLocal(matchId)
  if (match.status !== 'RECRUITING' && match.status !== 'FULL') {
    // 취소/종료면 확정 불가
  }

  updateStoredApplicationStatus(applicationId, 'CONFIRMED')
  recalcMatchCounts(match)

  const apps = getStoredApplicationsByMatchId(matchId)
  const updated = apps.find((a) => a.id === applicationId)
  if (!updated) throw new Error('Application not found after confirm')
  return updated
}

const refundApplicationLocal = (matchId: string, applicationId: string): MatchApplication => {
  const match = getMatchLocal(matchId)
  const applications = getStoredApplicationsByMatchId(matchId)
  const target = applications.find((a) => a.id === applicationId)
  updateStoredApplicationStatus(applicationId, 'REFUNDED')
  recalcMatchCounts(match)

  const apps = getStoredApplicationsByMatchId(matchId)
  const updated = apps.find((a) => a.id === applicationId)
  if (!updated) throw new Error('Application not found after refund')

  pushNotification({
    type: 'REFUND_COMPLETED',
    actor: 'HOST',
    title: '환불 처리 완료',
    message: `${match.title} 매치 환불 처리가 완료되었습니다.`,
    meta: {
      matchId: match.id,
      matchTitle: match.title,
      applicationId: updated.id,
      userId: target?.userId,
      userName: target?.userName,
    },
  })
  return updated
}

const createMatchLocal = (data: CreateMatchRequest): Match => {
  const court = getMatchCourtById(data.courtId)
  if (!court) {
    throw new Error(`Court not found: ${data.courtId}`)
  }

  const now = new Date().toISOString()
  const match: Match = {
    id: `match-${Date.now()}`,
    title: data.title,
    startAt: data.startAt,
    endAt: data.endAt,
    court,
    fee: data.fee,
    capacity: data.capacity,
    confirmedCount: 0,
    pendingCount: 0,
    level: data.level,
    status: 'RECRUITING',
    cancellationPolicy: data.cancellationPolicy,
    notes: data.notes,
    hostId: 'host-local',
    hostName: 'TeamUp 운영팀',
    depositAccount: data.depositAccount,
    createdAt: now,
    updatedAt: now,
  }

  upsertStoredMatch(match)
  return match
}

const updateMatchStatusLocal = (matchId: string, data: UpdateMatchStatusRequest): Match => {
  const match = getMatchLocal(matchId)
  const updated = patchStoredMatch(match.id, { status: data.status })
  if (data.status === 'CANCELLED') {
    pushNotification({
      type: 'MATCH_CANCELLED',
      actor: 'HOST',
      title: '매치가 취소되었습니다',
      message: `${updated.title} 매치가 운영 정책에 따라 취소되었습니다.`,
      meta: {
        matchId: updated.id,
        matchTitle: updated.title,
      },
    })
  }
  return updated
}

const buildMatchListQuery = (params?: MatchListParams): string => {
  if (!params) return ''

  const query = new URLSearchParams()
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.status) query.set('status', params.status)
  if (params.level) query.set('level', params.level)

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const matchService = {
  // 참가자용: 매치 목록 조회
  listMatches: async (params?: MatchListParams): Promise<Match[]> => {
    try {
      return get<Match[]>(`/api/matches${buildMatchListQuery(params)}`)
    } catch {
      return listMatchesLocal(params)
    }
  },

  // 참가자용: 매치 상세 조회
  getMatch: async (matchId: string): Promise<Match> => {
    try {
      return get<Match>(`/api/matches/${matchId}`)
    } catch {
      return getMatchLocal(matchId)
    }
  },

  // 참가자용: 매치 신청(입금 대기)
  applyToMatch: async (matchId: string): Promise<MatchApplication> => {
    try {
      return post<MatchApplication>(`/api/matches/${matchId}/applications`)
    } catch {
      return applyToMatchLocal(matchId)
    }
  },

  // 참가자용: 신청 취소
  cancelApplication: async (matchId: string, applicationId: string): Promise<void> => {
    try {
      return del<void>(`/api/matches/${matchId}/applications/${applicationId}`)
    } catch {
      return cancelApplicationLocal(matchId, applicationId)
    }
  },

  // 주최자용: 매치 생성
  createMatch: async (data: CreateMatchRequest): Promise<Match> => {
    try {
      return post<Match>('/api/matches', data)
    } catch {
      return createMatchLocal(data)
    }
  },

  // 주최자용: 신청자 목록 조회
  listApplications: async (matchId: string): Promise<MatchApplication[]> => {
    try {
      return get<MatchApplication[]>(`/api/matches/${matchId}/applications`)
    } catch {
      return listApplicationsLocal(matchId)
    }
  },

  // 주최자용: 입금 확인 후 참가 확정
  confirmApplication: async (matchId: string, applicationId: string): Promise<MatchApplication> => {
    try {
      return put<MatchApplication>(
        `/api/matches/${matchId}/applications/${applicationId}/confirm`
      )
    } catch {
      return confirmApplicationLocal(matchId, applicationId)
    }
  },

  // 주최자용: 환불 처리 완료
  refundApplication: async (matchId: string, applicationId: string): Promise<MatchApplication> => {
    try {
      return put<MatchApplication>(`/api/matches/${matchId}/applications/${applicationId}/refund`)
    } catch {
      return refundApplicationLocal(matchId, applicationId)
    }
  },

  // 주최자용: 상태 변경(마감/취소/종료)
  updateMatchStatus: async (matchId: string, data: UpdateMatchStatusRequest): Promise<Match> => {
    try {
      return put<Match>(`/api/matches/${matchId}/status`, data)
    } catch {
      return updateMatchStatusLocal(matchId, data)
    }
  },
}

