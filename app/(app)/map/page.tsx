'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, MessageCircle, UserPlus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getCurrentTeam, getAppData } from '@/lib/storage'

const nearbyTeams = [
  { name: '세종 born_9', date: '5월 11일', time: '오후 6시', location: '광진구 능동로', level: 'A', isOfficial: true, members: 5, maxMembers: 5 },
  { name: '세종 born_10', date: '5월 12일', time: '오후 7시', location: '광진구 능동로', level: 'A+', isOfficial: false, members: 3, maxMembers: 5 },
  { name: '세종 born_11', date: '5월 13일', time: '오후 8시', location: '광진구 능동로', level: 'A-', isOfficial: true, members: 5, maxMembers: 5 },
]

const nearbyCourts = [
  { name: '광진 농구장', address: '서울 광진구 능동로 123', type: '실외' },
  { name: '워커힐 체육관', address: '서울 광진구 워커힐로 177', type: '실내' },
  { name: '능동 체육공원', address: '서울 광진구 능동로 216', type: '실외' },
]

export default function MapPage() {
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; level: string; location: string } | null>(null)

  // 팀장 권한 체크 (초기 상태 계산)
  const [isTeamLeader] = useState(() => {
    const currentTeam = getCurrentTeam()
    const appData = getAppData()
    if (currentTeam && appData.user) {
      return currentTeam.captainId === appData.user.id
    }
    return false
  })

  const handleMatchRequest = (team: typeof nearbyTeams[0]) => {
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

  const handleJoinTeam = (teamName: string) => {
    alert(`${teamName}에 참여 신청을 보냈습니다!`)
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
              {nearbyTeams.slice(0, 1).map((team, index) => (
                <Card key={index} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#181B1F]">
                        <Users className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">레벨 {team.level}</Badge>
                          {team.isOfficial ? (
                            <Badge className="bg-primary/10 text-xs text-primary">정식 팀</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              모집 중 {team.members}/{team.maxMembers}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 rounded-lg bg-secondary/30 p-2 text-sm space-y-1">
                          <p><span className="text-muted-foreground">일정:</span> {team.date} {team.time}</p>
                          <p><span className="text-muted-foreground">장소:</span> {team.location}</p>
                        </div>

                        <div className="flex flex-col gap-2 mt-3">
                          {team.isOfficial ? (
                            <Button
                              className="w-full font-semibold bg-[#181B1F] text-white hover:bg-[#FF6F1C] hover:text-black transition-colors"
                              onClick={() => handleMatchRequest(team)}
                            >
                              매칭하기
                            </Button>
                          ) : (
                            <Button
                              className="w-full font-semibold bg-[#181B1F] hover:bg-[#181B1F]/90 text-white"
                              onClick={() => handleJoinTeam(team.name)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              팀 참여하기
                            </Button>
                          )}
                          <Link href={`/team/${team.name}`} className="w-full">
                            <Button variant="default" className="w-full">상세 보기</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                <p>장소: {selectedTeam.location}</p>
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
