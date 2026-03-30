'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, MapPin, RefreshCw, Users } from 'lucide-react'
import { HeaderNotificationButton } from '@/components/layout/header-notification-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { matchService } from '@/lib/services'
import type { Match } from '@/types/match'
import { toast } from 'sonner'
import { formatCurrencyKRW, formatDateTimeKorean } from '@/lib/formatters'
import { MATCH_STATUS_META } from '@/lib/status-meta'
import { getMatchLevelLabel } from '@/lib/match-level-meta'

export default function HostMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [mode, setMode] = useState<'ALL' | 'MY' | 'TODAY' | 'WEEK'>('ALL')

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      setHasLoadError(false)
      setMatches(await matchService.listHostedMatches())
    } catch {
      setMatches([])
      setHasLoadError(true)
      toast.info('데이터 로딩에 실패하여 목데이터로 운영 화면을 표시합니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMatches()
  }, [])

  const filteredMatches = useMemo(() => {
    if (mode === 'ALL' || mode === 'MY') return matches

    if (mode === 'TODAY') {
      const now = new Date()
      return matches.filter((match) => new Date(match.startAt).toDateString() === now.toDateString())
    }

    const now = new Date()
    const day = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    return matches.filter((match) => {
      const target = new Date(match.startAt)
      return target >= start && target < end
    })
  }, [matches, mode])

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
          <Image
            src="/images/logo.jpg"
            alt="TeamUp Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">주최하기</h1>
            <p className="text-sm text-muted-foreground">농구 경기를 주최해보세요</p>
          </div>
          </div>
          <HeaderNotificationButton />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button variant={mode === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setMode('ALL')}>
            전체
          </Button>
          <Button variant={mode === 'MY' ? 'default' : 'outline'} size="sm" onClick={() => setMode('MY')}>
            내 주최
          </Button>
          <Button variant={mode === 'TODAY' ? 'default' : 'outline'} size="sm" onClick={() => setMode('TODAY')}>
            오늘
          </Button>
          <Button variant={mode === 'WEEK' ? 'default' : 'outline'} size="sm" onClick={() => setMode('WEEK')}>
            이번주
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => void loadMatches()}
            disabled={isLoading}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            새로고침
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="border-border/50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasLoadError ? (
          <Card className="border-border/50">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-sm text-muted-foreground">내 주최 경기 데이터를 불러오지 못했습니다.</p>
              <div className="flex justify-center gap-2">
                <Button asChild>
                  <Link href="/host/matches/create">주최 경기 만들기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredMatches.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'ALL' || mode === 'MY'
                  ? '내가 주최한 경기가 없습니다.'
                  : '조건에 맞는 주최 경기가 없습니다.'}
              </p>
              <div className="flex justify-center gap-2">
                <Button asChild>
                  <Link href="/host/matches/create">주최 경기 만들기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => {
              const occupancy = `${match.confirmedCount + match.pendingCount}/${match.capacity}`
              return (
                <Link key={match.id} href={`/host/matches/${match.id}`} className="block">
                  <Card className="teamup-card-soft cursor-pointer">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-foreground">{match.title}</h3>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant={MATCH_STATUS_META[match.status].variant}
                            className={MATCH_STATUS_META[match.status].className}
                          >
                            {MATCH_STATUS_META[match.status].label}
                          </Badge>
                          <Badge variant="outline">내 주최</Badge>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0" />
                          {formatDateTimeKorean(match.startAt)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          {match.court.name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0" />
                          {occupancy}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Badge variant="outline">{getMatchLevelLabel(match.level)}</Badge>
                        <p className="text-xs font-semibold text-foreground">{formatCurrencyKRW(match.fee)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
            <Card className="border-border/50">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  다른 일정으로 주최 경기를 더 만들 수 있습니다. 
                </p>
                <p className="text-sm text-muted-foreground">(2시간 이상 차이나는 경기만 추가 주최 가능)</p>
                <div className="flex justify-center gap-2">
                  <Button asChild>
                    <Link href="/host/matches/create">주최 경기 만들기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

