import Link from 'next/link'
import { PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateTimeKorean } from '@/lib/date-format'
import { MATCH_STATUS_META } from '@/lib/status-meta'
import type { Match } from '@/types/match'

type Props = {
  match: Match
}

export function HostMatchSummaryCard({ match }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
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
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateTimeKorean(match.startAt)}
        </p>
        <Link href={`/host/matches/${match.id}/edit`} className="mt-4 block">
          <Button className="w-full" size="sm">
            <PencilLine className="mr-1 h-4 w-4" />
            경기 정보 수정
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
