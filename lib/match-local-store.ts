import type { MatchApplication, MatchApplicationStatus } from '@/types/match'

const MATCH_APPLICATIONS_KEY = 'teamup_match_applications_v2'

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

export const setStoredApplications = (applications: MatchApplication[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(MATCH_APPLICATIONS_KEY, JSON.stringify(applications))
}

export const getStoredApplicationsByMatchId = (matchId: string): MatchApplication[] =>
  getStoredApplications().filter((app) => app.matchId === matchId)

export const upsertStoredApplication = (application: MatchApplication) => {
  const applications = getStoredApplications()
  const next = applications.some((app) => app.id === application.id)
    ? applications.map((app) => (app.id === application.id ? application : app))
    : [...applications, application]
  setStoredApplications(next)
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
}

