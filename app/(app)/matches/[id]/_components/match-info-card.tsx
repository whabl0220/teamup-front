import { Card, CardContent } from '@/components/ui/card'
import type { Match } from '@/types/match'

type Props = {
  match: Match
}

export function MatchInfoCard({ match }: Props) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5 text-sm">
        <div>
          <p className="mb-1 font-medium text-foreground">입금 계좌</p>
          <p className="text-muted-foreground">{match.depositAccount ?? '주최 계좌 정보 준비 중'}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-foreground">취소 정책</p>
          <p className="text-muted-foreground">{match.cancellationPolicy ?? '정책 정보가 없습니다.'}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-foreground">유의사항</p>
          <p className="text-muted-foreground">{match.notes ?? '유의사항이 없습니다.'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
