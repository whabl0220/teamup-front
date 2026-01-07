'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Minus, Quote } from 'lucide-react'
import { coachingService, teamService } from '@/lib/services'
import { toast } from 'sonner'
import type { GameRecord } from '@/types'

export default function CoachingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [record, setRecord] = useState<GameRecord | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const gameId = Number(id)
        
        // 게임 기록 상세 조회
        const gameRecord = await coachingService.getGameRecord(gameId)
        
        // 내 팀 목록 조회 (팀 정보 가져오기)
        const teams = await teamService.getMyTeams()
        const team = teams.length > 0 ? teams[0] : null

        if (!team) {
          toast.error('팀 정보를 찾을 수 없습니다.')
          router.push('/coaching')
          return
        }

        // GameRecord 타입으로 변환
        const convertedRecord: GameRecord = {
          id: gameRecord.gameId.toString(),
          teamId: team.id,
          teamName: team.name,
          opponent: '상대팀', // Mock 데이터
          result: gameRecord.result,
          feedbackTag: 'TEAMWORK' as const, // Mock 데이터
          aiComment: gameRecord.aiComment,
          gameDate: new Date(gameRecord.createdAt).toISOString().split('T')[0],
          createdAt: gameRecord.createdAt,
        }

        setRecord(convertedRecord)
      } catch (err) {
        console.error('게임 기록 조회 실패:', err)
        toast.error('게임 기록을 불러올 수 없습니다.')
        router.push('/coaching')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, router])

  if (isLoading || !record) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const getResultIcon = (result: GameRecord['result']) => {
    switch (result) {
      case 'WIN':
        return <TrendingUp className="h-6 w-6 text-green-500" />
      case 'LOSE':
        return <TrendingDown className="h-6 w-6 text-red-500" />
      case 'DRAW':
        return <Minus className="h-6 w-6 text-yellow-500" />
    }
  }

  const getResultBadge = (result: GameRecord['result']) => {
    switch (result) {
      case 'WIN':
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600 text-lg px-4 py-1">
            승리
          </Badge>
        )
      case 'LOSE':
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600 text-lg px-4 py-1">
            패배
          </Badge>
        )
      case 'DRAW':
        return (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 text-lg px-4 py-1">
            무승부
          </Badge>
        )
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
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI 코칭</h1>
              <p className="text-xs text-muted-foreground">
                {formatDate(record.gameDate)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* 경기 정보 헤더 */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              {getResultIcon(record.result)}
              {getResultBadge(record.result)}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">경기</p>
                <p className="text-xl font-bold text-foreground">
                  {record.teamName}
                  <span className="mx-2 text-muted-foreground">vs</span>
                  {record.opponent}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {getFeedbackTagLabel(record.feedbackTag)}
                </Badge>
                <span className="text-sm text-muted-foreground">집중 분야</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 코칭 메시지 */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">AI 코치의 조언</h2>
              <p className="text-xs text-muted-foreground">
                팀 DNA 기반 맞춤형 피드백
              </p>
            </div>
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start gap-3">
                <Quote className="h-6 w-6 shrink-0 text-primary/50" />
                <div className="text-base leading-relaxed text-foreground space-y-4">
                  {record.aiComment.split(/(?=[🏀📊🎯✅⚠️💪👍◆])/g).map((section, index) => {
                    if (!section.trim()) return null;
                    return (
                      <p key={index} className="whitespace-pre-wrap">
                        {section.trim()}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* AI 서명 */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground italic">
                  - TeamUp AI Coach
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추가 정보 */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">기록 날짜</span>
                <span className="font-medium text-foreground">
                  {formatDate(record.gameDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">분석 시간</span>
                <span className="font-medium text-foreground">
                  {new Date(record.createdAt).toLocaleString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => router.push('/coaching/create')}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            새로운 경기 기록하기
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => router.push('/coaching')}
          >
            전체 코칭 기록 보기
          </Button>
        </div>
      </main>
    </div>
  )
}
