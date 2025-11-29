'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getCurrentTeam, getAppData } from '@/lib/storage'
import { TeamCard } from '@/components/shared/team-card'
import type { Team } from '@/types'

const nearbyTeams: Team[] = [
  {
    id: '6',
    name: '관악 Thunders',
    shortName: 'GT',
    level: 'A',
    region: '광진구 능동로',
    memberCount: 5,
    maxMembers: 10,
    isOfficial: true,
    description: '주말 오후에 활동하는 친목 위주 팀입니다',
    matchScore: 95,
    captainId: 'captain_6',
    totalGames: 20,
    aiReports: 15,
    activeDays: 60
  },
  {
    id: '7',
    name: '강남 Warriors',
    shortName: 'GW',
    level: 'A+',
    region: '광진구 능동로',
    memberCount: 3,
    maxMembers: 10,
    isOfficial: false,
    description: '경쟁적인 플레이를 추구하는 팀',
    matchScore: 88,
    captainId: 'captain_7',
    totalGames: 15,
    aiReports: 10,
    activeDays: 45
  },
  {
    id: '8',
    name: '송파 Dragons',
    shortName: 'SD',
    level: 'A',
    region: '광진구 능동로',
    memberCount: 5,
    maxMembers: 10,
    isOfficial: true,
    description: '승부욕 강한 경쟁 중심 팀',
    matchScore: 92,
    captainId: 'captain_8',
    totalGames: 25,
    aiReports: 18,
    activeDays: 75
  },
]

const nearbyCourts = [
  { name: '광진 농구장', address: '서울 광진구 능동로 123', type: '실외' },
  { name: '워커힐 체육관', address: '서울 광진구 워커힐로 177', type: '실내' },
  { name: '능동 체육공원', address: '서울 광진구 능동로 216', type: '실외' },
]

export default function MapPage() {
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // 팀장 권한 체크 (초기 상태 계산)
  const [isTeamLeader] = useState(() => {
    const currentTeam = getCurrentTeam()
    const appData = getAppData()
    if (currentTeam && appData.user) {
      return currentTeam.captainId === appData.user.id
    }
    return false
  })

  const handleMatchRequest = (team: Team) => {
    if (!isTeamLeader) {
      alert('팀장만 매칭 요청을 보낼 수 있습니다.')
      return
    }
    setSelectedTeam(team)
    setShowMatchModal(true)
  }

  const confirmMatchRequest = () => {
    setShowMatchModal(false)
    alert(`${selectedTeam?.name}에 매칭 요청을 보냈습니다!`)
    // TODO: 실제 매칭 요청 로직 구현
  }

  const handleJoinRequest = (team: Team) => {
    alert(`${team.name}에 참여 신청을 보냈습니다!`)
    // TODO: 실제 팀 참여 로직 구현
  }
  return (
    <>
      <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">지도</h1>
            <p className="text-sm text-muted-foreground">근처 팀과 경기장을 찾아보세요</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg">
        {/* 지도 영역 (나중에 API 연동) */}
        <div className="h-[300px] w-full bg-muted/30 flex items-center justify-center border-b border-border/50">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">지도 API 연동 예정</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Nearby Courts */}
          <div>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-foreground">주변 농구장</h2>
            </div>

            <div className="space-y-3">
              {nearbyCourts.slice(0, 2).map((court, index) => (
                <Card key={index} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#181B1F]">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{court.name}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs">{court.type}</Badge>
                        <p className="mt-1 text-sm text-muted-foreground">{court.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Nearby Teams */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">내 근처 팀</h2>
              <Link href="/map/teams">
                <Button variant="ghost" size="sm" className="text-primary">
                  전체 보기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {nearbyTeams.slice(0, 1).map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  actionButton={{
                    label: team.isOfficial ? '매칭하기' : '참여하기',
                    onClick: () => team.isOfficial ? handleMatchRequest(team) : handleJoinRequest(team),
                    variant: 'outline'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>

    {/* 매칭 요청 모달 */}
    {showMatchModal && selectedTeam && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-sm border-border/50 bg-card">
          <CardContent className="p-6">
            <h3 className="mb-4 text-xl font-bold text-foreground">매칭 요청</h3>

            <div className="mb-4 rounded-lg bg-secondary/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-foreground">{selectedTeam.name}</h4>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>레벨: {selectedTeam.level}</p>
                <p>지역: {selectedTeam.region}</p>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              이 팀에 매칭 요청을 보내시겠습니까?
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
    </>
  )
}
