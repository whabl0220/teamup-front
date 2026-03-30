import { beforeEach, describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { getAuthIdentityFromToken } from './auth-identity'
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

describe('match fallback policy', () => {
  it('allows fallback only for network-like errors', () => {
    expect(shouldFallbackToLocal(new TypeError('network'))).toBe(true)
    expect(shouldFallbackToLocal(new DOMException('timeout', 'AbortError'))).toBe(true)
    expect(shouldFallbackToLocal(new ApiError('Bad Request', 400))).toBe(false)
    expect(shouldFallbackToLocal(new Error('unknown'))).toBe(false)
  })
})

describe('auth identity from token', () => {
  beforeEach(() => {
    const storage = createStorageMock()
    ;(globalThis as unknown as { window: object }).window = {}
    ;(globalThis as unknown as { localStorage: ReturnType<typeof createStorageMock> }).localStorage =
      storage
  })

  it('reads user identity from jwt payload', () => {
    const token = createJwt({ sub: 'user-123', nickname: '테스트유저' })
    localStorage.setItem('access_token', token)

    expect(getAuthIdentityFromToken()).toEqual({
      userId: 'user-123',
      userName: '테스트유저',
    })
  })

  it('returns null for expired token', () => {
    const token = createJwt({
      sub: 'user-123',
      nickname: '테스트유저',
      exp: Math.floor(Date.now() / 1000) - 30,
    })
    localStorage.setItem('access_token', token)

    expect(getAuthIdentityFromToken()).toBeNull()
  })
})
