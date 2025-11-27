'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Search, Plus, Users, MapPin, AlertCircle } from 'lucide-react'
import type { Team, MatchRequest } from '@/types'

// Mock 데이터 (나중에 API로 교체)
const mockMyTeam: Team = {
  id: '1',
  name: '세종 born',
  shortName: 'SB',
  memberCount: 5,
  maxMembers: 5,
  level: 'A',
  region: '광진구 능동',
  totalGames: 18,
  aiReports: 14,
  activeDays: 45,
  isOfficial: true,
  captainId: 'user1',
  description: '세종대 기반 농구 동호회',
}

const mockTeams: Team[] = [
  {
    id: '2',
    name: '세종 Warriors',
    shortName: 'SW',
    region: '광진구 능동',
    level: 'A',
    matchScore: 95,
    memberCount: 5,
    maxMembers: 5,
    isOfficial: true,
    captainId: 'user2',
    description: '주말 오후에 활동하는 친목 위주 팀입니다.',
    totalGames: 20,
    aiReports: 15,
    activeDays: 60,
  },
  {
    id: '3',
    name: '강남 Thunder',
    shortName: 'GT',
    region: '강남구 역삼',
    level: 'A+',
    matchScore: 92,
    memberCount: 4,
    maxMembers: 5,
    isOfficial: false,
    captainId: 'user3',
    description: '1명 모집 중! 가드 포지션 우대합니다.',
    totalGames: 25,
    aiReports: 20,
    activeDays: 80,
  },
  {
    id: '4',
    name: '관악 Hoops',
    shortName: 'GH',
    region: '관악구 신림',
    level: 'B+',
    matchScore: 88,
    memberCount: 5,
    maxMembers: 5,
    isOfficial: true,
    captainId: 'user4',
    description: '주 2회 정기 경기를 진행합니다.',
    totalGames: 15,
    aiReports: 12,
    activeDays: 40,
  },
  {
    id: '5',
    name: '송파 Dunk',
    shortName: 'SD',
    region: '송파구 잠실',
    level: 'A',
    matchScore: 90,
    memberCount: 5,
    maxMembers: 5,
    isOfficial: true,
    captainId: 'user5',
    description: '잠실 코트에서 주로 활동합니다.',
    totalGames: 22,
    aiReports: 18,
    activeDays: 55,
  },
]

const mockMatchRequests: MatchRequest[] = [
  {
    id: '101',
    fromTeam: mockTeams[3], // 송파 Dunk
    toTeam: mockMyTeam,
    message: '이번 주말 경기 어떠신가요?',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
  }
]

export default function MatchingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTeams, setFilteredTeams] = useState<Team[]>(mockTeams)
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>(mockMatchRequests)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // 검색 필터링
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = mockTeams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.region.toLowerCase().includes(query) ||
      team.level.toLowerCase().includes(query)
    )
    setFilteredTeams(filtered)
  }, [searchQuery])

  // TODO: 실제 API 연동
  // useEffect(() => {
  //   const loadData = async () => {
  //     const teams = await api.searchTeams(searchQuery)
  //     const requests = await api.getMatchRequests()
  //     setFilteredTeams(teams)
  //     setMatchRequests(requests)
  //   }
  //   loadData()
  // }, [searchQuery])

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

  const handleAcceptRequest = (requestId: string) => {
    alert('매칭 요청을 수락했습니다!')
    setMatchRequests(prev => prev.filter(r => r.id !== requestId))
    // TODO: 실제 API 연동
    // await api.acceptMatchRequest(requestId)
  }

  const handleRejectRequest = (requestId: string) => {
    alert('매칭 요청을 거절했습니다.')
    setMatchRequests(prev => prev.filter(r => r.id !== requestId))
    // TODO: 실제 API 연동
    // await api.rejectMatchRequest(requestId)
  }

  const getTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">팀 매칭</h1>
            <p className="text-sm text-muted-foreground">AI가 추천하는 최적의 팀</p>
          </div>
          <Link href="/team/create">
            <Button size="sm" className="font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              팀 생성
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* 받은 매칭 요청 */}
        {matchRequests.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">받은 매칭 요청</h2>
              <Badge className="bg-primary">{matchRequests.length}</Badge>
            </div>
            <div className="space-y-3">
              {matchRequests.map((request) => (
                <Card key={request.id} className="border-primary/50 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 font-bold text-foreground">{request.fromTeam.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">레벨 {request.fromTeam.level}</Badge>
                          <span className="text-xs text-muted-foreground">{request.fromTeam.region}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{getTimeAgo(request.createdAt)}</span>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{request.message}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        거절
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        수락하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="팀 이름, 지역, 레벨로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* AI 추천 안내 */}
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/10 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">AI 추천 팀</p>
            <p className="text-xs text-muted-foreground">매칭 점수 기반 정렬</p>
          </div>
        </div>

        {/* 팀 목록 */}
        {filteredTeams.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="group border-border/50 bg-card transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-bold text-foreground">{team.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            레벨 {team.level}
                          </Badge>
                          {team.isOfficial ? (
                            <Badge className="bg-primary/10 text-xs text-primary">
                              정식 팀
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              모집 중
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {team.memberCount}/{team.maxMembers}명
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{team.matchScore}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">매칭</p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{team.region}</span>
                  </div>

                  <p className="mb-3 text-sm text-muted-foreground">{team.description}</p>

                  {team.isOfficial ? (
                    <Button
                      className="w-full font-semibold"
                      size="lg"
                      onClick={() => handleMatchRequest(team)}
                    >
                      매칭하기
                    </Button>
                  ) : (
                    <Link href={`/team/${team.id}`} className="block">
                      <Button variant="outline" className="w-full font-semibold" size="lg">
                        참여하기
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
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
