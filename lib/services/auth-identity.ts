import { getAccessToken } from './client'

type JwtPayload = {
  sub?: string | number
  userId?: string | number
  id?: string | number
  nickname?: string
  name?: string
  preferred_username?: string
  email?: string
  exp?: number
}

const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

  if (typeof atob === 'function') {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }
  return Buffer.from(padded, 'base64').toString('utf-8')
}

const parseJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const decoded = decodeBase64Url(parts[1])
    const parsed = JSON.parse(decoded) as JwtPayload
    return parsed
  } catch {
    return null
  }
}

export const getAuthIdentityFromToken = (): { userId: string; userName: string } | null => {
  const token = getAccessToken()
  if (!token) return null

  const payload = parseJwtPayload(token)
  if (!payload) return null

  if (typeof payload.exp === 'number') {
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp <= nowSeconds) return null
  }

  const rawUserId = payload.sub ?? payload.userId ?? payload.id
  if (rawUserId === undefined || rawUserId === null || String(rawUserId).trim() === '') return null

  const userId = String(rawUserId)
  const userName =
    payload.nickname ||
    payload.name ||
    payload.preferred_username ||
    payload.email ||
    '내 계정'

  return { userId, userName }
}
