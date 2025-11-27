'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, AlertCircle, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { getReceivedMatchRequests, updateMatchRequestStatus, formatTimeAgo, getMatchedTeams } from '@/lib/storage'
import type { Team, MatchRequest, MatchedTeam } from '@/types'
import { MatchRequestsModal } from '@/components/shared/match-requests-modal'
import { TeamCard } from '@/components/shared/team-card'
import { mockMyTeam, mockJoinTeams, mockMatchTeams } from '@/lib/mock-data'

export default function MatchingPage() {
  const router = useRouter()
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [matchedTeams, setMatchedTeams] = useState<MatchedTeam[]>([])
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showAllRequestsModal, setShowAllRequestsModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // 팀 분류
  const joinTeams = mockJoinTeams // 모집 중
  const matchTeams = mockMatchTeams // 정식 팀

  const loadMatchRequests = () => {
    const requests = getReceivedMatchRequests()
    setMatchRequests(requests)
    const matched = getMatchedTeams()
    setMatchedTeams(matched)
  }

  // localStorage에서 받은 매칭 요청 로드
  useEffect(() => {
    loadMatchRequests()
  }, [])

  // TODO: 실제 API 연동
  // useEffect(() => {
  //   const loadData = async () => {
  //     const teams = await api.getRecommendedTeams()
  //     const matched = await api.getMatchedTeams()
  //     setMatchRequests(await api.getMatchRequests())
  //   }
  //   loadData()
  // }, [])

  const handleMatchRequest = (team: Team) => {
    setSelectedTeam(team)
    setShowMatchModal(true)
  }

  const confirmMatchRequest = () => {
    setShowMatchModal(false)
    alert(`${selectedTeam?.name}에 매칭 요청을 보냈습니다!`)
    // TODO: 실제 API 연동
    // await api.sendMatchRequest(selectedTeam.id, mockMyTeam.id, '경기 한 번 하시죠!')
  }

  const handleAcceptRequest = (requestId: string, teamName: string) => {
    updateMatchRequestStatus(requestId, 'accepted')
    toast.success(`${teamName}의 매칭 요청을 수락했습니다!`)
    loadMatchRequests()
    // TODO: 실제 API 연동
    // await api.acceptMatchRequest(requestId)
  }

  const handleRejectRequest = (requestId: string) => {
    updateMatchRequestStatus(requestId, 'rejected')
    toast.success('매칭 요청을 거절했습니다')
    loadMatchRequests()
    // TODO: 실제 API 연동
    // await api.rejectMatchRequest(requestId)
  }

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
            <h1 className="text-2xl font-bold tracking-tight">팀 매칭</h1>
            <p className="text-sm text-muted-foreground">AI가 추천하는 최적의 팀</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* 받은 매칭 요청 */}
        {matchRequests.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">받은 매칭 요청</h2>
                <Badge className="bg-primary">{matchRequests.length}</Badge>
              </div>
              {matchRequests.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRequestsModal(true)}
                  className="text-primary hover:text-primary"
                >
                  전체
                </Button>
              )}
            </div>
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 font-bold text-foreground">{matchRequests[0].fromTeam.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">레벨 {matchRequests[0].fromTeam.level}</Badge>
                      <span className="text-xs text-muted-foreground">{matchRequests[0].fromTeam.region}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(matchRequests[0].createdAt)}</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{matchRequests[0].message}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRejectRequest(matchRequests[0].id)}
                  >
                    거절
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleAcceptRequest(matchRequests[0].id, matchRequests[0].fromTeam.name)}
                  >
                    수락하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI 추천 안내 */}
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/10 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">AI 추천 팀</p>
            <p className="text-xs text-muted-foreground">매칭 점수 기반 정렬</p>
          </div>
        </div>

        {/* 팀 참여하기 */}
        {joinTeams.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">팀 참여하기</h2>
                <Badge variant="secondary" className="text-xs">모집 중</Badge>
              </div>
              {joinTeams.length > 1 && (
                <Link href="/matching/join">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary"
                  >
                    전체
                  </Button>
                </Link>
              )}
            </div>
            <TeamCard
              team={joinTeams[0]}
              actionButton={{
                label: '참여하기',
                onClick: () => router.push(`/team/${joinTeams[0].id}`),
                variant: 'outline'
              }}
            />
          </div>
        )}

        {/* 팀 매칭하기 */}
        {matchTeams.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">팀 매칭하기</h2>
                <Badge className="bg-primary/10 text-primary text-xs">정식 팀</Badge>
              </div>
              {matchTeams.length > 1 && (
                <Link href="/matching/teams">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary"
                  >
                    전체
                  </Button>
                </Link>
              )}
            </div>
            <TeamCard
              team={matchTeams[0]}
              actionButton={{
                label: '매칭하기',
                onClick: () => handleMatchRequest(matchTeams[0]),
                variant: 'outline'
              }}
            />
          </div>
        )}

        {/* 매칭된 팀 */}
        {matchedTeams.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <h2 className="font-bold text-foreground">매칭된 팀</h2>
                <Badge className="bg-green-500/10 text-green-600 text-xs">수락됨</Badge>
              </div>
              {matchedTeams.length > 1 && (
                <Link href="/matching/matched">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:!bg-green-500/20"
                  >
                    전체
                  </Button>
                </Link>
              )}
            </div>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-foreground">{matchedTeams[0].matchedTeam.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">레벨 {matchedTeams[0].matchedTeam.level}</Badge>
                      <span className="text-xs text-muted-foreground">{matchedTeams[0].matchedTeam.region}</span>
                    </div>
                  </div>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{matchedTeams[0].matchedTeam.description}</p>
                <Link href={`/team/${matchedTeams[0].matchedTeam.id}`}>
                  <Button variant="outline" className="w-full hover:!bg-green-600 hover:!text-white hover:!border-green-600">팀 상세보기</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* 매칭 요청 모달 */}
      {showMatchModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-bold text-foreground">매칭 요청</h3>
              <div className="mb-6">
                <p className="mb-2 text-sm text-muted-foreground">상대 팀</p>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="font-bold text-foreground">{selectedTeam.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTeam.region}</p>
                </div>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                이 팀에 매칭 요청을 보낼까요?<br />
                상대 팀이 수락하면 팀장끼리 카카오톡으로 연락할 수 있습니다.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowMatchModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmMatchRequest}
                >
                  요청 보내기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 받은 매칭 요청 전체 모달 */}
      <MatchRequestsModal
        open={showAllRequestsModal}
        onOpenChange={setShowAllRequestsModal}
        matchRequests={matchRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />

      <BottomNav />
    </div>
  )
}
