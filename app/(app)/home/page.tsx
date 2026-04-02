'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { Bell, CalendarDays, CircleCheck, ClipboardList, UserPen, Wallet } from 'lucide-react'
import { HeaderNotificationButton } from '@/components/layout/header-notification-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { matchService } from '@/lib/services'
import { getLocalUser } from '@/lib/services/match'
import type { Match } from '@/types/match'
import { useMyStoredApplications } from '@/hooks/useStoredApplications'
import { useNotifications } from '@/hooks/useNotifications'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hostedCount, setHostedCount] = useState(0)
  const [todayMatchCount, setTodayMatchCount] = useState(0)
  const [pendingDepositCount, setPendingDepositCount] = useState(0)
  const { user } = useUser()
  const localUserId = useMemo(() => getLocalUser().userId, [])
  const myApps = useMyStoredApplications(localUserId)
  const { unreadCount } = useNotifications()
  const displayName = user?.username || user?.firstName || user?.fullName || '플레이어'

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const [hosted, allMatches] = await Promise.all([matchService.listHostedMatches(), matchService.listMatches()])
      const today = new Date().toDateString()

      const myMatchIdSet = new Set(myApps.map((app) => app.matchId))
      const myTodayMatches = allMatches.filter(
        (match: Match) =>
          myMatchIdSet.has(match.id) && new Date(match.startAt).toDateString() === today
      )

      setHostedCount(hosted.length)
      setTodayMatchCount(myTodayMatches.length)
      setPendingDepositCount(myApps.filter((app) => app.status === 'PENDING_DEPOSIT').length)
    } catch {
      setHostedCount(0)
      setTodayMatchCount(0)
      setPendingDepositCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [myApps])

  useEffect(() => {
    void refreshDashboard()
    const onFocus = () => void refreshDashboard()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshDashboard])

  const primaryAction = useMemo(() => {
    if (pendingDepositCount > 0) {
      return {
        href: '/matches?mode=MY',
        label: '입금 대기 확인',
        description: `입금 대기 ${pendingDepositCount}건을 확인하세요.`,
        icon: Wallet,
      }
    }
    if (todayMatchCount > 0) {
      return {
        href: '/matches?mode=MY',
        label: '오늘 경기 확인',
        description: `오늘 참가 일정 ${todayMatchCount}건이 있어요.`,
        icon: CalendarDays,
      }
    }
    if (unreadCount > 0) {
      return {
        href: '/notifications',
        label: '알림 확인',
        description: `읽지 않은 알림 ${unreadCount}건이 있습니다.`,
        icon: Bell,
      }
    }
    return {
      href: '/matches',
      label: '새 경기 찾기',
      description: '오늘/이번 주 참가 가능한 경기를 찾아보세요.',
      icon: CircleCheck,
    }
  }, [pendingDepositCount, todayMatchCount, unreadCount])

  const PrimaryActionIcon = primaryAction.icon

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.jpg"
              alt="TeamUp Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TeamUp</h1>
              <p className="text-xs text-muted-foreground">{displayName}님, 반가워요</p>
            </div>
          </div>
          <HeaderNotificationButton />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            <Card className="teamup-card-soft-highlight">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 text-center">
                    <Skeleton className="mx-auto h-4 w-16" />
                    <Skeleton className="mx-auto mt-2 h-6 w-10" />
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 text-center">
                    <Skeleton className="mx-auto h-4 w-16" />
                    <Skeleton className="mx-auto mt-2 h-6 w-10" />
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 text-center">
                    <Skeleton className="mx-auto h-4 w-16" />
                    <Skeleton className="mx-auto mt-2 h-6 w-10" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid gap-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            <Card className="teamup-card-soft-highlight">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">오늘의 할 일</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 text-center">
                    <p className="text-xs text-muted-foreground">오늘 참가</p>
                    <p className="text-lg font-bold">{todayMatchCount}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 text-center">
                    <p className="text-xs text-muted-foreground">입금 대기</p>
                    <p className="text-lg font-bold">{pendingDepositCount}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/70 p-3 text-center">
                    <p className="text-xs text-muted-foreground">미확인 알림</p>
                    <p className="text-lg font-bold">{unreadCount}</p>
                  </div>
                </div>
                <Link href={primaryAction.href}>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 transition-colors hover:bg-muted/30">
                    <div className="teamup-icon-soft-strong flex h-10 w-10 items-center justify-center rounded-lg">
                      <PrimaryActionIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{primaryAction.label}</p>
                      <p className="text-xs text-muted-foreground">{primaryAction.description}</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <div className="space-y-2">
          <h3 className="text-base font-bold">빠른 액션</h3>
          <p className="text-sm text-muted-foreground">참가/주최 핵심 화면으로 바로 이동하세요.</p>
            </div>

            <div className="grid gap-3">
              <Link href="/matches">
                <Card className="teamup-card-soft cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="teamup-icon-soft-strong flex h-12 w-12 items-center justify-center rounded-xl">
                        <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-bold text-foreground">참가하기</h3>
                        <p className="text-xs text-muted-foreground">
                          오늘/이번 주 경기와 내 신청 내역을 확인하세요.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/host/matches">
                <Card
                  className={cn("teamup-card-soft cursor-pointer", hostedCount > 0 && "teamup-card-soft-highlight")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="teamup-icon-soft flex h-12 w-12 items-center justify-center rounded-xl">
                        <ClipboardList className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-bold text-foreground">주최하기</h3>
                          {hostedCount > 0 && <Badge variant="secondary">내 주최 {hostedCount}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {hostedCount > 0
                            ? '내 주최 경기의 신청/확정/환불 상태를 관리하세요.'
                            : '신청자 확인, 참가 확정, 환불을 처리합니다.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Link href="/mypage">
              <Card className="teamup-card-soft cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="teamup-icon-soft flex h-10 w-10 items-center justify-center rounded-lg">
                      <UserPen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">프로필 설정</h3>
                      <p className="text-xs text-muted-foreground">
                        닉네임, 포지션, 플레이 스타일을 최신으로 유지하세요.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </main>

    </div>
  )
}

