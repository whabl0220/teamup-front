// 인증 관련 API
import { fetchText, post, setAccessToken, removeAccessToken } from './client'


export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  gender: string;
  address: string;
  height: number;
  position: string;
  subPosition?: string;
  playStyle?: string;
  skillLevel?: string;
  statusMsg?: string;
}


export interface SignupResponse {
  id: number;
  email: string;
  nickname: string;
  gender: string;
  address: string;
  height: number;
  position: string;
  subPosition?: string;
  playStyle?: string;
  skillLevel?: string;
  cardSkin?: string;
  statusMsg?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  nickname: string;
  gender: string;
  address: string;
  height: number;
  position: string;
  subPosition?: string;
  playStyle?: string;
  skillLevel?: string;
  cardSkin?: string;
  statusMsg?: string;
  createdAt: string;
}

export const authService = {
  // ========== 실제 사용 API ==========

  // 회원가입 (실제 사용)
  signup: async (data: RegisterRequest): Promise<SignupResponse> => {
    return post<SignupResponse>('/api/auth/signup', data)
  },

  // 로그인 (실제 사용)
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return post<LoginResponse>('/api/auth/login', data)
  },

  // ========== 향후 사용 예정 (주석 처리) ==========

  // // 이메일 인증코드 요청
  // requestEmailVerification: async (email: string): Promise<string> => {
  //   return fetchText('/email/verify/request', {
  //     method: 'POST',
  //     body: JSON.stringify({ email }),
  //   })
  // },

  // // 이메일 인증코드 확인
  // confirmEmailVerification: async (
  //   email: string,
  //   code: string
  // ): Promise<string> => {
  //   return fetchText('/email/verify/confirm', {
  //     method: 'POST',
  //     body: JSON.stringify({ email, code }),
  //   })
  // },

  // // 로그아웃
  // logout: (): void => {
  //   removeAccessToken()
  //   // localStorage의 다른 데이터도 필요시 정리
  // },
}
