import type { MatchApplication, MatchApplicationStatus } from '@/types/match'

const MATCH_APPLICATIONS_KEY = 'teamup_match_applications_v2'
const MATCH_APPLICATIONS_CHANGED_EVENT = 'teamup:match-applications-changed'
const EMPTY_APPLICATIONS: MatchApplication[] = []

let cachedRawApplications: string | null | undefined
let cachedParsedApplications: MatchApplication[] = EMPTY_APPLICATIONS

const notifyApplicationsChanged = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(MATCH_APPLICATIONS_CHANGED_EVENT))
}

export const getStoredApplications = (): MatchApplication[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(MATCH_APPLICATIONS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MatchApplication[]) : []
  } catch {
    return []
  }
}

export const getStoredApplicationsSnapshot = (): MatchApplication[] => {
  if (typeof window === 'undefined') return EMPTY_APPLICATIONS
  const raw = localStorage.getItem(MATCH_APPLICATIONS_KEY)
  if (raw === cachedRawApplications) {
    return cachedParsedApplications
  }

  cachedRawApplications = raw
  if (!raw) {
    cachedParsedApplications = EMPTY_APPLICATIONS
    return cachedParsedApplications
  }

  try {
    const parsed = JSON.parse(raw)
    cachedParsedApplications = Array.isArray(parsed) ? (parsed as MatchApplication[]) : EMPTY_APPLICATIONS
  } catch {
    cachedParsedApplications = EMPTY_APPLICATIONS
  }
  return cachedParsedApplications
}

export const setStoredApplications = (applications: MatchApplication[]) => {
  if (typeof window === 'undefined') return
  const raw = JSON.stringify(applications)
  localStorage.setItem(MATCH_APPLICATIONS_KEY, raw)
  cachedRawApplications = raw
  cachedParsedApplications = applications
  notifyApplicationsChanged()
}

export const getStoredApplicationsByMatchId = (matchId: string): MatchApplication[] =>
  getStoredApplications().filter((app) => app.matchId === matchId)

/**
 * 같은 매치·유저에 신청 이력이 여러 건일 때(취소 후 재신청 등), `.find()`로 첫 행만 고르면
 * 취소분이 먼저 와서 활성 신청을 놓칩니다. 입금 대기·확정 중 최신 건만 반환합니다.
 */
export const pickActiveApplicationForUserOnMatch = (
  applications: MatchApplication[],
  userId: string
): MatchApplication | null => {
  const latest = applications
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0]

  if (!latest) return null

  return latest.status === 'PENDING_DEPOSIT' || latest.status === 'CONFIRMED'
    ? latest
    : null
}

export const upsertStoredApplication = (application: MatchApplication) => {
  const applications = getStoredApplications()
  const next = applications.some((app) => app.id === application.id)
    ? applications.map((app) => (app.id === application.id ? application : app))
    : [...applications, application]
  setStoredApplications(next)
}

export const mergeStoredApplications = (applications: MatchApplication[]) => {
  if (applications.length === 0) return
  const current = getStoredApplications()
  const byId = new Map(current.map((app) => [app.id, app]))
  applications.forEach((app) => byId.set(app.id, app))
  setStoredApplications(Array.from(byId.values()))
}

export const updateStoredApplicationStatus = (
  applicationId: string,
  status: MatchApplicationStatus
) => {
  const now = new Date().toISOString()
  const next = getStoredApplications().map((app) => {
    if (app.id !== applicationId) return app
    return {
      ...app,
      status,
      confirmedAt: status === 'CONFIRMED' ? now : app.confirmedAt,
      cancelledAt: status === 'CANCELLED' ? now : app.cancelledAt,
      refundedAt: status === 'REFUNDED' ? now : app.refundedAt,
    }
  })
  setStoredApplications(next)
}

export const clearStoredApplications = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MATCH_APPLICATIONS_KEY)
  cachedRawApplications = null
  cachedParsedApplications = EMPTY_APPLICATIONS
  notifyApplicationsChanged()
}

export const subscribeStoredApplications = (onChange: () => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === MATCH_APPLICATIONS_KEY) onChange()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(MATCH_APPLICATIONS_CHANGED_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(MATCH_APPLICATIONS_CHANGED_EVENT, onChange)
  }
}

