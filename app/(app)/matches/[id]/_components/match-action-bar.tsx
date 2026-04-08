import { Button } from '@/components/ui/button'
import type { Match, MatchApplicationStatus } from '@/types/match'

type LocalApplicationState = {
  applicationId: string
  status: MatchApplicationStatus
}

type Props = {
  match: Match
  application: LocalApplicationState | null
  isSubmitting: boolean
  isMyHostedMatch: boolean
  onApply: () => void
  onCancel: () => void
}

const isActiveParticipation = (status: MatchApplicationStatus) =>
  status === 'PENDING_DEPOSIT' || status === 'CONFIRMED'

const participationStatusLabel = (status: MatchApplicationStatus): string => {
  if (status === 'PENDING_DEPOSIT') return '입금 대기 중'
  if (status === 'CONFIRMED') return '참가 확정'
  return ''
}

const hasOngoingParticipation = (
  application: LocalApplicationState | null
): application is LocalApplicationState & { status: 'PENDING_DEPOSIT' | 'CONFIRMED' } =>
  application !== null && isActiveParticipation(application.status)

const closedMatchLabel = (matchStatus: Match['status']): string => {
  if (matchStatus === 'FULL') return '신청 마감'
  if (matchStatus === 'CANCELLED') return '취소된 경기'
  return '종료된 경기'
}

export function MatchActionBar({
  match,
  application,
  isSubmitting,
  isMyHostedMatch,
  onApply,
  onCancel,
}: Props) {
  const submitting = isSubmitting

  if (isMyHostedMatch) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" disabled={submitting}>
            {submitting ? '처리 중...' : '내 주최 경기'}
          </Button>
        </div>
      </div>
    )
  }

  if (hasOngoingParticipation(application)) {
    const statusLine = participationStatusLabel(application.status)
    const cancelDisabled = submitting || match.status !== 'RECRUITING'

    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <p className="text-center text-sm font-medium text-muted-foreground">{statusLine}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={cancelDisabled}
          >
            {submitting ? '처리 중...' : '신청 취소'}
          </Button>
        </div>
      </div>
    )
  }

  if (match.status === 'RECRUITING') {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" onClick={onApply} disabled={submitting}>
            {submitting ? '처리 중...' : '참가 신청'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
      <div className="mx-auto max-w-lg">
        <Button className="w-full" disabled>
          {closedMatchLabel(match.status)}
        </Button>
      </div>
    </div>
  )
}
