'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { updateCurrentUser } from '@/lib/storage'

const IDENTITY_KEY = 'teamup_identity_v1'
const PROFILE_SEEDED_KEY = 'teamup_profile_seeded_v1'

export function ClerkIdentitySync() {
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isLoaded) return

    if (!isSignedIn || !user) {
      localStorage.removeItem(IDENTITY_KEY)
      return
    }

    const identity = {
      userId: user.id,
      userName: user.username || user.firstName || user.fullName || '내 계정',
    }

    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))

    // 최초 로그인 시 로컬 프로필 기본값을 Clerk 사용자 정보로 1회 시드
    const seeded = localStorage.getItem(PROFILE_SEEDED_KEY)
    if (!seeded) {
      updateCurrentUser({
        id: identity.userId,
        name: identity.userName,
        email: user.primaryEmailAddress?.emailAddress || '',
      })
      localStorage.setItem(PROFILE_SEEDED_KEY, 'true')
    }
  }, [isLoaded, isSignedIn, user])

  return null
}
