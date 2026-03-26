'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredNotifications, NOTIFICATIONS_UPDATED_EVENT } from '@/lib/local-notifications'

export function HeaderNotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnread = useCallback(() => {
    const unread = getStoredNotifications().filter((item) => !item.read).length
    setUnreadCount(unread)
  }, [])

  useEffect(() => {
    refreshUnread()
    const onFocus = () => refreshUnread()
    const onUpdated = () => refreshUnread()
    window.addEventListener('focus', onFocus)
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated)
    }
  }, [refreshUnread])

  const badgeText = useMemo(() => (unreadCount > 99 ? '99+' : String(unreadCount)), [unreadCount])

  return (
    <Link href="/notifications">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-12 w-12 hover:bg-transparent active:bg-transparent"
        aria-label="알림 확인"
      >
        <Bell className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
            {badgeText}
          </span>
        )}
      </Button>
    </Link>
  )
}

