// AI 코칭 관련 API
import { post, get } from './client'
import type { GameResult, FeedbackTag } from './enums'

// 게임 종료 및 피드백 제출 API 타입
export interface PositionFeedback {
  positionNumber: number;
  tags: FeedbackTag[]; // enums.ts의 FeedbackTag 타입 사용
}

export interface FinishGameFeedbackRequest {
  teamId: number;
  result: GameResult; // enums.ts의 GameResult 타입 사용
  positionFeedbacks: PositionFeedback[];
}

export interface FinishGameFeedbackResponse {
  gameId: number;
  teamId: number;
  teamName: string;
  opponent?: string; // 상대팀 이름
  result: GameResult; // enums.ts의 GameResult 타입 사용
  positionFeedbacksJson: string;
  aiComment: string;
  createdAt: string;
}

// AI 리포트 생성 API 타입
export interface CreateReportResponse {
  gameId: number;
  teamId: number;
  teamName: string;
  result: GameResult; // enums.ts의 GameResult 타입 사용
  positionFeedbacksJson: string;
  aiComment: string;
  createdAt: string;
}

export interface AIFeedbackRequest {
  teamId: string
  teamDNA: string
  gameResult: GameResult // enums.ts의 GameResult 타입 사용
  feedbackAnswers: Record<string, string> // 4개 질문의 답변
  opponent: string
  gameDate: string
}

export interface AIFeedbackResponse {
  id: string
  teamId: string
  gameResult: GameResult // enums.ts의 GameResult 타입 사용
  opponent: string
  gameDate: string
  feedback: string
  createdAt: string
}

export interface MatchScoreRequest {
  userId: string
  teamId: string
}

export interface MatchScoreResponse {
  score: number
  reason: string
}

export const coachingService = {
  // ========== 실제 사용 API ==========

  // 게임 종료 및 피드백 제출 (실제 사용)
  finishGameAndFeedback: async (gameId: number, data: FinishGameFeedbackRequest): Promise<FinishGameFeedbackResponse> => {
    return post<FinishGameFeedbackResponse>(`/api/games/${gameId}/finish-and-feedback`, data);
  },

  // AI 리포트 생성 (실제 사용)
  createReport: async (gameId: number, teamId: number): Promise<CreateReportResponse> => {
    return post<CreateReportResponse>(`/api/games/${gameId}/report?teamId=${teamId}`);
  },

  // 팀의 게임 기록 조회
  getTeamGameRecords: async (teamId: number): Promise<FinishGameFeedbackResponse[]> => {
    return get<FinishGameFeedbackResponse[]>(`/api/teams/${teamId}/game-records`);
  },

  // 게임 기록 상세 조회
  getGameRecord: async (gameId: number): Promise<FinishGameFeedbackResponse> => {
    return get<FinishGameFeedbackResponse>(`/api/games/${gameId}`);
  },

  // ========== 향후 사용 예정 (주석 처리) ==========

  // // AI 피드백 생성 (경기 후)
  // generateAIFeedback: async (
  //   data: AIFeedbackRequest
  // ): Promise<AIFeedbackResponse> => {
  //   return post<AIFeedbackResponse>('/ai/coaching/feedback', data)
  // },

  // // 매칭 점수 계산
  // getMatchScore: async (
  //   data: MatchScoreRequest
  // ): Promise<MatchScoreResponse> => {
  //   return post<MatchScoreResponse>('/ai/match-score', data)
  // },

  // // 코칭 레포트 생성
  // generateCoachingReport: async (gameId: string): Promise<unknown> => {
  //   return post('/ai/coaching-report', { gameId })
  // },

  // // 추천 팀 조회
  // getRecommendedTeams: async (userId: string): Promise<unknown[]> => {
  //   return get(`/ai/recommend-teams?userId=${userId}`)
  // },
}
