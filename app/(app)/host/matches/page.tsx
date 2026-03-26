'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { HeaderNotificationButton } from '@/components/layout/header-notification-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { matchService } from '@/lib/services'
import type { Match } from '@/types/match'
import { toast } from 'sonner'
import { formatDateTimeKorean } from '@/lib/date-format'
import { MATCH_STATUS_META } from '@/lib/status-meta'

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
        <div className="mb-4 flex gap-2">
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
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="border-border/50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-44" />
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
                <Link href="/host/matches/create">
                  <Button>주최 경기 만들기</Button>
                </Link>
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
                <Link href="/host/matches/create">
                  <Button>주최 경기 만들기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link key={match.id} href={`/host/matches/${match.id}`} className="block">
                <Card className="teamup-card-soft cursor-pointer">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-base font-semibold">{match.title}</p>
                      <Badge
                        variant={MATCH_STATUS_META[match.status].variant}
                        className={MATCH_STATUS_META[match.status].className}
                      >
                        {MATCH_STATUS_META[match.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{match.court.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTimeKorean(match.startAt)}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <ClipboardList className="h-4 w-4" />
                      <span>신청자/상태 관리</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

