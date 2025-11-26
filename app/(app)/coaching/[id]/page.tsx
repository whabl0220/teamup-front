'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkles, TrendingUp, Target, MessageCircle, Lightbulb } from 'lucide-react'

// Mock data - 실제로는 API에서 가져올 데이터
const coachingData: Record<string, any> = {
  '1': {
    date: '2024년 8월 10일',
    opponent: '서울 Tigers',
    result: '승리',
    summary: '오늘 경기는 중간 난이도였으며, 전체적으로 팀워크가 좋았습니다. 상대팀의 속도에 잘 대응했습니다.',
    strengths: [
      '빠른 공격 전환과 우수한 팀워크',
      '패스 템포와 연결이 안정적',
      '수비 조직력이 경기 후반에 향상됨'
    ],
    improvements: [
      '박스아웃이 부족하여 리바운드에서 손해',
      '콜이 부족해 수비 로테이션이 늦음'
    ],
    teamFeedback: '팀원들은 전반적으로 팀워크가 좋았다고 느꼈으며, 리바운드와 커뮤니케이션 개선이 필요하다고 언급했습니다.',
    nextFocus: '다음 경기는 팀 리바운드 강화와 수비 시 콜 연습에 집중해보세요.'
  },
  '2': {
    date: '2024년 8월 3일',
    opponent: '관악 Thunder',
    result: '패배',
    summary: '상대팀의 속도가 빨라 어려운 경기였지만 우리 팀의 패스 흐름은 매우 안정적이었습니다.',
    strengths: [
      '패스 정확도가 높음',
      '팀워크가 전반적으로 우수함'
    ],
    improvements: [
      '수비 리바운드 강화 필요',
      '후반 체력 저하로 득점력 감소',
      '빠른 전환 수비 대응 부족'
    ],
    teamFeedback: '슛 컨디션 관리가 다음 경기에서 중점이 될 수 있습니다. 상대의 수비 템포에 맞춰 더 빠른 패스 선택이 도움이 될 수 있습니다.',
    nextFocus: '지구력 훈련과 빠른 전환 상황 대응 연습을 해보세요.'
  },
  '3': {
    date: '2024년 7월 27일',
    opponent: '강남 Warriors',
    result: '승리',
    summary: '개인 기량이 뛰어나며 슛 성공률이 높았던 경기입니다.',
    strengths: [
      '개인 기술이 뛰어남',
      '슛 성공률이 높음'
    ],
    improvements: [
      '팀 호흡 개선 필요',
      '의사소통 강화 필요'
    ],
    teamFeedback: '개인 플레이는 좋았으나 팀 플레이를 더 강화하면 좋겠다는 의견이 있었습니다.',
    nextFocus: '팀 전술 연습과 포지션별 역할 분담을 명확히 하세요.'
  },
  '4': {
    date: '2024년 7월 20일',
    opponent: '송파 Lakers',
    result: '승리',
    summary: '전체적인 팀 호흡이 좋았으며 공격적인 플레이가 돋보였던 경기입니다.',
    strengths: [
      '공격 템포가 빠르고 효과적',
      '팀워크가 우수함'
    ],
    improvements: [
      '수비 집중력 향상 필요',
      '리바운드 강화 필요'
    ],
    teamFeedback: '공격은 좋았으나 수비에서 집중력이 떨어지는 순간이 있었다는 의견이 있었습니다.',
    nextFocus: '수비 시 집중력 유지와 리바운드 포지셔닝 연습이 필요합니다.'
  }
}

export default function CoachingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const report = coachingData[id] || coachingData['1']
  const [teamName, setTeamName] = useState('세종 born')

  useEffect(() => {
    const savedName = localStorage.getItem('teamName')
    if (savedName) setTeamName(savedName)
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI 코칭 리포트</h1>
              <p className="text-xs text-muted-foreground">{report.date}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Match Info */}
        <Card className="mb-6 border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-lg font-bold text-foreground">{teamName} vs {report.opponent}</p>
                <p className="text-sm text-muted-foreground">{report.date}</p>
              </div>
              <Badge className={report.result === '승리' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                {report.result}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* ① 오늘 경기 요약 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground">오늘 경기 요약</p>
            </div>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
              </CardContent>
            </Card>
          </div>

          {/* ② 강점 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground">강점</p>
            </div>
            <div className="space-y-3">
              {report.strengths.map((strength: string, index: number) => (
                <Card key={index} className="border-border/50 bg-card">
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground">• {strength}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ③ 개선점 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">개선점</p>
            </div>
            <div className="space-y-3">
              {report.improvements.map((improvement: string, index: number) => (
                <Card key={index} className="border-border/50 bg-card">
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground">• {improvement}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ④ 팀원 의견 요약 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground">팀원 의견 요약 (AI 정제)</p>
            </div>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-foreground">{report.teamFeedback}</p>
              </CardContent>
            </Card>
          </div>

          {/* ⑤ 다음 경기 추천 포커스 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground">다음 경기 추천 전략</p>
            </div>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="p-4">
                <p className="text-sm font-medium leading-relaxed text-foreground">{report.nextFocus}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          size="lg"
          className="mt-6 w-full font-semibold"
          onClick={() => router.back()}
        >
          돌아가기
        </Button>
      </main>
    </div>
  )
}
