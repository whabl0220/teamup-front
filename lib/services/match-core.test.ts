import { beforeEach, describe, expect, it } from 'vitest'
import type { Match } from '@/types/match'
import { ApiError } from './client'
import { MATCH_ERROR_CODES } from './match-errors'
import { assertHostScheduleNoOverlapInMatches } from './match-domain'
import { applyToMatchLocal, confirmApplicationLocal, refundApplicationLocal } from './match-local'
import { setStoredMatches } from '@/lib/match-local-matches-store'
import { getStoredApplicationsByMatchId, setStoredApplications } from '@/lib/match-local-store'
import { shouldFallbackToLocal } from './match'

const createJwt = (payload: Record<string, unknown>) => {
  const encode = (value: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.sig`
}

const createStorageMock = () => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

const createWindowMock = () => ({
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
})

const createMatch = (overrides?: Partial<Match>): Match => ({
  id: 'match-1',
  title: '테스트 경기',
  startAt: '2026-04-01T10:00:00.000Z',
  endAt: '2026-04-01T12:00:00.000Z',
  court: {
    id: 'court-1',
    name: '테스트 코트',
    address: '서울',
    district: '강남',
    indoor: true,
  },
  fee: 10000,
  capacity: 10,
  confirmedCount: 0,
  pendingCount: 0,
  level: 'ALL',
  status: 'RECRUITING',
  hostId: 'host-1',
  hostName: '호스트',
  depositAccount: '토스 1234',
  createdAt: '2026-03-31T00:00:00.000Z',
  ...overrides,
})

describe('match core policy tests', () => {
  beforeEach(() => {
    const storage = createStorageMock()
    ;(globalThis as unknown as { window: object }).window = createWindowMock()
    ;(globalThis as unknown as { localStorage: ReturnType<typeof createStorageMock> }).localStorage =
      storage
  })

  it('blocks self-host application', () => {
    localStorage.setItem('access_token', createJwt({ sub: 'host-1', nickname: '호스트' }))
    setStoredMatches([createMatch({ hostId: 'host-1' })])

    expect(() => applyToMatchLocal('match-1')).toThrowError(MATCH_ERROR_CODES.selfHostApplyForbidden)
  })

  it('detects host schedule overlap', () => {
    const hosted = [createMatch({ id: 'a', startAt: '2026-04-01T10:00:00.000Z', endAt: '2026-04-01T12:00:00.000Z' })]

    expect(() =>
      assertHostScheduleNoOverlapInMatches(hosted, '2026-04-01T11:00:00.000Z', '2026-04-01T13:00:00.000Z')
    ).toThrowError(MATCH_ERROR_CODES.hostScheduleOverlap)
  })

  it('supports confirm then refund transition', () => {
    localStorage.setItem('access_token', createJwt({ sub: 'host-1', nickname: '호스트' }))
    setStoredMatches([createMatch({ id: 'match-2', hostId: 'host-1' })])
    setStoredApplications([
      {
        id: 'app-1',
        matchId: 'match-2',
        userId: 'user-2',
        userName: '참가자',
        status: 'PENDING_DEPOSIT',
        requestedAt: '2026-04-01T09:00:00.000Z',
      },
    ])

    const confirmed = confirmApplicationLocal('match-2', 'app-1')
    expect(confirmed.status).toBe('CONFIRMED')

    const refunded = refundApplicationLocal('match-2', 'app-1')
    expect(refunded.status).toBe('REFUNDED')

    const stored = getStoredApplicationsByMatchId('match-2').find((app) => app.id === 'app-1')
    expect(stored?.status).toBe('REFUNDED')
  })

  it('allows fallback only for network and timeout errors', () => {
    expect(shouldFallbackToLocal(new TypeError('network'))).toBe(true)
    expect(shouldFallbackToLocal(new DOMException('timeout', 'AbortError'))).toBe(true)
    expect(shouldFallbackToLocal(new ApiError('forbidden', 403))).toBe(false)
    expect(shouldFallbackToLocal(new Error('unknown'))).toBe(false)
  })
})
