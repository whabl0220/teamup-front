'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, TrendingDown, Minus, Sparkles, Calendar as CalendarIcon, Bot } from 'lucide-react'
import { userService, teamService } from '@/lib/services'
import { BasketballCourt } from '@/components/features/coaching/basketball-court'
import { PositionFeedbackModal } from '@/components/features/coaching/position-feedback-modal'
import { CalendarModal } from '@/components/shared/calendar-modal'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { GameResult, Team, GameRecord } from '@/types'
import { coachingService, type FinishGameFeedbackRequest, FEEDBACK_TAG, GAME_RESULT, type FeedbackTag } from '@/lib/services'
import { toast } from 'sonner'

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

// 포지션별 질문 답변을 FeedbackTag enum으로 매핑하는 함수
function mapAnswersToFeedbackTags(positionId: number, answers: Record<string, string>): FeedbackTag[] {
  const tags: FeedbackTag[] = []

  // q1: 오늘 팀의 공격 흐름(볼 움직임/전개)은 어땠나요?
  if (answers['q1'] === '좋았다') {
    tags.push(FEEDBACK_TAG.PASS_GOOD)
  } else if (answers['q1'] === '아쉬웠다') {
    tags.push(FEEDBACK_TAG.PASS_BAD)
  }

  // q2: 팀의 수비 로테이션은 전체적으로 어땠나요?
  if (answers['q2'] === '잘 맞았다') {
    tags.push(FEEDBACK_TAG.DEFENSE_GOOD)
  } else if (answers['q2'] === '거의 맞지 않았다') {
    tags.push(FEEDBACK_TAG.DEFENSE_BAD)
  }

  // q3: 팀원 간 경기 중 소통(콜/지시/도움 요청)은 어땠나요?
  if (answers['q3'] === '적극적이었다') {
    tags.push(FEEDBACK_TAG.TEAMWORK_GOOD)
  } else if (answers['q3'] === '부족했다') {
    tags.push(FEEDBACK_TAG.TEAMWORK_BAD)
  }

  // 포지션별 질문
  const positionAnswer = answers['position_question']
  switch (positionId) {
    case 1: // PG - 팀 전체 패스 템포
      if (positionAnswer === '좋았다') {
        tags.push(FEEDBACK_TAG.SPEED_GOOD)
      } else if (positionAnswer === '많이 느렸다') {
        tags.push(FEEDBACK_TAG.SPEED_BAD)
      }
      break
    case 2: // SG - 오픈 찬스 창출
      if (positionAnswer === '잘 만들어졌다') {
        tags.push(FEEDBACK_TAG.SHOOT_GOOD)
      } else if (positionAnswer === '거의 없었다') {
        tags.push(FEEDBACK_TAG.SHOOT_BAD)
      }
      break
    case 3: // SF - 속공 전환 속도
      if (positionAnswer === '빨랐다') {
        tags.push(FEEDBACK_TAG.SPEED_GOOD)
      } else if (positionAnswer === '느렸다') {
        tags.push(FEEDBACK_TAG.SPEED_BAD)
      }
      break
    case 4: // PF - 리바운드 박스아웃 적극성
      if (positionAnswer === '적극적') {
        tags.push(FEEDBACK_TAG.REBOUND_GOOD)
      } else if (positionAnswer === '부족') {
        tags.push(FEEDBACK_TAG.REBOUND_BAD)
      }
      break
    case 5: // C - 인사이드 수비 협력
      if (positionAnswer === '안정적') {
        tags.push(FEEDBACK_TAG.DEFENSE_GOOD)
      } else if (positionAnswer === '불안정') {
        tags.push(FEEDBACK_TAG.DEFENSE_BAD)
      }
      break
  }

  return tags
}

export default function CoachingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [opponent, setOpponent] = useState('')
  const [opponentDisabled, setOpponentDisabled] = useState(false) // 매칭된 팀인 경우 수정 불가
  const [gameDate, setGameDate] = useState<Date>(new Date())
  const [result, setResult] = useState<GameResult | null>(null)
  const [matchedTeamId, setMatchedTeamId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // DNA별 색상 스타일
  const getDnaStyle = (dna?: string) => {
    switch (dna) {
      case 'BULLS':
        return {
          bg: 'from-red-500/10 to-red-600/5',
          border: 'border-red-500/30',
          icon: 'text-red-600',
          text: 'text-red-600',
        }
      case 'WARRIORS':
        return {
          bg: 'from-blue-500/10 to-yellow-500/5',
          border: 'border-blue-500/30',
          icon: 'text-blue-600',
          text: 'text-blue-600',
        }
      case 'SPURS':
        return {
          bg: 'from-gray-500/10 to-gray-600/5',
          border: 'border-gray-500/30',
          icon: 'text-gray-600',
          text: 'text-gray-600',
        }
      default:
        return {
          bg: 'from-red-500/10 to-red-600/5',
          border: 'border-red-500/30',
          icon: 'text-red-600',
          text: 'text-red-600',
        }
    }
  }

  // 농구 코트 관련 상태
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [feedbackAnswers, setFeedbackAnswers] = useState<Record<number, Record<string, string>>>({
    1: { q1: '좋았다', q2: '잘 맞았다', q3: '적극적이었다', position_question: '좋았다' },
    2: { q1: '좋았다', q2: '잘 맞았다', q3: '적극적이었다', position_question: '잘 만들어졌다' },
    3: { q1: '좋았다', q2: '잘 맞았다', q3: '적극적이었다', position_question: '빨랐다' },
    4: { q1: '좋았다', q2: '잘 맞았다', q3: '적극적이었다', position_question: '적극적' },
    5: { q1: '좋았다', q2: '잘 맞았다', q3: '적극적이었다', position_question: '안정적' },
  })

  // 캘린더 모달 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 현재 사용자 정보 조회
        const user = await userService.getMe()

        // 내 팀 목록 조회
        const teams = await teamService.getMyTeams()
        const team = teams.length > 0 ? teams[0] : null
        setCurrentTeam(team)

        if (!team) {
          toast.error('팀이 없습니다.')
          router.push('/home')
          return
        }

        // URL에서 matchedTeamId 가져오기
        const matchedId = searchParams.get('matchedTeamId')
        if (matchedId) {
          setMatchedTeamId(matchedId)
          
          // 매칭된 팀 정보 가져오기
          try {
            const matchedTeams = await teamService.getMatchedTeams(team.id)
            const matchedTeam = matchedTeams.find(m => m.gameId.toString() === matchedId)
            
            if (matchedTeam) {
              // 매칭된 팀 이름을 자동으로 설정하고 수정 불가능하게
              setOpponent(matchedTeam.matchedTeam.name)
              setOpponentDisabled(true)
            }
          } catch (err) {
            console.error('매칭된 팀 정보 조회 실패:', err)
            // 실패해도 계속 진행 (수동 입력 가능)
          }
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        toast.error('데이터를 불러오는데 실패했습니다.')
        router.push('/login')
      }
    }

    loadData()
  }, [router, searchParams])

  const handlePositionClick = (positionId: number, positionLabel: string) => {
    setSelectedPosition(positionId)
    setIsModalOpen(true)
  }

  const handleFeedbackSubmit = (answers: Record<string, string>) => {
    if (selectedPosition !== null) {
      setFeedbackAnswers(prev => ({
        ...prev,
        [selectedPosition]: answers
      }))
    }
  }

  const handleSubmit = async () => {
    if (!currentTeam || !opponent || !result) {
      toast.error('경기 결과를 선택해주세요.')
      return
    }

    if (Object.keys(feedbackAnswers).length === 0) {
      toast.error('농구 코트에서 포지션을 선택하여 피드백을 제출해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // 게임 ID는 matchedTeamId 또는 임시 생성
      const gameId = matchedTeamId ? Number(matchedTeamId) : Date.now()

      // 피드백 데이터 준비 (feedbackAnswers를 PositionFeedback 형식으로 변환)
      const positionFeedbacks = Object.entries(feedbackAnswers).map(([positionNumber, answers]) => ({
        positionNumber: Number(positionNumber),
        tags: mapAnswersToFeedbackTags(Number(positionNumber), answers),
      }))

      // 게임 종료 및 피드백 제출 API 호출
      const feedbackRequest: FinishGameFeedbackRequest = {
        teamId: Number(currentTeam.id),
        result: result as keyof typeof GAME_RESULT,
        positionFeedbacks,
      }

      toast.loading('피드백 제출 중...', { id: 'feedback-submit' })
      const feedbackResponse = await coachingService.finishGameAndFeedback(gameId, feedbackRequest)
      toast.success('피드백 제출 완료!', { id: 'feedback-submit' })

      // AI 리포트 생성 API 호출
      toast.loading('AI 코치가 분석 중입니다...', { id: 'ai-report' })
      const reportResponse = await coachingService.createReport(feedbackResponse.gameId, feedbackResponse.teamId)
      toast.success('AI 리포트 생성 완료!', {
        id: 'ai-report',
        description: reportResponse.aiComment.substring(0, 50) + '...',
      })

      // 상세 페이지로 이동 (게임 기록은 이미 서버에 저장됨)
      router.push(`/coaching/${reportResponse.gameId}`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '피드백 제출에 실패했습니다.'
      toast.error('피드백 제출 실패', {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
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
        {/* AI 코치 DNA */}
        {currentTeam && (
          <Card className={`bg-gradient-to-br ${getDnaStyle(currentTeam.teamDna).bg} ${getDnaStyle(currentTeam.teamDna).border}`}>
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <Bot className={`h-5 w-5 ${getDnaStyle(currentTeam.teamDna).icon} shrink-0`} />
                <div>
                  <p className={`text-sm font-bold ${getDnaStyle(currentTeam.teamDna).text}`}>
                    {currentTeam.teamDna === 'BULLS' && 'Chicago Bulls DNA'}
                    {currentTeam.teamDna === 'WARRIORS' && 'Golden State Warriors DNA'}
                    {currentTeam.teamDna === 'SPURS' && 'San Antonio Spurs DNA'}
                    {!currentTeam.teamDna && 'Chicago Bulls DNA'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    이 스타일의 AI 코치가 피드백을 제공합니다
                  </p>
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
                {opponentDisabled && (
                  <span className="ml-2 text-xs text-muted-foreground">(매칭된 팀)</span>
                )}
              </label>
              <Input
                placeholder="예: 세종 Twins"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                disabled={opponentDisabled}
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
          disabled={!result || Object.keys(feedbackAnswers).length === 0 || isSubmitting}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {isSubmitting ? 'AI 분석 중...' : 'AI 코칭 받기'}
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
