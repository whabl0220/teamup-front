import { useMemo, useSyncExternalStore } from 'react'
import { getStoredApplicationsSnapshot, subscribeStoredApplications } from '@/lib/match-local-store'
import type { MatchApplication } from '@/types/match'

export const useStoredApplications = (): MatchApplication[] =>
  useSyncExternalStore(
    subscribeStoredApplications,
    getStoredApplicationsSnapshot,
    getStoredApplicationsSnapshot
  )

export const useStoredApplicationsByMatchId = (matchId?: string): MatchApplication[] => {
  const applications = useStoredApplications()
  return useMemo(
    () => (matchId ? applications.filter((app) => app.matchId === matchId) : []),
    [applications, matchId]
  )
}

export const useMyStoredApplications = (userId?: string): MatchApplication[] => {
  const applications = useStoredApplications()
  return useMemo(
    () => (userId ? applications.filter((app) => app.userId === userId) : []),
    [applications, userId]
  )
}
