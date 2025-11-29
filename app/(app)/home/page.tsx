'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MessageCircle, MapPin, Bell, Users } from 'lucide-react'
import { getReceivedMatchRequests, getLatestMatchRequest, formatTimeAgo, initMockData } from '@/lib/storage'
import type { MatchRequest } from '@/types'

export default function HomePage() {
  // TODO: 실제로는 API로 팀 보유 여부 체크
  const [hasTeam, setHasTeam] = useState(true) // Mock: 팀 있음 상태로 시작
  const [teamName, setTeamName] = useState('세종 born')

  // 매칭 요청 관련 상태
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [latestRequest, setLatestRequest] = useState<MatchRequest | null>(null)

  const loadMatchRequests = () => {
    const requests = getReceivedMatchRequests()
    setMatchRequests(requests)
    setLatestRequest(getLatestMatchRequest())
  }

  useEffect(() => {
    // Mock 데이터 초기화 (개발용)
    // TODO: 테스트 후 아래 주석 해제하여 한 번만 실행되게 변경
    // const hasInitialized = localStorage.getItem('teamup_initialized')
    // if (!hasInitialized) {
    //   initMockData()
    //   localStorage.setItem('teamup_initialized', 'true')
    // }

    // 임시: 항상 초기화 (매칭 요청 3개 보기 위해)
    initMockData()

    // 매칭 요청 로드
    loadMatchRequests()
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
              <Sparkles className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-balance">아직 팀이 없습니다</h2>
            <p className="mb-8 text-foreground text-balance">
              팀을 만들거나 기존 팀에 참여하여<br />AI 매칭과 코칭을 시작하세요
            </p>

            <div className="flex w-full max-w-sm flex-col gap-3">
              <Link href="/matching" className="w-full">
                <Button className="w-full font-semibold" size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  팀 매칭 바로가기
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

            <Link href="/notifications">
              <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-bold text-foreground">알림</h4>
                      <p className="text-xs text-muted-foreground">
                        매칭 요청 및 알림 확인
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* 최근 AI 코칭 */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">최근 AI 코칭</h3>
          </div>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">8월 10일 경기 분석</p>
                  <p className="text-xs text-muted-foreground">{teamName} vs 서울 Tigers</p>
                </div>
                <Badge className="bg-primary/10 text-primary">승리</Badge>
              </div>

              <div className="mb-3 space-y-2">
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-primary">강점:</span> 팀워크가 우수하며 빠른 공격 전환이 돋보였습니다.
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-muted-foreground">개선점:</span> 수비 리바운드 강화가 필요합니다.
                  </p>
                </div>
              </div>

              <Link href="/coaching">
                <Button variant="outline" size="sm" className="w-full">
                  전체 코칭 보기
                </Button>
              </Link>
            </CardContent>
          </Card>
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
