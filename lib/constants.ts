// App Constants
export const APP_NAME = 'TeamUp';
export const APP_DESCRIPTION = 'AI 기반 농구 팀 매칭 & 코칭 플랫폼';

// Routes
export const ROUTES = {
  HOME: '/',
  MATCHING: '/matching',
  MATCHING_CREATE: '/matching/create',
  MAP: '/map',
  MYPAGE: '/mypage',
  TEAM: '/team',
  COACHING: '/coaching',
} as const;

// Team Levels
export const TEAM_LEVELS = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const;
