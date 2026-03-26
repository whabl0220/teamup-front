'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { matchService } from '@/lib/services'
import { mockMatches } from '@/lib/mock-matches'
import type { Match } from '@/types/match'
import { toast } from 'sonner'
import { getStoredApplications } from '@/lib/match-local-store'
import { getLocalUser } from '@/lib/services/match'
import type { MatchApplicationStatus } from '@/types/match'
import { formatDateTimeKorean } from '@/lib/date-format'

type MatchListMode = 'ALL' | 'MY' | 'TODAY' | 'WEEK'
type MyStatusFilter = 'ALL' | MatchApplicationStatus

const getMatchStatusLabel = (status: Match['status']) => {
  if (status === 'RECRUITING') return '모집중'
  if (status === 'FULL') return '마감'
  if (status === 'CANCELLED') return '취소'
  return '종료'
}

const getMatchStatusVariant = (status: Match['status']) => {
  if (status === 'RECRUITING') return 'default'
  if (status === 'FULL') return 'secondary'
  return 'outline'
}

const getMyApplicationStatusLabel = (status: MatchApplicationStatus) => {
  if (status === 'PENDING_DEPOSIT') return '입금대기'
  if (status === 'CONFIRMED') return '확정'
  if (status === 'CANCELLED') return '취소'
  return '환불'
}

const getMyApplicationStatusVariant = (status: MatchApplicationStatus) => {
  if (status === 'PENDING_DEPOSIT') return 'default'
  if (status === 'CONFIRMED') return 'secondary'
  return 'outline'
}

const isInThisWeek = (date: Date) => {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return date >= start && date < end
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [mode, setMode] = useState<MatchListMode>('ALL')
  const [myStatusFilter, setMyStatusFilter] = useState<MyStatusFilter>('ALL')

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      setHasLoadError(false)
      const data = await matchService.listMatches()
      setMatches(data)
    } catch {
      setMatches(mockMatches)
      setHasLoadError(true)
      toast.info('데이터 로딩에 실패하여 목데이터로 표시합니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMatches()
  }, [])

  const myLatestApplicationByMatch = useMemo(() => {
    const localUser = getLocalUser()
    const apps = getStoredApplications().filter((app) => app.userId === localUser.userId)

    const byMatch = new Map<string, { status: MatchApplicationStatus; requestedAt: string }>()
    apps.forEach((app) => {
      const existing = byMatch.get(app.matchId)
      if (!existing || new Date(app.requestedAt).getTime() > new Date(existing.requestedAt).getTime()) {
        byMatch.set(app.matchId, { status: app.status, requestedAt: app.requestedAt })
      }
    })
    return byMatch
  }, [])

  const filteredMatches = useMemo(() => {
    if (mode === 'ALL') return matches

    if (mode === 'TODAY') {
      const now = new Date()
      return matches.filter((match) => new Date(match.startAt).toDateString() === now.toDateString())
    }

    if (mode === 'WEEK') {
      return matches.filter((match) => isInThisWeek(new Date(match.startAt)))
    }

    const myMatches = matches.filter((match) => myLatestApplicationByMatch.has(match.id))
    if (myStatusFilter === 'ALL') return myMatches
    return myMatches.filter((match) => myLatestApplicationByMatch.get(match.id)?.status === myStatusFilter)
  }, [matches, mode, myLatestApplicationByMatch, myStatusFilter])

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Image
            src="/images/logo.jpg"
            alt="TeamUp Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">매치 찾기</h1>
            <p className="text-sm text-muted-foreground">오늘/이번 주 또는 내 신청 내역을 빠르게 확인하세요</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4 flex gap-2">
          <Button variant={mode === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setMode('ALL')}>
            전체
          </Button>
          <Button variant={mode === 'MY' ? 'default' : 'outline'} size="sm" onClick={() => setMode('MY')}>
            내 신청
          </Button>
          <Button variant={mode === 'TODAY' ? 'default' : 'outline'} size="sm" onClick={() => setMode('TODAY')}>
            오늘
          </Button>
          <Button variant={mode === 'WEEK' ? 'default' : 'outline'} size="sm" onClick={() => setMode('WEEK')}>
            이번 주
          </Button>
          <Link href="/host/matches" className="ml-auto">
            <Button variant="ghost" size="sm">주최자</Button>
          </Link>
        </div>
        {mode === 'MY' && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant={myStatusFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMyStatusFilter('ALL')}
            >
              전체
            </Button>
            <Button
              variant={myStatusFilter === 'PENDING_DEPOSIT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMyStatusFilter('PENDING_DEPOSIT')}
            >
              입금 대기
            </Button>
            <Button
              variant={myStatusFilter === 'CONFIRMED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMyStatusFilter('CONFIRMED')}
            >
              참가 확정
            </Button>
            <Button
              variant={myStatusFilter === 'CANCELLED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMyStatusFilter('CANCELLED')}
            >
              신청 취소
            </Button>
            <Button
              variant={myStatusFilter === 'REFUNDED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMyStatusFilter('REFUNDED')}
            >
              환불 완료
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : hasLoadError ? (
          <Card className="border-border/50">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-sm text-muted-foreground">매치 데이터를 불러오지 못했습니다.</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => void loadMatches()}>
                  새로고침
                </Button>
                <Link href="/host/matches/create">
                  <Button>호스트 생성 화면</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filteredMatches.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="space-y-4 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'MY'
                  ? myStatusFilter === 'ALL'
                    ? '내 신청 내역이 없습니다.'
                    : '선택한 상태의 내 신청 내역이 없습니다.'
                  : '조건에 맞는 매치가 없습니다.'}
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => void loadMatches()}>
                  새로고침
                </Button>
                <Link href="/host/matches/create">
                  <Button>호스트 생성 화면</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => {
              const occupancy = `${match.confirmedCount + match.pendingCount}/${match.capacity}`
              const myApplication = myLatestApplicationByMatch.get(match.id)
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/40">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{match.title}</h3>
                        <Badge variant={getMatchStatusVariant(match.status)}>{getMatchStatusLabel(match.status)}</Badge>
                      </div>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDateTimeKorean(match.startAt)}</p>
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.court.name}</p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4" />{occupancy}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{match.level}</Badge>
                          {myApplication && (
                            <Badge variant={getMyApplicationStatusVariant(myApplication.status)}>
                              {getMyApplicationStatusLabel(myApplication.status)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{match.fee.toLocaleString()}원</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

