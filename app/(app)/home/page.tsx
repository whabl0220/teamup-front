'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MessageCircle, MapPin, Bell, Users, Trophy, TrendingUp, Plus, UserPlus } from 'lucide-react'
import { getReceivedMatchRequests, getLatestMatchRequest, formatTimeAgo, initMockData, getCurrentUser, getCurrentTeamStats } from '@/lib/storage'
import type { MatchRequest, Team } from '@/types'

export default function HomePage() {
  // TODO: 실제로는 API로 팀 보유 여부 체크
  const [hasTeam, setHasTeam] = useState(true) // Mock: 팀 있음 상태로 시작

  // 매칭 요청 관련 상태
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [latestRequest, setLatestRequest] = useState<MatchRequest | null>(null)

  // 팀 정보 및 통계
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [teamStats, setTeamStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Mock 데이터 초기화 (한 번만 실행)
    const hasInitialized = localStorage.getItem('teamup_initialized')
    if (!hasInitialized) {
      initMockData()
      localStorage.setItem('teamup_initialized', 'true')
    }

    // 매칭 요청 로드
    const loadData = () => {
      const requests = getReceivedMatchRequests()
      setMatchRequests(requests)
      setLatestRequest(getLatestMatchRequest())

      // 팀 정보 및 통계 로드
      const user = getCurrentUser()
      const team = user?.team || null
      setCurrentTeam(team)
      setHasTeam(!!team) // 팀 유무 체크
      setTeamStats(getCurrentTeamStats())
    }

    loadData()
  }, [])

  // 팀 없음 상태
  if (!hasTeam) {
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
              <h1 className="text-2xl font-bold tracking-tight">TeamUp</h1>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              AI Powered
            </Badge>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-6">
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-balance">아직 팀이 없습니다</h2>
            <p className="mb-8 text-muted-foreground text-balance">
              팀을 만들거나 기존 팀에 참여하여<br />AI 매칭과 코칭을 시작하세요
            </p>

            <div className="flex w-full max-w-sm flex-col gap-3">
              <Link href="/team/create" className="w-full">
                <Button className="w-full font-semibold" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  팀 생성하기
                </Button>
              </Link>
              <Link href="/map" className="w-full">
                <Button variant="outline" className="w-full font-semibold" size="lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  팀 참여하기
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  // 팀 있음 상태
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
            <h1 className="text-2xl font-bold tracking-tight">TeamUp</h1>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            AI Powered
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">

        {/* 내 팀 정보 카드 */}
        {currentTeam && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              내 팀 정보
            </h3>
            <Link href={`/team/${currentTeam.id}`}>
              <Card className="cursor-pointer border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                        <Trophy className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{currentTeam.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            레벨 {currentTeam.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{currentTeam.region}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 rounded-xl bg-background/50 p-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{teamStats.totalGames}</p>
                      <p className="text-xs text-muted-foreground">경기</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{teamStats.wins}</p>
                      <p className="text-xs text-muted-foreground">승</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{teamStats.losses}</p>
                      <p className="text-xs text-muted-foreground">패</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <p className="text-lg font-bold text-primary">{teamStats.winRate}%</p>
                      </div>
                      <p className="text-xs text-muted-foreground">승률</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* 주요 기능 설명 카드 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            주요 기능
          </h3>

          <div className="grid gap-3">
            <Link href="/matching">
              <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-bold text-foreground">팀 매칭</h4>
                      <p className="text-xs text-muted-foreground">
                        내 팀 관리, 팀 찾기, AI 추천 매칭
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/map">
              <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-bold text-foreground">지도</h4>
                      <p className="text-xs text-muted-foreground">
                        주변 팀과 농구장 찾기
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* 최근 알림 */}
        {latestRequest && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              최근 알림
            </h3>

            <Link href="/notifications">
              <Card className="cursor-pointer border-primary/50 bg-primary/5 transition-all hover:border-primary">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">새로운 매칭 요청</p>
                      <Badge className="bg-primary text-xs">
                        {matchRequests.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {latestRequest.fromTeam.name}가 매칭을 신청했습니다
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {formatTimeAgo(latestRequest.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
