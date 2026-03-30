'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

const IDENTITY_KEY = 'teamup_identity_v1'

export function ClerkIdentitySync() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!isSignedIn || !user) {
      localStorage.removeItem(IDENTITY_KEY)
      return
    }

    const identity = {
      userId: user.id,
      userName: user.username || user.firstName || user.fullName || user.primaryEmailAddress?.emailAddress || '내 계정',
    }

    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
  }, [isSignedIn, user])

  return null
}
