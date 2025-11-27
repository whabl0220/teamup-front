'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MessageCircle, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getReceivedMatchRequests, getLatestMatchRequest, formatTimeAgo, initMockData, updateMatchRequestStatus } from '@/lib/storage'
import type { MatchRequest } from '@/types'
import { MatchRequestsModal } from '@/components/shared/match-requests-modal'

export default function HomePage() {
  // TODO: 실제로는 API로 팀 보유 여부 체크
  const [hasTeam, setHasTeam] = useState(true) // Mock: 팀 있음 상태로 시작
  const [teamName, setTeamName] = useState('세종 born')
  const [teamPhoto, setTeamPhoto] = useState('')
  const [teamId, setTeamId] = useState('1') // Mock 팀 ID

  // 매칭 요청 관련 상태
  const [showMatchRequestsModal, setShowMatchRequestsModal] = useState(false)
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

    // localStorage에서 팀 정보 로드
    const savedName = localStorage.getItem('teamName')
    const savedPhoto = localStorage.getItem('teamPhoto')
    if (savedName) setTeamName(savedName)
    if (savedPhoto) setTeamPhoto(savedPhoto)

    // 팀 ID 로드
    const appDataStr = localStorage.getItem('teamup_app_data')
    if (appDataStr) {
      const appData = JSON.parse(appDataStr)
      const currentTeamId = appData.user?.currentTeamId
      if (currentTeamId) setTeamId(currentTeamId)
    }

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
                  <Search className="mr-2 h-5 w-5" />
                  팀 찾기
                </Button>
              </Link>
              <Link href="/team/create" className="w-full">
                <Button variant="outline" className="w-full font-semibold" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  팀 생성하기
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

        {/* 내 팀 섹션 */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            내 팀
          </h3>

          <Link href={`/team/${teamId}`}>
            <Card className="cursor-pointer overflow-hidden border-border/50 bg-card transition-all hover:border-primary/50">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {teamPhoto ? (
                    <img src={teamPhoto} alt="Team" className="h-16 w-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                      SB
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-foreground">{teamName}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">팀원 5명</p>
                      <Badge variant="secondary" className="text-xs">레벨 A</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-px border-t border-border/50 bg-border/50">
                  <div className="bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">18</p>
                    <p className="text-xs text-muted-foreground">총 경기</p>
                  </div>
                  <div className="bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">14</p>
                    <p className="text-xs text-muted-foreground">AI 리포트</p>
                  </div>
                  <div className="bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">45일</p>
                    <p className="text-xs text-muted-foreground">활동</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 팀 검색 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            팀 찾기
          </h3>

          <div className="space-y-3">
            <Link href="/matching">
              <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-bold text-foreground">팀 찾기</h4>
                      <p className="text-xs text-muted-foreground">
                        AI 추천 팀을 확인하고 매칭하세요
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/team/create">
              <Card className="cursor-pointer overflow-hidden border-border/50 bg-card transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-bold text-foreground">팀 생성하기</h4>
                      <p className="text-xs text-muted-foreground">
                        새로운 팀을 만들고 팀원을 모집하세요
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

        {/* 최근 활동 */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            최근 활동
          </h3>

          <div className="space-y-2">
            {latestRequest ? (
              <Card
                className="cursor-pointer border-border/50 bg-card transition-all hover:border-primary/50"
                onClick={() => setShowMatchRequestsModal(true)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">새로운 매칭 요청</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
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
            ) : (
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">최근 활동이 없습니다</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <BottomNav />

      {/* 받은 매칭 요청 모달 */}
      <MatchRequestsModal
        open={showMatchRequestsModal}
        onOpenChange={setShowMatchRequestsModal}
        matchRequests={matchRequests}
        onAccept={(requestId, teamName) => {
          updateMatchRequestStatus(requestId, 'accepted')
          toast.success(`${teamName}의 매칭 요청을 수락했습니다!`)
          loadMatchRequests()
        }}
        onReject={(requestId) => {
          updateMatchRequestStatus(requestId, 'rejected')
          toast.success('매칭 요청을 거절했습니다')
          loadMatchRequests()
        }}
      />
    </div>
  )
}
