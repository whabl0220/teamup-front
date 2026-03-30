'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'

export function HeaderNotificationButton() {
  const { unreadCount } = useNotifications()

  const badgeText = useMemo(() => (unreadCount > 99 ? '99+' : String(unreadCount)), [unreadCount])

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative h-12 w-12 hover:bg-transparent active:bg-transparent"
    >
      <Link href="/notifications" aria-label="알림 확인">
        <Bell className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
            {badgeText}
          </span>
        )}
      </Link>
    </Button>
  )
}

