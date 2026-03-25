'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import {
  clearNotifications,
  getNotificationTypeLabel,
  getStoredNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/local-notifications'
import type { AppNotification } from '@/types/notification'
import { toast } from 'sonner'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications())
  const router = useRouter()

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const reload = () => setNotifications(getStoredNotifications())

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
    reload()
    toast.success('모든 알림을 읽음 처리했습니다.')
  }

  const handleClear = () => {
    clearNotifications()
    reload()
    toast.success('알림 로그를 비웠습니다.')
  }

  const handleClickItem = (item: AppNotification) => {
    markNotificationAsRead(item.id)
    reload()
    const matchId = item.meta?.matchId
    if (matchId) router.push(`/matches/${matchId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/mypage">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
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
            로그 비우기
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            {notifications.length === 0 ? (
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
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.read ? 'outline' : 'default'}>
                          {getNotificationTypeLabel(item.type)}
                        </Badge>
                        {!item.read && <span className="text-xs font-medium text-primary">NEW</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
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

