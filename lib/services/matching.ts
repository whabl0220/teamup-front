// 매칭 관련 API
import { get, post, put } from './client'
import type { Team } from '@/types'

export interface MatchRequest {
  id: string
  fromTeam: Team
  toTeam: Team
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  respondedAt?: string
}

export interface SendMatchRequest {
  toTeamId: string
  fromTeamId: string
  message: string
}

export const matchingService = {
  // ========== 실제 사용 API ==========

  // 받은 매칭 요청 조회
  getMatchRequests: async (): Promise<MatchRequest[]> => {
    return get<MatchRequest[]>('/api/match-requests/received')
  },

  // 매칭 요청 수락
  acceptMatchRequest: async (requestId: string): Promise<void> => {
    return put(`/api/match-requests/${requestId}/accept`)
  },

  // 매칭 요청 거절
  rejectMatchRequest: async (requestId: string): Promise<void> => {
    return put(`/api/match-requests/${requestId}/reject`)
  },

  // // 보낸 매칭 요청 조회
  // getSentMatchRequests: async (): Promise<MatchRequest[]> => {
  //   return get<MatchRequest[]>('/match-requests/sent')
  // },

  // // 매칭 요청 보내기
  // sendMatchRequest: async (data: SendMatchRequest): Promise<MatchRequest> => {
  //   return post<MatchRequest>('/match-requests', data)
  // },

  // // 매칭 요청 수락
  // acceptMatchRequest: async (requestId: string): Promise<void> => {
  //   return put(`/match-requests/${requestId}/accept`)
  // },

  // // 매칭 요청 거절
  // rejectMatchRequest: async (requestId: string): Promise<void> => {
  //   return put(`/match-requests/${requestId}/reject`)
  // },
}
