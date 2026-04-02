'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, Bell, CheckCheck, CircleCheck, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import {
  getNotificationTypeLabel,
} from '@/lib/local-notifications'
import type { AppNotification } from '@/types/notification'
import { toast } from 'sonner'
import type { NotificationType } from '@/types/notification'
import { formatDateTimeKorean } from '@/lib/formatters'
import { useNotifications } from '@/hooks/useNotifications'

const SCROLL_KEY = 'teamup_notifications_scroll_y'

const getNotificationMeta = (type: NotificationType) => {
  if (type === 'MATCH_APPLIED') {
    return {
      icon: CircleCheck,
      iconClass: 'text-emerald-600',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
  }
  if (type === 'MATCH_CANCELLED') {
    return {
      icon: AlertTriangle,
      iconClass: 'text-rose-600',
      badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
    }
  }
  return {
    icon: RotateCcw,
    iconClass: 'text-blue-600',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem(SCROLL_KEY)
    if (raw) {
      const y = Number(raw)
      if (!Number.isNaN(y)) window.scrollTo({ top: y, behavior: 'auto' })
    }

    const handleScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const t = window.setTimeout(() => setIsLoading(false), 150)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.clearTimeout(t)
    }
  }, [])

  const handleMarkAllRead = () => {
    markAllAsRead()
    toast.success('모든 알림을 읽음 처리했습니다.')
  }

  const handleClear = () => {
    clearAll()
    toast.success('알림 로그를 비웠습니다.')
  }

  const handleClickItem = (item: AppNotification) => {
    markAsRead(item.id)
    const matchId = item.meta?.matchId
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    if (matchId) router.push(`/matches/${matchId}?from=notifications`)
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/mypage')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">알림 로그</h1>
          </div>
          <Badge variant="outline">미확인 {unreadCount}</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            모두 읽음
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
            내역 삭제하기
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="w-full rounded-xl border border-border/50 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-5 w-28 rounded-md" />
                      <Skeleton className="ml-auto h-4 w-14 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />
                    <Skeleton className="mt-1 h-3 w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">아직 기록된 알림이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className="w-full rounded-xl border border-border/50 p-3 text-left transition-colors hover:bg-muted/40"
                    onClick={() => handleClickItem(item)}
                  >
                    {(() => {
                      const meta = getNotificationMeta(item.type)
                      const Icon = meta.icon
                      return (
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60">
                            <Icon className={`h-4 w-4 ${meta.iconClass}`} />
                          </div>
                          <Badge
                            variant="outline"
                            className={item.read ? '' : meta.badgeClass}
                          >
                            {getNotificationTypeLabel(item.type)}
                          </Badge>
                          {!item.read && <span className="text-xs font-medium text-primary">NEW</span>}
                        </div>
                      )
                    })()}
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{formatDateTimeKorean(item.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

