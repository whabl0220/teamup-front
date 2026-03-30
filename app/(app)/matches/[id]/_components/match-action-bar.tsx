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
  applyButtonLabel: string
  onApply: () => void
  onCancel: () => void
}

export function MatchActionBar({
  match,
  application,
  isSubmitting,
  isMyHostedMatch,
  applyButtonLabel,
  onApply,
  onCancel,
}: Props) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg gap-2">
        <Button
          className="flex-1"
          onClick={onApply}
          disabled={isSubmitting || match.status !== 'RECRUITING' || isMyHostedMatch}
        >
          {applyButtonLabel}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={
            isSubmitting ||
            !application ||
            match.status !== 'RECRUITING' ||
            application.status === 'CANCELLED' ||
            application.status === 'REFUNDED'
          }
        >
          신청 취소
        </Button>
      </div>
    </div>
  )
}
