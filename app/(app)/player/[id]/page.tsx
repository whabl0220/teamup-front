import { notFound } from 'next/navigation'
import { getPlayerById } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = getPlayerById(id)
  if (!player) return notFound()

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="flex flex-col items-center p-6">
          <Image
            src={player.profileImage || '/images/default-profile.png'}
            alt={player.name}
            width={80}
            height={80}
            className="mb-4 h-20 w-20 rounded-full object-cover border border-blue-500"
          />
          <h1 className="mb-2 text-2xl font-bold text-foreground">{player.name}</h1>
          <Badge className="mb-2 bg-blue-600 text-white">{player.position}</Badge>
          <p className="mb-2 text-sm text-muted-foreground">등급: {player.level}</p>
          <p className="mb-2 text-sm text-muted-foreground">최근 활동: {player.lastActive}</p>
          <p className="mb-2 text-sm text-muted-foreground">{player.bio}</p>
        </CardContent>
      </Card>
    </main>
  )
}
