import { del, get, post, put } from './client'
import type {
  CreateMatchRequest,
  Match,
  MatchApplication,
  MatchListParams,
  UpdateMatchStatusRequest,
} from '@/types/match'

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
    return get<Match[]>(`/api/matches${buildMatchListQuery(params)}`)
  },

  // 참가자용: 매치 상세 조회
  getMatch: async (matchId: string): Promise<Match> => {
    return get<Match>(`/api/matches/${matchId}`)
  },

  // 참가자용: 매치 신청(입금 대기)
  applyToMatch: async (matchId: string): Promise<MatchApplication> => {
    return post<MatchApplication>(`/api/matches/${matchId}/applications`)
  },

  // 참가자용: 신청 취소
  cancelApplication: async (matchId: string, applicationId: string): Promise<void> => {
    return del<void>(`/api/matches/${matchId}/applications/${applicationId}`)
  },

  // 주최자용: 매치 생성
  createMatch: async (data: CreateMatchRequest): Promise<Match> => {
    return post<Match>('/api/matches', data)
  },

  // 주최자용: 신청자 목록 조회
  listApplications: async (matchId: string): Promise<MatchApplication[]> => {
    return get<MatchApplication[]>(`/api/matches/${matchId}/applications`)
  },

  // 주최자용: 입금 확인 후 참가 확정
  confirmApplication: async (matchId: string, applicationId: string): Promise<MatchApplication> => {
    return put<MatchApplication>(`/api/matches/${matchId}/applications/${applicationId}/confirm`)
  },

  // 주최자용: 환불 처리 완료
  refundApplication: async (matchId: string, applicationId: string): Promise<MatchApplication> => {
    return put<MatchApplication>(`/api/matches/${matchId}/applications/${applicationId}/refund`)
  },

  // 주최자용: 상태 변경(마감/취소/종료)
  updateMatchStatus: async (matchId: string, data: UpdateMatchStatusRequest): Promise<Match> => {
    return put<Match>(`/api/matches/${matchId}/status`, data)
  },
}

