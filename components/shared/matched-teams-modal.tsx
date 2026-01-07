import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import type { MatchedTeam } from '@/types'
import { formatTimeAgo } from '@/lib/utils'

interface MatchedTeamsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matchedTeams: MatchedTeam[]
}

export function MatchedTeamsModal({ open, onOpenChange, matchedTeams }: MatchedTeamsModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-green-500/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">매칭된 팀 ({matchedTeams.length}개)</h3>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              ×
            </Button>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">최근 매칭된 팀 목록입니다. 상세 정보와 팀 프로필을 확인할 수 있습니다.</p>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {matchedTeams.map((matched) => (
              <Card key={matched.id} className="border-green-500 bg-green-500/5">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-bold text-foreground">{matched.matchedTeam.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">레벨 {matched.matchedTeam.level}</Badge>
                        <span className="text-xs text-muted-foreground">{matched.matchedTeam.region}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTimeAgo(matched.matchedAt)}에 매칭됨
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{matched.matchedTeam.description}</p>
                  <div className="flex gap-2">
                    <Link href={`/team/${matched.matchedTeam.id}?from=matched`} className="flex-1">
                      <Button variant="outline" className="w-full hover:bg-green-600! hover:text-white! hover:border-green-600!">
                        상세 보기
                      </Button>
                    </Link>
                    <Link href={`/coaching/create?matchedTeamId=${matched.id}`} className="flex-1">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        경기 완료하기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
