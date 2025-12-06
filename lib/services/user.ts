// 유저 관련 API
import { get, del } from './client'
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

export const userService = {
  // ========== 실제 사용 API ==========
  // (시연에서는 사용 안 함)

  // ========== 향후 사용 예정 (주석 처리) ==========

  // // 내 정보 조회
  // getMe: async (): Promise<User> => {
  //   return get<User>('/users/me')
  // },

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
