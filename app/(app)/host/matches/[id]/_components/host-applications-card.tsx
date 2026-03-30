import { CircleCheck, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateTimeKorean } from '@/lib/date-format'
import { APPLICATION_STATUS_META } from '@/lib/status-meta'
import type { Match, MatchApplication } from '@/types/match'

type ApplicationFilter = 'ALL' | MatchApplication['status'] | 'REFUND_NEEDED'

type Props = {
  matchStatus: Match['status']
  counts: { pending: number; confirmed: number; refunded: number }
  refundNeededCount: number
  applicationFilter: ApplicationFilter
  displayedApplications: MatchApplication[]
  isSubmitting: boolean
  onChangeFilter: (next: ApplicationFilter) => void
  onOpenRefundAll: () => void
  onConfirm: (application: MatchApplication) => void
  onRefund: (application: MatchApplication) => void
}

export function HostApplicationsCard({
  matchStatus,
  counts,
  refundNeededCount,
  applicationFilter,
  displayedApplications,
  isSubmitting,
  onChangeFilter,
  onOpenRefundAll,
  onConfirm,
  onRefund,
}: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          <p className="font-medium">신청 현황</p>
        </div>
        <div className="mb-4 flex gap-2 text-sm">
          <Badge variant="outline">입금 대기 {counts.pending}</Badge>
          <Badge variant="outline">확정 {counts.confirmed}</Badge>
          <Badge variant="outline">환불 {counts.refunded}</Badge>
          {matchStatus === 'CANCELLED' && (
            <Badge variant="default">환불 필요 {refundNeededCount}</Badge>
          )}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant={applicationFilter === 'ALL' ? 'default' : 'outline'} onClick={() => onChangeFilter('ALL')}>
            전체
          </Button>
          <Button size="sm" variant={applicationFilter === 'PENDING_DEPOSIT' ? 'default' : 'outline'} onClick={() => onChangeFilter('PENDING_DEPOSIT')}>
            입금 대기
          </Button>
          <Button size="sm" variant={applicationFilter === 'CONFIRMED' ? 'default' : 'outline'} onClick={() => onChangeFilter('CONFIRMED')}>
            확정
          </Button>
          <Button size="sm" variant={applicationFilter === 'REFUNDED' ? 'default' : 'outline'} onClick={() => onChangeFilter('REFUNDED')}>
            환불
          </Button>
          {matchStatus === 'CANCELLED' && (
            <Button size="sm" variant={applicationFilter === 'REFUND_NEEDED' ? 'default' : 'outline'} onClick={() => onChangeFilter('REFUND_NEEDED')}>
              환불 필요
            </Button>
          )}
        </div>
        {matchStatus === 'CANCELLED' && (
          <Card className="mb-4 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-destructive">환불 처리 대상</p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onOpenRefundAll}
                  disabled={isSubmitting || refundNeededCount === 0}
                >
                  일괄 환불 처리
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                취소된 경기의 환불 처리 대상 신청자를 우선 확인하세요.
              </p>
            </CardContent>
          </Card>
        )}
        <div className="space-y-3">
          {displayedApplications.length === 0 ? (
            <p className="text-sm text-muted-foreground">신청자가 없습니다.</p>
          ) : (
            displayedApplications.map((app) => (
              <Card key={app.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">{app.userName}</p>
                    <Badge
                      variant={APPLICATION_STATUS_META[app.status].variant}
                      className={APPLICATION_STATUS_META[app.status].className}
                    >
                      {APPLICATION_STATUS_META[app.status].label}
                    </Badge>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    신청 시각: {formatDateTimeKorean(app.requestedAt)}
                  </p>
                  {(app.confirmedAt || app.cancelledAt || app.refundedAt) && (
                    <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                      {app.confirmedAt && <p>확정 시각: {formatDateTimeKorean(app.confirmedAt)}</p>}
                      {app.cancelledAt && <p>취소 시각: {formatDateTimeKorean(app.cancelledAt)}</p>}
                      {app.refundedAt && <p>환불 시각: {formatDateTimeKorean(app.refundedAt)}</p>}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => onConfirm(app)}
                      disabled={isSubmitting || matchStatus !== 'RECRUITING' || app.status !== 'PENDING_DEPOSIT'}
                    >
                      <CircleCheck className="mr-1 h-4 w-4" />
                      참가 확정
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={() => onRefund(app)}
                      disabled={
                        isSubmitting ||
                        matchStatus !== 'CANCELLED' ||
                        (app.status !== 'CONFIRMED' && app.status !== 'CANCELLED')
                      }
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      환불 처리
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
