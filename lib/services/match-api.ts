import { del, get, post, put } from './client'
import type {
  CreateMatchRequest,
  Match,
  MatchApplication,
  MatchListParams,
  UpdateMatchRequest,
  UpdateMatchStatusRequest,
} from '@/types/match'

export const buildMatchListQuery = (params?: MatchListParams): string => {
  if (!params) return ''

  const query = new URLSearchParams()
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.status) query.set('status', params.status)
  if (params.level) query.set('level', params.level)

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const matchApi = {
  listMatches: (params?: MatchListParams) => get<Match[]>(`/api/matches${buildMatchListQuery(params)}`),
  getMatch: (matchId: string) => get<Match>(`/api/matches/${matchId}`),
  applyToMatch: (matchId: string) => post<MatchApplication>(`/api/matches/${matchId}/applications`),
  cancelApplication: (matchId: string, applicationId: string) =>
    del<void>(`/api/matches/${matchId}/applications/${applicationId}`),
  createMatch: (data: CreateMatchRequest) => post<Match>('/api/matches', data),
  listApplications: (matchId: string) => get<MatchApplication[]>(`/api/matches/${matchId}/applications`),
  confirmApplication: (matchId: string, applicationId: string) =>
    put<MatchApplication>(`/api/matches/${matchId}/applications/${applicationId}/confirm`),
  refundApplication: (matchId: string, applicationId: string) =>
    put<MatchApplication>(`/api/matches/${matchId}/applications/${applicationId}/refund`),
  updateMatchStatus: (matchId: string, data: UpdateMatchStatusRequest) =>
    put<Match>(`/api/matches/${matchId}/status`, data),
  updateMatch: (matchId: string, data: UpdateMatchRequest) => put<Match>(`/api/matches/${matchId}`, data),
}
