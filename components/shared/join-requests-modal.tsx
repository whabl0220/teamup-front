import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { JoinRequest } from '@/types'

interface JoinRequestsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  joinRequests: JoinRequest[]
  onAccept: (requestId: string, userName: string) => void
  onReject: (requestId: string) => void
}

export function JoinRequestsModal({ open, onOpenChange, joinRequests, onAccept, onReject }: JoinRequestsModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-blue-500/50 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">받은 팀 참여 요청 ({joinRequests.length}개)</h3>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              ×
            </Button>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">팀에 참여하고 싶은 사람들의 요청을 확인하고 수락/거절할 수 있습니다</p>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {joinRequests.map((request) => (
              <Card key={request.id} className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-bold text-foreground">{request.userName}</h3>
                      <Badge variant="secondary" className="text-xs">팀 참여</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{request.createdAt}</span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{request.message}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive hover:bg-blue-600! hover:text-white! hover:border-none!"
                        onClick={() => onReject(request.id)}
                      >
                        거절
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-green-600 hover:bg-blue-600! hover:text-white! hover:border-none!"
                        onClick={() => onAccept(request.id, request.userName)}
                      >
                        수락
                      </Button>
                    </div>
                    <Button asChild variant="outline" className="w-full hover:bg-blue-600! hover:text-white! hover:border-none!">
                      <a href={`/profile/${request.userId}`}>상세 보기</a>
                    </Button>
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
