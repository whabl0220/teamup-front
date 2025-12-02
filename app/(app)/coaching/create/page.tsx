'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Trophy, TrendingDown, Minus, Sparkles, Calendar as CalendarIcon } from 'lucide-react'
import { getCurrentUser, addGameRecord } from '@/lib/storage'
import { BasketballCourt } from '@/components/features/coaching/basketball-court'
import { PositionFeedbackModal } from '@/components/features/coaching/position-feedback-modal'
import { CalendarModal } from '@/components/shared/calendar-modal'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { GameResult, Team, GameRecord } from '@/types'

// TODO: 백엔드 AI API 연동 대기
// 실제로는 POST /api/coaching/feedback { answers, result, teamDNA } 호출
function generateMockAIFeedback(
  answers: Record<string, string>,
  result: GameResult,
  teamDNA?: string
): string {
  // Mock: 팀 DNA에 맞는 간단한 피드백
  const dna = teamDNA || 'BULLS'
  const mockFeedbacks = {
    BULLS: '훌륭한 경기였습니다! Bulls DNA답게 강력한 수비와 투지를 보여줬습니다.',
    WARRIORS: '환상적인 팀플레이였습니다! Warriors 스타일의 즐거운 농구를 펼쳤네요.',
    SPURS: '완벽한 팀워크로 승리했습니다! Spurs의 정신을 제대로 보여줬습니다.',
  }
  return mockFeedbacks[dna as keyof typeof mockFeedbacks] || mockFeedbacks.BULLS
}

export default function CreateCoachingPage() {
  const router = useRouter()

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [opponent, setOpponent] = useState('')
  const [gameDate, setGameDate] = useState<Date>(new Date())
  const [result, setResult] = useState<GameResult | null>(null)

  // 농구 코트 관련 상태
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feedbackAnswers, setFeedbackAnswers] = useState<Record<string, string>>({})

  // 캘린더 모달 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    setCurrentTeam(user.team || null)
  }, [router])

  const handlePositionClick = (positionId: number, positionLabel: string) => {
    setSelectedPosition(positionId)
    setIsModalOpen(true)
  }

  const handleFeedbackSubmit = (answers: Record<string, string>) => {
    setFeedbackAnswers(answers)
  }

  const handleSubmit = () => {
    if (!currentTeam || !opponent || !result) {
      alert('경기 결과를 선택해주세요.')
      return
    }

    if (Object.keys(feedbackAnswers).length === 0) {
      alert('농구 코트에서 포지션을 선택하여 피드백을 제출해주세요.')
      return
    }

    // TODO: 백엔드 AI API 호출
    // const aiComment = await api.generateAIFeedback({ answers: feedbackAnswers, result, teamDNA: currentTeam.teamDna })

    // Mock AI 피드백 생성
    const aiComment = generateMockAIFeedback(feedbackAnswers, result, currentTeam.teamDna)

    // Storage에 저장
    const newRecord: GameRecord = {
      id: `rec_${Date.now()}`,
      teamId: currentTeam.id,
      teamName: currentTeam.name,
      opponent,
      result,
      feedbackTag: 'TEAMWORK', // 포지션 기반 피드백이므로 TEAMWORK로 통일
      aiComment,
      gameDate: format(gameDate, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    }

    addGameRecord(newRecord)

    // 상세 페이지로 이동
    router.push(`/coaching/${newRecord.id}`)
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">경기 기록</h1>
              <p className="text-xs text-muted-foreground">포지션 기반 팀 피드백</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* 팀 정보 */}
        {currentTeam && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{currentTeam.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentTeam.teamDna || 'BULLS'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Lv.{currentTeam.teamLevel || 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: 경기 정보 */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            1️⃣ 경기 정보
          </h3>

          <div className="space-y-3">
            {/* 상대팀 이름 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                상대팀 이름
              </label>
              <Input
                placeholder="예: 강서 Rockets"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="border-border/50 shadow-none"
              />
            </div>

            {/* 경기 날짜 (캘린더 모달) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                경기 날짜
              </label>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border-border/50 shadow-none"
                onClick={() => setIsCalendarOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(gameDate, 'yyyy년 M월 d일 (E)', { locale: ko })}
              </Button>
            </div>
          </div>
        </div>

        {/* Step 2: 경기 결과 (원터치) */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            2️⃣ 경기 결과
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <Card
              className={`cursor-pointer border-2 transition-all ${
                result === 'WIN'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => setResult('WIN')}
            >
              <CardContent className="p-3 text-center">
                <TrendingDown className="mx-auto mb-1.5 h-7 w-7 rotate-180 text-green-500" />
                <p className="font-bold text-foreground">승리</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer border-2 transition-all ${
                result === 'LOSE'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => setResult('LOSE')}
            >
              <CardContent className="p-3 text-center">
                <TrendingDown className="mx-auto mb-1.5 h-7 w-7 text-red-500" />
                <p className="font-bold text-foreground">패배</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer border-2 transition-all ${
                result === 'DRAW'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => setResult('DRAW')}
            >
              <CardContent className="p-3 text-center">
                <Minus className="mx-auto mb-1.5 h-7 w-7 text-yellow-500" />
                <p className="font-bold text-foreground">무승부</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Step 3: 농구 코트 (포지션별 피드백) */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            3️⃣ 팀 피드백 제출
          </h3>

          <BasketballCourt
            onPositionClick={handlePositionClick}
            selectedPosition={selectedPosition}
          />

          {Object.keys(feedbackAnswers).length > 0 && (
            <Card className="mt-3 border-green-500/50 bg-green-500/10">
              <CardContent className="p-3">
                <p className="text-sm font-medium text-green-700">
                  ✓ 피드백이 제출되었습니다
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 제출 버튼 */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!result || Object.keys(feedbackAnswers).length === 0}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          AI 코칭 받기
        </Button>
      </main>

      {/* 캘린더 모달 */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={gameDate}
        onDateSelect={setGameDate}
      />

      {/* 포지션 피드백 모달 */}
      {selectedPosition && (
        <PositionFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          positionId={selectedPosition}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  )
}
