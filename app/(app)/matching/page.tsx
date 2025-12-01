'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Check } from 'lucide-react'
import type { Team } from '@/types'
import { TeamCard } from '@/components/shared/team-card'
import { mockMatchTeams } from '@/lib/mock-data'
import { getCurrentTeam, getAppData, getMatchedTeams, formatTimeAgo } from '@/lib/storage'
import { MatchedTeamsModal } from '@/components/shared/matched-teams-modal'

export default function MatchingPage() {
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showMatchedTeamsModal, setShowMatchedTeamsModal] = useState(false)

  // 현재 팀 및 팀장 권한 체크
  const team = getCurrentTeam()
  const appData = getAppData()
  const isTeamLeader = team && appData.user ? team.captainId === appData.user.id : false
  const currentTeam = team

  // 정식 팀 목록
  const matchTeams = mockMatchTeams

  // 매칭된 팀 목록
  const matchedTeams = getMatchedTeams()

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
        {/* AI 추천 안내 */}
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/10 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">AI 추천 팀</p>
            <p className="text-xs text-muted-foreground">매칭 점수 기반 정렬</p>
          </div>
        </div>

        {/* 팀 경기하기 */}
        {matchTeams.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">팀 경기하기</h2>
                <Badge className="bg-primary/10 text-primary text-xs">정식 팀</Badge>
              </div>
              {matchTeams.length > 2 && (
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
            <div className="space-y-3">
              {matchTeams.slice(0, 2).map((team) => (
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
        )}

        {/* 매칭된 팀 경기 */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <h2 className="font-bold text-foreground">매칭된 팀 경기</h2>
              <Badge className="bg-green-500/10 text-green-600 text-xs">수락됨</Badge>
            </div>
            {matchedTeams.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMatchedTeamsModal(true)}
                className="text-green-600 hover:text-green-700 hover:bg-green-500/20!"
              >
                전체
              </Button>
            )}
          </div>

          {matchedTeams.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  아직 매칭된 경기가 없습니다
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {matchedTeams.slice(0, 3).map((matched) => (
                <Card key={matched.id} className="border-green-500 bg-green-500/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-bold text-foreground">{matched.matchedTeam.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">레벨 {matched.matchedTeam.level}</Badge>
                          <span className="text-xs text-muted-foreground">{matched.matchedTeam.region}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimeAgo(matched.matchedAt)}에 매칭됨
                        </p>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{matched.matchedTeam.description}</p>
                    <div className="flex gap-2">
                      <Link href={`/team/${matched.matchedTeam.id}`} className="flex-1">
                        <Button variant="outline" className="w-full hover:bg-green-600! hover:text-white! hover:border-green-600!">
                          상세 보기
                        </Button>
                      </Link>
                      <Link href="/coaching/create" className="flex-1">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          경기 완료하기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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

      <BottomNav />
    </div>
  )
}
