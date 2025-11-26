'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkles } from 'lucide-react'

const coachingReports = [
  {
    id: 1,
    date: '2024년 8월 10일',
    opponent: '서울 Tigers',
    result: '승리',
    summary: '팀워크가 우수하며 빠른 공격 전환이 돋보였습니다.',
  },
  {
    id: 2,
    date: '2024년 8월 3일',
    opponent: '관악 Thunder',
    result: '패배',
    summary: '수비 리바운드 강화가 필요하며, 후반 체력 관리 개선이 필요합니다.',
  },
  {
    id: 3,
    date: '2024년 7월 27일',
    opponent: '강남 Warriors',
    result: '승리',
    summary: '개인 기량이 뛰어나며 슛 성공률이 높았습니다.',
  },
  {
    id: 4,
    date: '2024년 7월 20일',
    opponent: '송파 Lakers',
    result: '승리',
    summary: '전체적인 팀 호흡이 좋았으며 공격적인 플레이가 돋보였습니다.',
  },
]

export default function CoachingPage() {
  const router = useRouter()
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
            <h1 className="text-xl font-bold tracking-tight">최근 AI 코칭</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{coachingReports.length}개</span>의 AI 코칭 리포트
          </p>
        </div>

        <div className="space-y-6">
          {coachingReports.map((report, index) => (
            <Link key={report.id} href={`/coaching/${report.id}`} className={`block ${index !== 0 ? 'mt-3' : ''}`}>
              <Card className="cursor-pointer border-border/50 bg-card transition-all hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{report.date}</p>
                      <p className="text-xs text-muted-foreground">{teamName} vs {report.opponent}</p>
                    </div>
                    <Badge className={report.result === '승리' ? 'bg-primary/10 text-primary' : 'bg-secondary'}>
                      {report.result}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3">
                    <p className="text-sm text-foreground">{report.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
