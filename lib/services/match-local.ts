import { ensureMatchesSeeded, patchStoredMatch, upsertStoredMatch } from '@/lib/match-local-matches-store'
import type {
  CreateMatchRequest,
  Match,
  MatchApplication,
  MatchListParams,
  UpdateMatchRequest,
  UpdateMatchStatusRequest,
} from '@/types/match'
import {
  getStoredApplicationsByMatchId,
  updateStoredApplicationStatus,
  upsertStoredApplication,
} from '@/lib/match-local-store'
import { getMatchCourtById } from '@/lib/match-courts'
import { pushNotification } from '@/lib/local-notifications'
import { MATCH_ERROR_CODES } from './match-errors'
import { getAuthIdentityFromToken } from './auth-identity'

const isBrowser = (): boolean => typeof window !== 'undefined'
const IDENTITY_KEY = 'teamup_identity_v1'

export const getLocalUser = () => {
  if (!isBrowser()) return { userId: 'local-user', userName: '내 계정' }
  try {
    const rawIdentity = localStorage.getItem(IDENTITY_KEY)
    if (rawIdentity) {
      const parsed = JSON.parse(rawIdentity) as { userId?: string; userName?: string }
      if (parsed.userId) {
        return {
          userId: parsed.userId,
          userName: parsed.userName || '내 계정',
        }
      }
    }
  } catch {
    // identity parse 실패 시 아래 fallback 로직으로 진행
  }

  const identity = getAuthIdentityFromToken()
  if (!identity) return { userId: 'local-user', userName: '내 계정' }
  return identity
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

export const listMatchesLocal = (params?: MatchListParams): Match[] => {
  const matches = ensureMatchesSeeded()
  if (!params) return matches

  return matches.filter((m) => {
    if (params.status && m.status !== params.status) return false
    if (params.level && params.level !== m.level) return false
    return true
  })
}

export const listHostedMatchesFromLocal = (): Match[] => {
  const { userId } = getLocalUser()
  return listMatchesLocal().filter((m) => m.hostId === userId)
}

export const getMatchLocal = (matchId: string): Match => {
  const matches = ensureMatchesSeeded()
  const found = matches.find((m) => m.id === matchId)
  if (!found) throw new Error(`Match not found: ${matchId}`)
  return found
}

const assertLocalHostAccess = (match: Match) => {
  const { userId } = getLocalUser()
  if (match.hostId !== userId) throw new Error(MATCH_ERROR_CODES.forbiddenHostAccess)
}

export const applyToMatchLocal = (matchId: string): MatchApplication => {
  const match = getMatchLocal(matchId)
  if (match.status !== 'RECRUITING') throw new Error('Match not recruiting')

  const { userId, userName } = getLocalUser()
  if (match.hostId === userId) throw new Error(MATCH_ERROR_CODES.selfHostApplyForbidden)

  const existing = getStoredApplicationsByMatchId(matchId).find(
    (a) => a.userId === userId && (a.status === 'PENDING_DEPOSIT' || a.status === 'CONFIRMED')
  )
  if (existing) return existing

  const application: MatchApplication = {
    id: `app-${Date.now()}`,
    matchId,
    userId,
    userName,
    status: 'PENDING_DEPOSIT',
    requestedAt: new Date().toISOString(),
  }

  upsertStoredApplication(application)
  recalcMatchCounts(match)
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

export const cancelApplicationLocal = (matchId: string, applicationId: string): void => {
  const applications = getStoredApplicationsByMatchId(matchId)
  const found = applications.find((a) => a.id === applicationId)
  if (!found) throw new Error('Application not found')
  const { userId } = getLocalUser()
  if (found.userId !== userId) throw new Error(MATCH_ERROR_CODES.forbiddenApplicationCancel)

  updateStoredApplicationStatus(applicationId, 'CANCELLED')
  recalcMatchCounts(getMatchLocal(matchId))
}

export const listApplicationsLocal = (matchId: string): MatchApplication[] => {
  const match = getMatchLocal(matchId)
  assertLocalHostAccess(match)
  return getStoredApplicationsByMatchId(matchId)
}

export const confirmApplicationLocal = (matchId: string, applicationId: string): MatchApplication => {
  const match = getMatchLocal(matchId)
  assertLocalHostAccess(match)
  const applications = getStoredApplicationsByMatchId(matchId)
  const target = applications.find((a) => a.id === applicationId)
  if (!target) throw new Error('Application not found')
  if (match.status === 'CANCELLED' || match.status === 'ENDED') throw new Error(MATCH_ERROR_CODES.matchNotRecruiting)
  if (target.status !== 'PENDING_DEPOSIT') throw new Error(MATCH_ERROR_CODES.invalidApplicationStatus)
  const confirmedCount = applications.filter((a) => a.status === 'CONFIRMED').length
  if (confirmedCount >= match.capacity) throw new Error(MATCH_ERROR_CODES.matchAlreadyFull)

  updateStoredApplicationStatus(applicationId, 'CONFIRMED')
  recalcMatchCounts(match)

  const updated = getStoredApplicationsByMatchId(matchId).find((a) => a.id === applicationId)
  if (!updated) throw new Error('Application not found after confirm')
  return updated
}

export const refundApplicationLocal = (matchId: string, applicationId: string): MatchApplication => {
  const match = getMatchLocal(matchId)
  assertLocalHostAccess(match)
  const applications = getStoredApplicationsByMatchId(matchId)
  const target = applications.find((a) => a.id === applicationId)
  if (!target) throw new Error('Application not found')

  updateStoredApplicationStatus(applicationId, 'REFUNDED')
  recalcMatchCounts(match)

  const updated = getStoredApplicationsByMatchId(matchId).find((a) => a.id === applicationId)
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
      userId: target.userId,
      userName: target.userName,
    },
  })
  return updated
}

export const createMatchLocal = (data: CreateMatchRequest): Match => {
  const court = getMatchCourtById(data.courtId)
  if (!court) throw new Error(`Court not found: ${data.courtId}`)

  const { userId, userName } = getLocalUser()
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
    hostId: userId,
    hostName: userName,
    depositAccount: data.depositAccount,
    createdAt: now,
    updatedAt: now,
  }

  upsertStoredMatch(match)
  return match
}

export const updateMatchStatusLocal = (matchId: string, data: UpdateMatchStatusRequest): Match => {
  const match = getMatchLocal(matchId)
  assertLocalHostAccess(match)
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

export const updateMatchLocal = (matchId: string, data: UpdateMatchRequest): Match => {
  const match = getMatchLocal(matchId)
  assertLocalHostAccess(match)
  const court = getMatchCourtById(data.courtId)
  if (!court) throw new Error(`Court not found: ${data.courtId}`)

  const updated = patchStoredMatch(matchId, {
    title: data.title,
    startAt: data.startAt,
    endAt: data.endAt,
    court,
    fee: data.fee,
    capacity: data.capacity,
    level: data.level,
    cancellationPolicy: data.cancellationPolicy,
    notes: data.notes,
    depositAccount: data.depositAccount,
  })
  return recalcMatchCounts(updated)
}
