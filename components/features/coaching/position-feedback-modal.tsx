'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { POSITION_COLORS } from '@/lib/constants'
import { X } from 'lucide-react'
import { toast } from 'sonner'

// 공통 질문 (모든 포지션 동일)
const COMMON_QUESTIONS = [
  {
    id: 'q1',
    question: '오늘 팀의 공격 흐름(볼 움직임/전개)은 어땠나요?',
    options: ['좋았다', '보통이었다', '아쉬웠다'],
  },
  {
    id: 'q2',
    question: '팀의 수비 로테이션은 전체적으로 어땠나요?',
    options: ['잘 맞았다', '중간중간 끊겼다', '거의 맞지 않았다'],
  },
  {
    id: 'q3',
    question: '팀원 간 경기 중 소통(콜/지시/도움 요청)은 어땠나요?',
    options: ['적극적이었다', '보통이었다', '부족했다'],
  },
]

// 포지션별 추가 질문
const POSITION_QUESTIONS: Record<number, { question: string; options: string[] }> = {
  1: {
    question: '팀 전체 패스 템포는 어땠나요?',
    options: ['좋았다', '조금 느렸다', '많이 느렸다'],
  },
  2: {
    question: '오픈 찬스 창출(스크린/컷인)은 어땠나요?',
    options: ['잘 만들어졌다', '보통', '거의 없었다'],
  },
  3: {
    question: '속공 전환 속도와 팀 지원은 어땠나요?',
    options: ['빨랐다', '보통', '느렸다'],
  },
  4: {
    question: '리바운드 박스아웃에서 팀 적극성은 어땠나요?',
    options: ['적극적', '보통', '부족'],
  },
  5: {
    question: '인사이드 수비 협력은 얼마나 안정적이었나요?',
    options: ['안정적', '보통', '불안정'],
  },
}

const POSITION_LABELS: Record<number, string> = {
  1: 'PG (Point Guard)',
  2: 'SG (Shooting Guard)',
  3: 'SF (Small Forward)',
  4: 'PF (Power Forward)',
  5: 'C (Center)',
}

interface PositionFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  positionId: number
  onSubmit: (answers: Record<string, string>) => void
}

export function PositionFeedbackModal({
  isOpen,
  onClose,
  positionId,
  onSubmit,
}: PositionFeedbackModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCancelHovered, setIsCancelHovered] = useState(false)

  const positionQuestion = POSITION_QUESTIONS[positionId]
  const positionColor = POSITION_COLORS[positionId as keyof typeof POSITION_COLORS]

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    // 모든 질문에 답변했는지 확인
    const allQuestionIds = [
      ...COMMON_QUESTIONS.map((q) => q.id),
      'position_question',
    ]
    const allAnswered = allQuestionIds.every((id) => answers[id])

    if (!allAnswered) {
      toast.error('모든 질문에 답변해주세요.')
      return
    }

    onSubmit(answers)
    setAnswers({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[80vh] overflow-y-auto sm:max-w-lg border-4"
        showCloseButton={false}
        style={{
          borderColor: positionColor.hex,
          background: `linear-gradient(135deg, ${positionColor.hex}08 0%, ${positionColor.hex}03 100%)`,
        }}
      >
        {/* 커스텀 X 버튼 */}
        <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
          <X className="h-4 w-4" style={{ color: positionColor.hex }} />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge
              className="text-sm font-bold border-2"
              style={{
                backgroundColor: positionColor.hex,
                borderColor: positionColor.hex,
                color: 'white',
              }}
            >
              {POSITION_LABELS[positionId]}
            </Badge>
            <span>팀 피드백</span>
          </DialogTitle>
          <DialogDescription>
            경기에 대한 팀 전체 평가를 선택해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* 공통 질문 */}
          {COMMON_QUESTIONS.map((question, index) => (
            <div key={question.id}>
              <p className="mb-2.5 text-base font-semibold text-foreground">
                {index + 1}. {question.question}
              </p>
              <div className="grid gap-1.5">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option
                  return (
                    <Card
                      key={option}
                      className="cursor-pointer border-2 transition-all hover:scale-[1.01]"
                      style={{
                        borderColor: isSelected ? positionColor.hex : 'hsl(var(--border))',
                        backgroundColor: isSelected ? `${positionColor.hex}20` : 'transparent',
                      }}
                      onClick={() => handleAnswerSelect(question.id, option)}
                    >
                      <CardContent className="p-2.5">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: isSelected ? positionColor.hex : 'hsl(var(--foreground))',
                            fontWeight: isSelected ? 'bold' : 'medium',
                          }}
                        >
                          {option}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 포지션별 질문 */}
          {positionQuestion && (
            <div>
              <p className="mb-2.5 text-base font-semibold text-foreground">
                4. {positionQuestion.question}
              </p>
              <div className="grid gap-1.5">
                {positionQuestion.options.map((option) => {
                  const isSelected = answers['position_question'] === option
                  return (
                    <Card
                      key={option}
                      className="cursor-pointer border-2 transition-all hover:scale-[1.01]"
                      style={{
                        borderColor: isSelected ? positionColor.hex : 'hsl(var(--border))',
                        backgroundColor: isSelected ? `${positionColor.hex}20` : 'transparent',
                      }}
                      onClick={() => handleAnswerSelect('position_question', option)}
                    >
                      <CardContent className="p-2.5">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: isSelected ? positionColor.hex : 'hsl(var(--foreground))',
                            fontWeight: isSelected ? 'bold' : 'medium',
                          }}
                        >
                          {option}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
            className="flex-1 h-9 px-4 py-2 rounded-md text-sm font-medium border-2 transition-all outline-none"
            style={{
              borderColor: positionColor.hex,
              backgroundColor: isCancelHovered ? `${positionColor.hex}20` : 'transparent',
              color: positionColor.hex,
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-9 px-4 py-2 rounded-md text-sm font-bold transition-all outline-none hover:opacity-90"
            style={{
              backgroundColor: positionColor.hex,
              color: 'white',
            }}
          >
            제출하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
