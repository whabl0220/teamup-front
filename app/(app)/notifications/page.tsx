'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Bell, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { getReceivedMatchRequests, updateMatchRequestStatus, formatTimeAgo, getCurrentTeam, getAppData } from '@/lib/storage'
import type { MatchRequest } from '@/types'

export default function NotificationsPage() {
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [isTeamLeader, setIsTeamLeader] = useState(false)

  const loadData = () => {
    if (typeof window === 'undefined') return

    const requests = getReceivedMatchRequests()
    setMatchRequests(requests)

    // 팀장 권한 체크
    const currentTeam = getCurrentTeam()
    const appData = getAppData()
    if (currentTeam && appData.user) {
      setIsTeamLeader(currentTeam.captainId === appData.user.id)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAcceptRequest = (requestId: string, teamName: string) => {
    updateMatchRequestStatus(requestId, 'accepted')
    toast.success(`${teamName}의 매칭 요청을 수락했습니다!`)
    loadData()
  }

  const handleRejectRequest = (requestId: string) => {
    updateMatchRequestStatus(requestId, 'rejected')
    toast.success('매칭 요청을 거절했습니다')
    loadData()
  }

  const hasNotifications = matchRequests.length > 0

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Image
            src="/images/logo.jpg"
            alt="TeamUp Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">팀 알림</h1>
            <p className="text-sm text-muted-foreground">매칭 요청 및 알림</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {!hasNotifications && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">알림이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              받은 매칭 요청이나 알림이 여기에 표시됩니다
            </p>
          </div>
        )}

        {/* 팀장 권한 안내 */}
        {!isTeamLeader && matchRequests.length > 0 && (
          <Card className="mb-4 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldAlert className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">팀장만</span> 매칭 요청을 수락하거나 거절할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 받은 매칭 요청 */}
        {matchRequests.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">받은 매칭 요청</h2>
              <Badge className="bg-primary">{matchRequests.length}</Badge>
            </div>

            <div className="space-y-3">
              {matchRequests.map((request) => (
                <Card key={request.id} className="border-primary/50 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 font-bold text-foreground">{request.fromTeam.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">레벨 {request.fromTeam.level}</Badge>
                          <span className="text-xs text-muted-foreground">{request.fromTeam.region}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(request.createdAt)}</span>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{request.message}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={!isTeamLeader}
                        >
                          거절
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-green-600 hover:bg-green-600/10"
                          onClick={() => handleAcceptRequest(request.id, request.fromTeam.name)}
                          disabled={!isTeamLeader}
                        >
                          수락
                        </Button>
                      </div>
                      <Link href={`/team/${request.fromTeam.id}?from=match-request`} className="w-full">
                        <Button variant="outline" className="w-full hover:bg-orange-400! hover:text-black! hover:border-none!">상세 보기</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  )
}
