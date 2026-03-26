import { MATCH_COURT_PRESETS } from '@/lib/match-courts'
import type { Match } from '@/types/match'

const now = new Date()
const toIsoWithOffset = (days: number, hour: number, minute = 0): string => {
  const date = new Date(now)
  date.setDate(now.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const mockMatches: Match[] = [
  {
    id: 'match-1',
    title: '평일 저녁 픽업 게임',
    startAt: toIsoWithOffset(0, 20, 0),
    court: MATCH_COURT_PRESETS[0],
    fee: 8000,
    capacity: 15,
    confirmedCount: 10,
    pendingCount: 2,
    level: 'INTERMEDIATE',
    status: 'RECRUITING',
    cancellationPolicy: '경기 시작 6시간 전까지 100% 환불',
    notes: '유니폼 자유, 물 개인 지참',
    hostId: 'host-dev-team',
    hostName: 'TeamUp 운영팀',
    depositAccount: '토스뱅크 1000-0000-0000 TeamUp',
    createdAt: now.toISOString(),
  },
  {
    id: 'match-2',
    title: '주말 오전 올레벨 게임',
    startAt: toIsoWithOffset(2, 10, 0),
    court: MATCH_COURT_PRESETS[1],
    fee: 10000,
    capacity: 15,
    confirmedCount: 15,
    pendingCount: 0,
    level: 'ALL',
    status: 'FULL',
    cancellationPolicy: '경기 시작 12시간 전까지 100% 환불',
    notes: '초보자 환영',
    hostId: 'host-dev-team',
    hostName: 'TeamUp 운영팀',
    depositAccount: '카카오뱅크 3333-0000-0000 TeamUp',
    createdAt: now.toISOString(),
  },
  {
    id: 'match-3',
    title: '주중 야간 고급반 게임',
    startAt: toIsoWithOffset(4, 21, 0),
    court: MATCH_COURT_PRESETS[3],
    fee: 12000,
    capacity: 15,
    confirmedCount: 8,
    pendingCount: 1,
    level: 'ADVANCED',
    status: 'RECRUITING',
    cancellationPolicy: '경기 시작 24시간 전까지 100% 환불',
    notes: '경쟁 강도 높음',
    hostId: 'host-dev-team',
    hostName: 'TeamUp 운영팀',
    depositAccount: '토스뱅크 1000-0000-0000 TeamUp',
    createdAt: now.toISOString(),
  },
]

export const getMockMatchById = (id: string): Match | undefined =>
  mockMatches.find((match) => match.id === id)

