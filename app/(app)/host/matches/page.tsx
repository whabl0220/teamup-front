'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { matchService } from '@/lib/services'
import { mockMatches } from '@/lib/mock-matches'
import type { Match } from '@/types/match'
import { toast } from 'sonner'

export default function HostMatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setMatches(await matchService.listMatches())
      } catch {
        setMatches(mockMatches)
        toast.info('목데이터로 운영 화면을 표시합니다.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
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
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          matches.map((match) => (
            <Link key={match.id} href={`/host/matches/${match.id}`}>
              <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{match.title}</p>
                    <Badge variant="outline">{match.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{match.court.name}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-primary">
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

