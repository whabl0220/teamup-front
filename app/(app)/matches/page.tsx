'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
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

type MatchListMode = 'ALL' | 'MY' | 'TODAY' | 'WEEK'

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
  const [mode, setMode] = useState<MatchListMode>('ALL')

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await matchService.listMatches()
        setMatches(data)
      } catch {
        setMatches(mockMatches)
        toast.info('목데이터로 매치를 표시합니다.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
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

    const localUser = getLocalUser()
    const myAppMatchIds = new Set(
      getStoredApplications()
        .filter((app) => app.userId === localUser.userId && app.status !== 'REFUNDED')
        .map((app) => app.matchId)
    )
    return matches.filter((match) => myAppMatchIds.has(match.id))
  }, [matches, mode])

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

        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              {mode === 'MY' ? '내 신청 내역이 없습니다.' : '조건에 맞는 매치가 없습니다.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => {
              const start = new Date(match.startAt)
              const occupancy = `${match.confirmedCount + match.pendingCount}/${match.capacity}`
              return (
                <Link key={match.id} href={`/matches/${match.id}`}>
                  <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/40">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{match.title}</h3>
                        <Badge variant={getMatchStatusVariant(match.status)}>{getMatchStatusLabel(match.status)}</Badge>
                      </div>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{start.toLocaleDateString()}</p>
                        <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.court.name}</p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4" />{occupancy}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline">{match.level}</Badge>
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

