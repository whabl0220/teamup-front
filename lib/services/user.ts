// 유저 관련 API
import { get, put, del } from './client'
import { Team } from '@/types'

export interface User {
  id: string
  email: string
  nickname: string
  mainPosition: string
  subPosition?: string
  gender: string
  age: number
  address: string
  height?: number
  playStyle?: string
  statusMsg?: string
  Team?: Team[]
  createdAt: string
}

export interface UserTeamResponse {
  id: number
  name: string
  leaderId: number
  leaderNickname: string
  teamDna: 'BULLS' | 'WARRIORS' | 'SPURS'
  teamLevel: number
  teamExp: number
  emblemUrl?: string
  memberCount: number
  createdAt: string
}

export const userService = {
  // ========== 실제 사용 API ==========

  // 내 정보 조회
  getMe: async (): Promise<User> => {
    return get<User>('/api/users/me')
  },

  // 사용자의 팀 목록 조회
  getUserTeams: async (userId: number): Promise<UserTeamResponse[]> => {
    return get<UserTeamResponse[]>(`/api/users/${userId}/teams`)
  },

  // 내 정보 수정
  updateMe: async (data: Partial<User>): Promise<User> => {
    return put<User>('/api/users/me', data)
  },

  // // 특정 유저 조회
  // getUser: async (id: string): Promise<User> => {
  //   return get<User>(`/users/${id}`)
  // },

  // // 이메일로 유저 조회
  // getUserByEmail: async (email: string): Promise<User> => {
  //   return get<User>(`/user?email=${email}`)
  // },

  // // 전체 유저 조회 (개발용)
  // getAllUsers: async (): Promise<User[]> => {
  //   return get<User[]>('/user/all')
  // },

  // // 이메일로 유저 삭제 (개발용)
  // deleteUserByEmail: async (email: string): Promise<void> => {
  //   return del(`/user/by-email?email=${email}`)
  // },
}
