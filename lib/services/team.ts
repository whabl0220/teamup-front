// 게임 생성 API 타입
export interface CreateGameRequest {
  homeTeamId: number;
  awayTeamId: number;
}

export interface CreateGameResponse {
  gameId: number;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  status: string;
  createdAt: string;
}
// 매칭 추천 팀 조회 API 타입
export interface MatchSuggestion {
  teamId: number;
  name: string;
  teamDna: string;
  teamLevel: number;
  memberCount: number;
}

// 팀 관련 API
import { get, post, del } from './client'
import type { Team, TeamMember } from '@/types'


// 실제 API 명세에 맞는 팀 생성 요청 타입
export interface CreateTeamApiRequest {
  name: string;
  teamDna: string;
  emblemUrl?: string;
}

// 실제 API 명세에 맞는 팀 생성 응답 타입
export interface CreateTeamApiResponse {
  id: number;
  name: string;
  leaderId: number;
  leaderNickname: string;
  teamDna: string;
  teamLevel: number;
  teamExp: number;
  emblemUrl: string;
  memberCount: number;
  createdAt: string;
}

export interface TeamDetail extends Team {
  captain: {
    id: string
    nickname: string
    email: string
  }
  members: TeamMember[];
}

export interface JoinTeamRequest {
  message?: string
}

export const teamService = {
  // ========== 실제 사용 API ==========

  // 팀 생성 (실제 사용)
  createTeamApi: async (userId: number, data: CreateTeamApiRequest): Promise<CreateTeamApiResponse> => {
    return post<CreateTeamApiResponse>(`/api/teams?userId=${userId}`, data)
  },

  // 게임 생성 (실제 사용)
  createGame: async (data: CreateGameRequest): Promise<CreateGameResponse> => {
    return post<CreateGameResponse>('/api/games/match', data);
  },

  // 매칭 추천 팀 조회 (실제 사용)
  getMatchSuggestions: async (teamId: number): Promise<MatchSuggestion[]> => {
    return get<MatchSuggestion[]>(`/api/teams/${teamId}/match-suggestions`);
  },

  // 내 팀 목록 조회
  getMyTeams: async (): Promise<Team[]> => {
    return get<Team[]>('/api/teams/my')
  },

  // 팀 상세 조회
  getTeam: async (id: string): Promise<Team> => {
    return get<Team>(`/api/teams/${id}`)
  },

  // // 팀 검색
  // searchTeams: async (
  //   query: string,
  //   filters?: { region?: string; level?: string }
  // ): Promise<Team[]> => {
  //   const params = new URLSearchParams({
  //     q: query,
  //     ...(filters?.region && { region: filters.region }),
  //     ...(filters?.level && { level: filters.level }),
  //   })
  //   return get<Team[]>(`/teams/search?${params}`)
  // },

  // // 팀 탈퇴
  // leaveTeam: async (teamId: string): Promise<void> => {
  //   return post(`/teams/${teamId}/leave`)
  // },

  // // 팀 상세 정보 (멤버 포함)
  // getTeamDetail: async (teamId: string): Promise<TeamDetail> => {
  //   return get<TeamDetail>(`/teams/${teamId}/detail`)
  // },

  // // 팀 멤버 조회
  // getTeamMembers: async (teamId: string): Promise<TeamDetail['members']> => {
  //   return get<TeamDetail['members']>(`/teams/${teamId}/members`)
  // },

  // // 팀 멤버십 확인
  // checkTeamMembership: async (teamId: string): Promise<{ isMember: boolean }> => {
  //   return get<{ isMember: boolean }>(`/teams/${teamId}/is-member`)
  // },

  // // 팀 참여 요청
  // joinTeam: async (teamId: string, data?: JoinTeamRequest): Promise<void> => {
  //   return post(`/teams/${teamId}/join`, data)
  // },

  // // 팀장 연락처 조회
  // getTeamContact: async (teamId: string): Promise<{ kakaoId: string }> => {
  //   return get<{ kakaoId: string }>(`/teams/${teamId}/contact`)
  // },
}
