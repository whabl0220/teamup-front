export const MATCH_ERROR_CODES = {
  hostScheduleOverlap: 'HOST_SCHEDULE_OVERLAP',
  selfHostApplyForbidden: 'SELF_HOST_APPLY_FORBIDDEN',
  forbiddenHostAccess: 'FORBIDDEN_HOST_ACCESS',
  forbiddenApplicationCancel: 'FORBIDDEN_APPLICATION_CANCEL',
  matchNotRecruiting: 'MATCH_NOT_RECRUITING',
  invalidApplicationStatus: 'INVALID_APPLICATION_STATUS',
  matchAlreadyFull: 'MATCH_ALREADY_FULL',
  invalidStartAt: 'INVALID_START_AT',
  invalidEndAt: 'INVALID_END_AT',
  invalidRange: 'INVALID_RANGE',
} as const

export type MatchErrorCode = (typeof MATCH_ERROR_CODES)[keyof typeof MATCH_ERROR_CODES]
