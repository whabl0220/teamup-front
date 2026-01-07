'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Check, Bot } from 'lucide-react'
import type { Team, MatchedTeam } from '@/types'
import { TeamCard } from '@/components/shared/team-card'
import { userService, teamService } from '@/lib/services'
import { formatTimeAgo } from '@/lib/utils'
import { MatchedTeamsModal } from '@/components/shared/matched-teams-modal'
import { MatchTeamsModal } from '@/components/shared/match-teams-modal'
import { toast } from 'sonner'

export default function MatchingPage() {
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showMatchedTeamsModal, setShowMatchedTeamsModal] = useState(false)
  const [showMatchTeamsModal, setShowMatchTeamsModal] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isTeamLeader, setIsTeamLeader] = useState(false)
  const [matchedTeams, setMatchedTeams] = useState<MatchedTeam[]>([])
  const [matchTeams, setMatchTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 클라이언트에서만 데이터 로드 (hydration 오류 방지)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadData = async () => {
      try {
        // 현재 사용자 정보 조회
        const user = await userService.getMe()

        // 내 팀 목록 조회
        const teams = await teamService.getMyTeams()
        const team = teams.length > 0 ? teams[0] : null
        setCurrentTeam(team)
        setIsTeamLeader(team ? String(team.captainId) === String(user.id) : false)
        
        // 매칭된 팀 정보 (향후 API 추가 필요)
        setMatchedTeams([])

      // API에서 매칭 추천 팀 조회
      if (team?.id) {
        setIsLoading(true)
        try {
          const suggestions = await teamService.getMatchSuggestions(Number(team.id))

          // API 응답을 Team 타입으로 변환
          const teams: Team[] = suggestions.map(s => ({
            id: s.teamId.toString(),
            name: s.name,
            shortName: s.name.substring(0, 2).toUpperCase(),
            memberCount: s.memberCount,
            maxMembers: 10, // API에 없으면 기본값
            level: 'B', // API에 없으면 기본값
            region: '서울', // API에 없으면 기본값
            totalGames: 0,
            aiReports: 0,
            activeDays: 0,
            isOfficial: s.memberCount >= 5,
            captainId: 'unknown',
            description: '',
            matchScore: 90,
            teamDna: s.teamDna as 'BULLS' | 'WARRIORS' | 'SPURS',
            teamLevel: s.teamLevel,
            teamExp: 0,
          }))

          setMatchTeams(teams)
        } catch (err) {
          console.error('매칭 추천 팀 조회 실패:', err)
          toast.error('추천 팀을 불러오는데 실패했습니다.')
        } finally {
          setIsLoading(false)
        }
      }
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        toast.error('데이터를 불러오는데 실패했습니다.')
      }
    }

    loadData()
  }, [])

  const handleMatchRequest = (team: Team) => {
    if (!isTeamLeader) {
      toast.error("권한 없음", {
        description: "팀장만 매칭 요청을 보낼 수 있습니다.",
      })
      return
    }
    setSelectedTeam(team)
    setShowMatchModal(true)
  }

  const confirmMatchRequest = async () => {
    if (!selectedTeam || !currentTeam) return

    try {
      // 게임 생성 API 호출
      const response = await teamService.createGame({
        homeTeamId: Number(currentTeam.id),
        awayTeamId: Number(selectedTeam.id),
      })

      setShowMatchModal(false)
      toast.success("게임 생성 완료", {
        description: `${selectedTeam.name}와(과)의 경기가 생성되었습니다!`,
      })

      // 매칭된 팀 목록 업데이트 (향후 API 추가 필요)
      setMatchedTeams((prev) => [
        ...prev,
        {
          id: response.gameId.toString(),
          myTeamId: currentTeam.id,
          matchedTeam: selectedTeam,
          matchedAt: new Date().toISOString(),
          requestId: response.gameId.toString(),
        },
      ])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게임 생성에 실패했습니다.'
      toast.error('게임 생성 실패', {
        description: errorMessage,
      })
    }
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
        {/* AI 추천 안내 */}
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-500/10 p-4 border border-orange-500/20">
          <Bot className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm font-semibold text-foreground">AI 추천 팀</p>
            <p className="text-xs text-muted-foreground">매칭 점수 기반 정렬</p>
          </div>
        </div>

        {/* 팀 경기하기 */}
        {isLoading ? (
          <div className="mb-6 space-y-3">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">팀 경기하기</h2>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-secondary/30" />
            ))}
          </div>
        ) : matchTeams.length > 0 ? (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">팀 경기하기</h2>
                <Badge className="bg-primary/10 text-primary text-xs">정식 팀</Badge>
              </div>
              {matchTeams.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMatchTeamsModal(true)}
                  className="text-primary hover:text-primary"
                >
                  전체
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {matchTeams.slice(0, 3).map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  actionButton={{
                    label: '매칭하기',
                    onClick: () => handleMatchRequest(team),
                    variant: 'outline'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-border/50 bg-secondary/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">추천 팀이 없습니다.</p>
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

      {/* 매칭된 팀 전체 모달 */}
      <MatchedTeamsModal
        open={showMatchedTeamsModal}
        onOpenChange={setShowMatchedTeamsModal}
        matchedTeams={matchedTeams}
      />

      {/* AI 추천 팀 전체 모달 */}
      <MatchTeamsModal
        open={showMatchTeamsModal}
        onOpenChange={setShowMatchTeamsModal}
        teams={matchTeams}
        onMatchRequest={handleMatchRequest}
      />

      <BottomNav />
    </div>
  )
}
