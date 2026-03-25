import type { MatchApplication } from '@/types/match'

const now = new Date().toISOString()

export const mockMatchApplications: MatchApplication[] = [
  {
    id: 'app-1',
    matchId: 'match-1',
    userId: 'user-101',
    userName: '김농구',
    status: 'PENDING_DEPOSIT',
    requestedAt: now,
  },
  {
    id: 'app-2',
    matchId: 'match-1',
    userId: 'user-102',
    userName: '이팀업',
    status: 'CONFIRMED',
    requestedAt: now,
    confirmedAt: now,
  },
]

