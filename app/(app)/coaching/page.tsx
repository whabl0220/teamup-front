'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Plus, Trophy, Target, Check } from 'lucide-react'
import { userService, teamService, coachingService } from '@/lib/services'
import { formatTimeAgo } from '@/lib/utils'
import { toast } from 'sonner'
import type { GameRecord, Team, MatchedTeam } from '@/types'
import { IS_MVP_V2 } from '@/lib/config/mvp'

export default function CoachingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [records, setRecords] = useState<GameRecord[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [matchedTeams, setMatchedTeams] = useState<MatchedTeam[]>([])
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  })

  useEffect(() => {
    if (IS_MVP_V2) {
      router.replace('/home')
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)

        // 현재 사용자 정보 조회
        const user = await userService.getMe()

        // 내 팀 목록 조회
        const teams = await teamService.getMyTeams()
        const team = teams.length > 0 ? teams[0] : null
        setCurrentTeam(team)

        if (!team) {
          router.push('/home')
          return
        }

        // 게임 기록 조회
        try {
          const gameRecords = await coachingService.getTeamGameRecords(Number(team.id))
          
          // GameRecord 타입으로 변환
          const convertedRecords: GameRecord[] = gameRecords.map((record) => ({
            id: record.gameId.toString(),
            teamId: team.id,
            teamName: team.name,
            opponent: record.opponent || '상대팀', // 게임 기록에서 상대팀 이름 가져오기
            result: record.result,
            feedbackTag: 'TEAMWORK' as const, // Mock 데이터
            aiComment: record.aiComment,
            gameDate: new Date(record.createdAt).toISOString().split('T')[0],
            createdAt: record.createdAt,
          }))

          setRecords(convertedRecords)

          // 통계 계산
          const wins = convertedRecords.filter((r) => r.result === 'WIN').length
          const losses = convertedRecords.filter((r) => r.result === 'LOSE').length
          const total = convertedRecords.length

          setStats({
            totalGames: total,
            wins,
            losses,
            winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
          })
        } catch (err) {
          console.error('게임 기록 조회 실패:', err)
        }

        // 매칭된 팀 정보 조회
        try {
          const matchedTeamsData = await teamService.getMatchedTeams(team.id)
          const convertedMatchedTeams: MatchedTeam[] = matchedTeamsData.map((match) => ({
            id: match.gameId.toString(),
            myTeamId: team.id,
            matchedTeam: match.matchedTeam,
            matchedAt: match.matchedAt,
            requestId: match.gameId.toString(),
          }))
          setMatchedTeams(convertedMatchedTeams)
        } catch (err) {
          console.error('매칭된 팀 목록 조회 실패:', err)
          setMatchedTeams([])
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        toast.error('데이터를 불러오는데 실패했습니다.')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const getResultIcon = (result: GameRecord['result']) => {
    switch (result) {
      case 'WIN':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'LOSE':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case 'DRAW':
        return <Minus className="h-5 w-5 text-yellow-500" />
    }
  }

  const getResultBadge = (result: GameRecord['result']) => {
    switch (result) {
      case 'WIN':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">승리</Badge>
      case 'LOSE':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">패배</Badge>
      case 'DRAW':
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">무승부</Badge>
    }
  }

  const getFeedbackTagLabel = (tag: GameRecord['feedbackTag']) => {
    const labels = {
      DEFENSE: '🛡️ 수비',
      OFFENSE: '⚡ 공격',
      MENTAL: '🧠 멘탈',
      TEAMWORK: '🤝 팀워크',
      STAMINA: '💪 체력'
    }
    return labels[tag]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    return `${month}/${day} (${dayOfWeek})`
  }

  if (isLoading) {
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
              <h1 className="text-2xl font-bold tracking-tight">AI 코칭</h1>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-6">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
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
              <h1 className="text-2xl font-bold tracking-tight">AI 코칭</h1>
              <p className="text-sm text-muted-foreground">
                경기 분석과 맞춤형 조언
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
          {/* 매칭된 팀 경기 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <h2 className="font-bold text-foreground">매칭된 팀 경기</h2>
                <Badge className="bg-green-500/10 text-green-600 text-xs">수락됨</Badge>
              </div>
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
                        <Link href={`/team/${matched.matchedTeam.id}?from=matched`} className="flex-1">
                          <Button variant="outline" className="w-full hover:bg-green-600! hover:text-white! hover:border-green-600!">
                            상세 보기
                          </Button>
                        </Link>
                        <Link href={`/coaching/create?matchedTeamId=${matched.id}`} className="flex-1">
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

          {/* 통계 카드 */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">
                  {currentTeam?.name || '팀'} 전적
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stats.totalGames}</p>
                  <p className="text-xs text-muted-foreground">총 경기</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.wins}승</p>
                  <p className="text-xs text-muted-foreground">{stats.losses}패</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.winRate}%</p>
                  <p className="text-xs text-muted-foreground">승률</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI 코칭 기록 리스트 */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">코칭 기록</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {records.length}개의 피드백
              </p>
            </div>

            {records.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mb-2 font-medium text-foreground">
                    아직 코칭 기록이 없습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    경기 후 간단한 피드백을 입력하면<br />
                    AI가 맞춤형 조언을 제공합니다
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <Link key={record.id} href={`/coaching/${record.id}`}>
                    <Card className="border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-md">
                      <CardContent className="p-4">
                        {/* 헤더: 날짜, 결과 */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getResultIcon(record.result)}
                            <span className="text-sm font-medium text-foreground">
                              {formatDate(record.gameDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getResultBadge(record.result)}
                            <Badge variant="outline" className="text-xs">
                              {getFeedbackTagLabel(record.feedbackTag)}
                            </Badge>
                          </div>
                        </div>

                        {/* 상대팀 */}
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            vs <span className="font-semibold text-foreground">{record.opponent}</span>
                          </p>
                        </div>

                        {/* AI 코멘트 미리보기 */}
                        <div className="rounded-lg bg-muted/30 p-3">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {record.aiComment}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />

        {/* 플로팅 버튼 - 경기 기록 추가 */}
        <Link href="/coaching/create">
          <Button
            size="lg"
            className="fixed bottom-24 right-6 z-30 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </>
  )
}
