import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MATCH_STATUS_META } from '@/lib/status-meta'
import type { Match } from '@/types/match'

const STATUS_OPTIONS: Match['status'][] = ['RECRUITING', 'FULL', 'CANCELLED', 'ENDED']

type Props = {
  currentStatus: Match['status']
  isSubmitting: boolean
  onChangeStatus: (status: Match['status']) => void
}

export function HostMatchStatusCard({ currentStatus, isSubmitting, onChangeStatus }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-3 font-medium">경기 상태 변경</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              variant={currentStatus === status ? 'default' : 'outline'}
              onClick={() => onChangeStatus(status)}
              disabled={isSubmitting}
            >
              {MATCH_STATUS_META[status].label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
