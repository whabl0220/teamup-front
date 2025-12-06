// API에서 사용하는 Enum 값들 정리
// 백엔드 API 명세와 일치해야 합니다

// ========== 팀 DNA (팀 스타일) ==========
export const TEAM_DNA = {
  BULLS: 'BULLS',
  WARRIORS: 'WARRIORS',
  SPURS: 'SPURS',
} as const

export type TeamDna = (typeof TEAM_DNA)[keyof typeof TEAM_DNA]

// ========== 포지션 ==========
export const POSITION = {
  GUARD: 'GUARD',   // 가드
  FORWARD: 'FORWARD',   // 포워드
  CENTER: 'CENTER',   // 센터
} as const

export type Position = (typeof POSITION)[keyof typeof POSITION]

// ========== 플레이 스타일 ==========
export const PLAY_STYLE = {
  SLASHER: 'SLASHER',  // 돌파 (Slasher)
  SHOOTER: 'SHOOTER',  // 슈터 (Shooter)
  DEFENDER: 'DEFENDER',  // 수비 (Defender)
  PASSER: 'PASSER',  // 패스 (Passer)
} as const

export type PlayStyle = (typeof PLAY_STYLE)[keyof typeof PLAY_STYLE]

// ========== 실력 레벨 ==========
export const SKILL_LEVEL = {
  ROOKIE: 'ROOKIE',           // 입문
  BEGINNER: 'BEGINNER',       // 초보
  INTERMEDIATE: 'INTERMEDIATE', // 중수
  ADVANCED: 'ADVANCED',       // 고수
  PRO: 'PRO',                 // 선출
} as const

export type SkillLevel = (typeof SKILL_LEVEL)[keyof typeof SKILL_LEVEL]

// ========== 성별 ==========
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const

export type Gender = (typeof GENDER)[keyof typeof GENDER]

// ========== 경기 결과 ==========
export const GAME_RESULT = {
  WIN: 'WIN',
  LOSE: 'LOSE',
  DRAW: 'DRAW',
} as const

export type GameResult = (typeof GAME_RESULT)[keyof typeof GAME_RESULT]

// ========== 경기 상태 ==========
export const GAME_STATUS = {
  PENDING: 'PENDING',       // 대기 중
  IN_PROGRESS: 'IN_PROGRESS', // 진행 중
  FINISHED: 'FINISHED',     // 종료
  CANCELLED: 'CANCELLED',   // 취소
} as const

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

// ========== 카드 스킨 ==========
export const CARD_SKIN = {
  DEFAULT: 'DEFAULT',
  GOLD: 'GOLD',
  RARE: 'RARE',
} as const

export type CardSkin = (typeof CARD_SKIN)[keyof typeof CARD_SKIN]

// ========== 피드백 태그 (포지션별 개선점) ==========
export const FEEDBACK_TAG = {
  REBOUND_GOOD: 'REBOUND_GOOD',      // 리바운드 좋음
  PASS_GOOD: 'PASS_GOOD',         // 패스 좋음
  SHOOT_GOOD: 'SHOOT_GOOD',        // 슛 좋음
  DEFENSE_GOOD: 'DEFENSE_GOOD',      // 수비 좋음
  TEAMWORK_GOOD: 'TEAMWORK_GOOD',     // 팀워크 좋음
  SPEED_GOOD: 'SPEED_GOOD',        // 스피드 좋음
  REBOUND_BAD: 'REBOUND_BAD',       // 리바운드 아쉬움
  PASS_BAD: 'PASS_BAD',          // 패스 아쉬움
  SHOOT_BAD: 'SHOOT_BAD',         // 슛 아쉬움
  DEFENSE_BAD: 'DEFENSE_BAD',       // 수비 아쉬움
  TEAMWORK_BAD: 'TEAMWORK_BAD',      // 팀워크 아쉬움
  SPEED_BAD: 'SPEED_BAD'          // 스피드 아쉬움
} as const

export type FeedbackTag = (typeof FEEDBACK_TAG)[keyof typeof FEEDBACK_TAG]

// ========== 알림 타입 ==========
export const NOTIFICATION_TYPE = {
  MATCH_REQUEST: 'MATCH_REQUEST',
  JOIN_REQUEST: 'JOIN_REQUEST',
  MATCH_ACCEPTED: 'MATCH_ACCEPTED',
  SYSTEM: 'SYSTEM',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]

// ========== 매칭 요청 상태 ==========
export const MATCH_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export type MatchRequestStatus = (typeof MATCH_REQUEST_STATUS)[keyof typeof MATCH_REQUEST_STATUS]

// ========== Helper 함수 ==========

// 실력 레벨을 점수로 변환 (AI 분석용)
export const getSkillLevelScore = (level: SkillLevel): number => {
  const scoreMap: Record<SkillLevel, number> = {
    ROOKIE: 10,
    BEGINNER: 30,
    INTERMEDIATE: 50,
    ADVANCED: 70,
    PRO: 90,
  }
  return scoreMap[level]
}

// 점수를 실력 레벨로 변환
export const getSkillLevelFromScore = (score: number): SkillLevel => {
  if (score >= 90) return SKILL_LEVEL.PRO
  if (score >= 70) return SKILL_LEVEL.ADVANCED
  if (score >= 50) return SKILL_LEVEL.INTERMEDIATE
  if (score >= 30) return SKILL_LEVEL.BEGINNER
  return SKILL_LEVEL.ROOKIE
}

// 팀 DNA 한글 이름
export const getTeamDnaKoreanName = (dna: TeamDna): string => {
  const nameMap: Record<TeamDna, string> = {
    BULLS: '시카고 불스',
    WARRIORS: '골든스테이트 워리어스',
    SPURS: '샌안토니오 스퍼스',
  }
  return nameMap[dna]
}

// 팀 DNA 설명
export const getTeamDnaDescription = (dna: TeamDna): string => {
  const descMap: Record<TeamDna, string> = {
    BULLS: '수비와 투지를 중시하는 전통적인 스타일',
    WARRIORS: '3점슛과 재미를 추구하는 현대적인 스타일',
    SPURS: '패스와 기본기를 중시하는 정석 스타일',
  }
  return descMap[dna]
}

// 포지션 한글 이름
export const getPositionKoreanName = (position: Position): string => {
  const nameMap: Record<Position, string> = {
    GUARD: '가드',
    FORWARD: '포워드',
    CENTER: '센터',
  }
  return nameMap[position]
}

// 플레이 스타일 한글 이름
export const getPlayStyleKoreanName = (style: PlayStyle): string => {
  const nameMap: Record<PlayStyle, string> = {
    SLASHER: '돌파형',
    SHOOTER: '슈터',
    DEFENDER: '수비형',
    PASSER: '패스형',
  }
  return nameMap[style]
}

// 실력 레벨 한글 이름
export const getSkillLevelKoreanName = (level: SkillLevel): string => {
  const nameMap: Record<SkillLevel, string> = {
    ROOKIE: '입문',
    BEGINNER: '초보',
    INTERMEDIATE: '중수',
    ADVANCED: '고수',
    PRO: '선출',
  }
  return nameMap[level]
}

// 경기 결과 한글 이름
export const getGameResultKoreanName = (result: GameResult): string => {
  const nameMap: Record<GameResult, string> = {
    WIN: '승리',
    LOSE: '패배',
    DRAW: '무승부',
  }
  return nameMap[result]
}
