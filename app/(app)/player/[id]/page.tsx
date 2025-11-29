
import { notFound } from 'next/navigation'
import { getPlayerById } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Crown } from 'lucide-react'

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = getPlayerById(id)
  if (!player) return notFound()

  // 현재 팀 정보 가져오기 (mockMyTeam)
  // 실제 서비스에서는 유저의 현재 팀을 동적으로 가져와야 함
  const { mockMyTeam } = await import('@/lib/mock-data')

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <button className="rounded-full bg-secondary p-2 hover:bg-secondary/80">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">팀원 정보</h1>
              <p className="text-xs text-muted-foreground">상세 프로필</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Player Profile */}
        <Card className="mb-6 overflow-hidden border-blue-500/50 bg-linear-to-br from-blue-500/20 via-blue-500/10 to-transparent">
          <CardContent className="p-6 flex items-center gap-6">
            <Image
              src={player.profileImage || '/images/default-profile.png'}
              alt={player.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl object-cover border border-blue-500"
            />
            <div>
              <h2 className="mb-1 text-2xl font-bold text-foreground flex items-center gap-2">
                {player.name}
                {/* 실제 팀장일 때만 표시 */}
                {player.id === mockMyTeam.captainId && <Crown className="h-5 w-5 text-blue-500" />}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600/20 text-blue-600">{player.position}</Badge>
                <Badge variant="secondary" className="text-xs">등급 {player.level}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">최근 활동: {player.lastActive}</p>
            </div>
          </CardContent>
        </Card>

        {/* 자기소개 */}
        <Card className="mb-6 border-blue-500/20 bg-card">
          <CardContent className="p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">자기소개</h3>
            <p className="text-sm text-muted-foreground">{player.bio}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
