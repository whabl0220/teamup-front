import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyKRW, formatDateTimeKorean } from '@/lib/formatters'
import { getMatchLevelLabel } from '@/lib/match-level-meta'
import { MATCH_STATUS_META } from '@/lib/status-meta'
import type { Match } from '@/types/match'

type FeeSummary = {
  perPerson: number
  totalAtCapacity: number
}

type Props = {
  match: Match
  participantText: string
  feeSummary: FeeSummary
  highlight: boolean
}

export function MatchOverviewCard({ match, participantText, feeSummary, highlight }: Props) {
  return (
    <Card className={highlight ? 'ring-2 ring-primary/40 animate-pulse' : ''}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold">{match.title}</h2>
          <Badge
            variant={MATCH_STATUS_META[match.status].variant}
            className={MATCH_STATUS_META[match.status].className}
          >
            {MATCH_STATUS_META[match.status].label}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDateTimeKorean(match.startAt)}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.court.name} ({match.court.address})</p>
          <p className="flex items-center gap-2"><Users className="h-4 w-4" />{participantText}</p>
        </div>
        <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline">{getMatchLevelLabel(match.level)}</Badge>
          </div>
          <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">1인당 참가비</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrencyKRW(feeSummary.perPerson)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">정원 {match.capacity}명 기준 총액</span>
              <span className="font-medium tabular-nums text-foreground">
                {formatCurrencyKRW(feeSummary.totalAtCapacity)}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              참가비는 1인 기준이며, 총액은 정원이 모두 찼을 때의 합산 금액입니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
