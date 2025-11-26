'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, MapPin, Users, Calendar, MessageCircle, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function MatchingPage() {
  const [teamName] = useState('세종 born')
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  // Mock: 매칭 성공한 팀들
  const matchedTeams = [
    {
      id: 1,
      name: '관악 Thunders',
      location: '관악구 봉천동',
      distance: '1.2km',
      members: 6,
      level: 'A',
      matchDate: '2025.01.28',
      matchTime: '14:00',
      status: 'confirmed',
      avatar: null,
      kakaoId: 'thunder_captain',
      totalMatches: 18,
      aiReports: 14,
      activeDays: 45,
      teamMembers: [
        { name: '김민준', position: '포워드', isLeader: true },
        { name: '박서연', position: '가드', isLeader: false },
        { name: '이도윤', position: '센터', isLeader: false },
        { name: '정하은', position: '가드', isLeader: false },
        { name: '최예준', position: '포워드', isLeader: false },
        { name: '장서우', position: '센터', isLeader: false },
      ],
    },
    {
      id: 2,
      name: '강남 Warriors',
      location: '강남구 역삼동',
      distance: '3.5km',
      members: 8,
      level: 'S',
      matchDate: '2025.01.25',
      matchTime: '16:00',
      status: 'pending',
      avatar: null,
      kakaoId: 'warrior_leader',
      totalMatches: 32,
      aiReports: 28,
      activeDays: 120,
      teamMembers: [
        { name: '강지호', position: '포워드', isLeader: true },
        { name: '윤서아', position: '가드', isLeader: false },
        { name: '조민서', position: '센터', isLeader: false },
        { name: '임시현', position: '가드', isLeader: false },
        { name: '한준우', position: '포워드', isLeader: false },
        { name: '송지안', position: '센터', isLeader: false },
        { name: '백현우', position: '가드', isLeader: false },
        { name: '오수빈', position: '포워드', isLeader: false },
      ],
    },
  ]

  const handleCopyKakaoId = async (kakaoId: string) => {
    try {
      await navigator.clipboard.writeText(kakaoId)
      setCopied(true)
      toast.success('카카오톡 ID가 복사되었습니다!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('복사에 실패했습니다.')
    }
  }

  const currentTeam = matchedTeams.find((team) => team.id === selectedTeam)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-primary text-primary-foreground">확정</Badge>
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight">팀 매칭</h1>
          <div className="relative h-8 w-8 overflow-hidden rounded-lg">
            <Image src="/images/logo.jpg" alt="TeamUp" fill className="object-cover" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* AI 매칭하기 카드 */}
        <div className="mb-6">
          <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-foreground">AI 팀 매칭</h3>
                    <p className="text-xs text-muted-foreground">
                      최적의 상대 팀을 찾아드립니다
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2 rounded-lg bg-background/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">내 팀</span>
                  <span className="font-semibold text-foreground">{teamName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">팀 레벨</span>
                  <Badge variant="secondary" className="text-xs">레벨 A</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">선호 거리</span>
                  <span className="font-semibold text-foreground">5km 이내</span>
                </div>
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="mr-2 h-5 w-5" />
                AI 매칭 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 매칭 대기 팀 */}
        {matchedTeams.filter((team) => team.status === 'pending').length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              매칭 대기 팀
            </h3>

            <div className="space-y-3">
              {matchedTeams
                .filter((team) => team.status === 'pending')
                .map((team) => (
                  <Card
                    key={team.id}
                    className="cursor-pointer border-border/50 bg-card transition-all hover:border-primary/50"
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-4">
                        {team.avatar ? (
                          <img
                            src={team.avatar}
                            alt={team.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                            {team.name.substring(0, 2)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-bold text-foreground">{team.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              레벨 {team.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{team.location}</span>
                            </div>
                            <span>•</span>
                            <span>{team.distance}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>팀원 {team.members}명</span>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(team.status)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {team.matchDate} {team.matchTime}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          거절
                        </Button>
                        <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                          수락
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* 매칭 확정 팀 */}
        {matchedTeams.filter((team) => team.status === 'confirmed').length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              매칭된 팀
            </h3>

            <div className="space-y-3">
              {matchedTeams
                .filter((team) => team.status === 'confirmed')
                .map((team) => (
                  <Card
                    key={team.id}
                    className="cursor-pointer border-border/50 bg-card transition-all hover:border-primary/50"
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-4">
                        {team.avatar ? (
                          <img
                            src={team.avatar}
                            alt={team.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                            {team.name.substring(0, 2)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-bold text-foreground">{team.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              레벨 {team.level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{team.location}</span>
                            </div>
                            <span>•</span>
                            <span>{team.distance}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>팀원 {team.members}명</span>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(team.status)}
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {team.matchDate} {team.matchTime}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        경기 상세보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* 팀 상세 모달 */}
      {currentTeam && (
        <Dialog open={selectedTeam !== null} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">팀 정보</DialogTitle>
            </DialogHeader>

            {/* Team Profile */}
            <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {currentTeam.avatar ? (
                      <img src={currentTeam.avatar} alt="Team" className="h-20 w-20 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                        {currentTeam.name.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h2 className="mb-1 text-2xl font-bold text-foreground">{currentTeam.name}</h2>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary">레벨 {currentTeam.level}</Badge>
                        <Badge variant="secondary" className="text-xs">{currentTeam.location.split(' ')[0]}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-card/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">팀장 카카오톡 ID</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-foreground">{currentTeam.kakaoId}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyKakaoId(currentTeam.kakaoId)}
                      className="min-w-[60px]"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          완료
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-card/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{currentTeam.totalMatches}</p>
                    <p className="text-xs text-muted-foreground">총 경기</p>
                  </div>
                  <div className="rounded-lg bg-card/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{currentTeam.aiReports}</p>
                    <p className="text-xs text-muted-foreground">AI 리포트</p>
                  </div>
                  <div className="rounded-lg bg-card/50 p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{currentTeam.activeDays}일</p>
                    <p className="text-xs text-muted-foreground">활동</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setSelectedTeam(null)}
            >
              닫기
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
