import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { APPLICATION_STATUS_META } from '@/lib/status-meta'
import type { Match, MatchApplicationStatus } from '@/types/match'

type LocalApplicationState = {
  applicationId: string
  status: MatchApplicationStatus
}

type Props = {
  match: Match
  application: LocalApplicationState | null
}

export function MatchStatusNotices({ match, application }: Props) {
  return (
    <>
      {match.status === 'CANCELLED' && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-destructive">경기가 취소되었습니다.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              운영 정책에 따라 취소된 경기이며, 환불 처리는 주최 측 진행으로 처리됩니다.
            </p>
          </CardContent>
        </Card>
      )}

      {application && (
        <Card className="border-primary/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">내 신청 상태</p>
            <div className="mt-1">
              <Badge
                variant={APPLICATION_STATUS_META[application.status].variant}
                className={APPLICATION_STATUS_META[application.status].className}
              >
                {APPLICATION_STATUS_META[application.status].label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
