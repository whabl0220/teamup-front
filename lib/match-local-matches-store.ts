import type { Match } from '@/types/match'
import { mockMatches } from '@/lib/mock-matches'

const MATCHES_KEY = 'teamup_matches_v2'

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const isBrowser = (): boolean => typeof window !== 'undefined'

export const getStoredMatches = (): Match[] => {
  if (!isBrowser()) return mockMatches

  const parsed = safeParse<Match[]>(localStorage.getItem(MATCHES_KEY))
  if (!Array.isArray(parsed) || parsed.length === 0) return []
  return parsed
}

export const setStoredMatches = (matches: Match[]) => {
  if (!isBrowser()) return
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))
}

export const ensureMatchesSeeded = (): Match[] => {
  const existing = getStoredMatches()
  if (existing.length > 0) return existing

  setStoredMatches(mockMatches)
  return mockMatches
}

export const upsertStoredMatch = (next: Match): Match[] => {
  const matches = ensureMatchesSeeded()
  const exists = matches.some((m) => m.id === next.id)
  const updated = exists ? matches.map((m) => (m.id === next.id ? next : m)) : [...matches, next]
  setStoredMatches(updated)
  return updated
}

export const patchStoredMatch = (
  matchId: string,
  patch: Partial<Match>
): Match => {
  const matches = ensureMatchesSeeded()
  const found = matches.find((m) => m.id === matchId)
  if (!found) {
    throw new Error(`Match not found: ${matchId}`)
  }

  const updated: Match = {
    ...found,
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  const next = matches.map((m) => (m.id === matchId ? updated : m))
  setStoredMatches(next)
  return updated
}

export const clearStoredMatches = () => {
  if (!isBrowser()) return
  localStorage.removeItem(MATCHES_KEY)
}

