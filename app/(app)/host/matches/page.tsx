'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { matchService } from '@/lib/services'
import type { Match } from '@/types/match'
import { toast } from 'sonner'
import { formatDateTimeKorean } from '@/lib/date-format'
import { MATCH_STATUS_META } from '@/lib/status-meta'

export default function HostMatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      setHasLoadError(false)
      setMatches(await matchService.listHostedMatches())
    } catch {
      setMatches([])
      setHasLoadError(true)
      toast.info('데이터 로딩에 실패하여 목데이터로 운영 화면을 표시합니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMatches()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/matches')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">주최자 매치 관리</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-4 py-6">
        <div className="flex gap-2">
          <Link href="/host/matches/create" className="flex-1">
            <Button className="w-full">매치 생성하기</Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="border-border/50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-36" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasLoadError ? (
          <Card className="border-border/50">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-sm text-muted-foreground">내 주최 매치 데이터를 불러오지 못했습니다.</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => void loadMatches()}>
                  새로고침
                </Button>
                <Link href="/host/matches/create">
                  <Button>매치 생성하기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : matches.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="space-y-4 p-8 text-center">
              <p className="text-sm text-muted-foreground">내가 주최한 매치가 없습니다.</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => void loadMatches()}>
                  새로고침
                </Button>
                <Link href="/host/matches/create">
                  <Button>매치 생성하기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Link key={match.id} href={`/host/matches/${match.id}`}>
              <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-base font-semibold">{match.title}</p>
                    <Badge
                      variant={MATCH_STATUS_META[match.status].variant}
                      className={MATCH_STATUS_META[match.status].className}
                    >
                      {MATCH_STATUS_META[match.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{match.court.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeKorean(match.startAt)}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                    <Settings className="h-4 w-4" />
                    <span>신청자/상태 관리</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </main>
    </div>
  )
}

