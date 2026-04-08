export type MatchStatus = 'RECRUITING' | 'FULL' | 'CANCELLED' | 'ENDED'

export type MatchApplicationStatus =
  | 'PENDING_DEPOSIT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REFUNDED'

export type MatchLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL'

export interface CourtPreset {
  id: string
  name: string
  address: string
  district: string
  indoor: boolean
  lat?: number
  lng?: number
  notice?: string
}

export interface Match {
  id: string
  title: string
  startAt: string
  endAt?: string
  court: CourtPreset
  fee: number
  capacity: number
  confirmedCount: number
  pendingCount: number
  level: MatchLevel
  status: MatchStatus
  cancellationPolicy?: string
  notes?: string
  hostId: string
  hostName?: string
  depositAccount?: string
  createdAt: string
  updatedAt?: string
}

export interface MatchApplication {
  id: string
  matchId: string
  userId: string
  userName: string
  status: MatchApplicationStatus
  requestedAt: string
  confirmedAt?: string
  cancelledAt?: string
  refundedAt?: string
  memo?: string
}

export interface MatchListParams {
  from?: string
  to?: string
  status?: MatchStatus
  level?: MatchLevel
}

export interface CreateMatchRequest {
  title: string
  startAt: string
  endAt?: string
  courtId: string
  fee: number
  capacity: number
  level: MatchLevel
  cancellationPolicy?: string
  notes?: string
  /** fee === 0(무료 경기)일 때는 생략 가능 */
  depositAccount?: string
}

export interface UpdateMatchRequest {
  title: string
  startAt: string
  endAt?: string
  courtId: string
  fee: number
  capacity: number
  level: MatchLevel
  cancellationPolicy?: string
  notes?: string
  /** fee === 0(무료 경기)일 때는 생략 가능 */
  depositAccount?: string
}

export interface UpdateMatchStatusRequest {
  status: Extract<MatchStatus, 'RECRUITING' | 'FULL' | 'CANCELLED' | 'ENDED'>
  reason?: string
}

