'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Sparkles, Plus } from 'lucide-react'
import type { Team } from '@/types'
import { TeamCard } from '@/components/shared/team-card'
import { mockJoinTeams, mockMatchTeams } from '@/lib/mock-data'
import { getCurrentTeam, getAppData } from '@/lib/storage'

export default function MatchingPage() {
  const router = useRouter()
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // 현재 팀 정보
  const [teamName, setTeamName] = useState('세종 born')
  const [teamPhoto, setTeamPhoto] = useState('')
  const [teamId, setTeamId] = useState('1')

  // 팀장 권한 및 정식 팀 체크
  const [isTeamLeader, setIsTeamLeader] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)

  useEffect(() => {
    const team = getCurrentTeam()
    const appData = getAppData()

    if (team) {
      setCurrentTeam(team)
      setTeamName(team.name)
      setTeamId(team.id)
      if (team.logo) {
        setTeamPhoto(team.logo)
      }

      if (appData.user) {
        setIsTeamLeader(team.captainId === appData.user.id)
      }
    }
  }, [])

  // 팀 분류
  const joinTeams = mockJoinTeams // 모집 중
  const matchTeams = mockMatchTeams // 정식 팀

  const handleMatchRequest = (team: Team) => {
    if (!isTeamLeader) {
      alert('팀장만 매칭 요청을 보낼 수 있습니다.')
      return
    }
    if (!currentTeam?.isOfficial) {
      alert('정식 팀(5명 이상)만 매칭 요청을 보낼 수 있습니다.')
      return
    }
    setSelectedTeam(team)
    setShowMatchModal(true)
  }

  const confirmMatchRequest = () => {
    setShowMatchModal(false)
    alert(`${selectedTeam?.name}에 매칭 요청을 보냈습니다!`)
    // TODO: 실제 API 연동
    // await api.sendMatchRequest(selectedTeam.id, mockMyTeam.id, '경기 한 번 하시죠!')
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
                      {teamName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-foreground">{teamName}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">팀원 {currentTeam?.memberCount || 5}명</p>
                      <Badge variant="secondary" className="text-xs">레벨 {currentTeam?.level || 'A'}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-px border-t border-border/50 bg-border/50">
                  <div className="bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{currentTeam?.totalGames || 18}</p>
                    <p className="text-xs text-muted-foreground">총 경기</p>
                  </div>
                  <div className="bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{currentTeam?.aiReports || 14}</p>
                    <p className="text-xs text-muted-foreground">AI 리포트</p>
                  </div>
                  <div className="bg-card p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{currentTeam?.activeDays || 45}일</p>
                    <p className="text-xs text-muted-foreground">활동</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 팀 생성 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            팀 생성
          </h3>

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
                <h2 className="font-bold text-foreground">팀 경기하기</h2>
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

      <BottomNav />
    </div>
  )
}
