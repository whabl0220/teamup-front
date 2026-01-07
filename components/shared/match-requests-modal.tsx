'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MatchRequest } from '@/types'
import { formatTimeAgo } from '@/lib/utils'

interface MatchRequestsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matchRequests: MatchRequest[]
  onAccept: (requestId: string, teamName: string) => void
  onReject: (requestId: string) => void
}

export function MatchRequestsModal({
  open,
  onOpenChange,
  matchRequests,
  onAccept,
  onReject,
}: MatchRequestsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            받은 매칭 요청 ({matchRequests.length}개)
          </DialogTitle>
          <DialogDescription>
            팀에서 받은 매칭 요청을 확인하고 수락/거절할 수 있습니다
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {matchRequests.map((request) => (
            <Card key={request.id} className="border-primary bg-primary/5">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                    {request.fromTeam.shortName}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-bold text-foreground">{request.fromTeam.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        레벨 {request.fromTeam.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{request.fromTeam.region}</p>
                  </div>
                </div>

                <div className="mb-3 rounded-lg bg-secondary/30 p-3">
                  <p className="text-sm text-foreground">&quot;{request.message}&quot;</p>
                </div>

                <p className="mb-3 text-xs text-muted-foreground">
                  {formatTimeAgo(request.createdAt)}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onReject(request.id)
                      if (matchRequests.length === 1) onOpenChange(false)
                    }}
                  >
                    거절
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      onAccept(request.id, request.fromTeam.name)
                      if (matchRequests.length === 1) onOpenChange(false)
                    }}
                  >
                    수락
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </DialogContent>
    </Dialog>
  )
}
