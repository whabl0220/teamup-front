import type { MatchLevel } from '@/types/match'

export const MATCH_LEVEL_LABEL: Record<MatchLevel, string> = {
  ALL: '전체',
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
}

export const getMatchLevelLabel = (level: MatchLevel) => MATCH_LEVEL_LABEL[level]
