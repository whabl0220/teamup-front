'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Bell, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { getReceivedMatchRequests, updateMatchRequestStatus, formatTimeAgo, getMatchedTeams, getCurrentTeam, getAppData } from '@/lib/storage'
import type { MatchRequest, MatchedTeam } from '@/types'
import { MatchRequestsModal } from '@/components/shared/match-requests-modal'

export default function NotificationsPage() {
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([])
  const [matchedTeams, setMatchedTeams] = useState<MatchedTeam[]>([])
  const [showAllRequestsModal, setShowAllRequestsModal] = useState(false)
  const [isTeamLeader, setIsTeamLeader] = useState(false)

  const loadData = () => {
    const requests = getReceivedMatchRequests()
    setMatchRequests(requests)
    const matched = getMatchedTeams()
    setMatchedTeams(matched)

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

  const hasNotifications = matchRequests.length > 0 || matchedTeams.length > 0

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
            <h1 className="text-2xl font-bold tracking-tight">알림</h1>
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
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">받은 매칭 요청</h2>
                <Badge className="bg-primary">{matchRequests.length}</Badge>
              </div>
              {matchRequests.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRequestsModal(true)}
                  className="text-primary hover:text-primary"
                >
                  전체
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {matchRequests.slice(0, 3).map((request) => (
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
                        className="flex-1"
                        onClick={() => handleAcceptRequest(request.id, request.fromTeam.name)}
                        disabled={!isTeamLeader}
                      >
                        수락하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 매칭된 팀 */}
        {matchedTeams.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <h2 className="font-bold text-foreground">매칭된 팀</h2>
                <Badge className="bg-green-500/10 text-green-600 text-xs">수락됨</Badge>
              </div>
              {matchedTeams.length > 1 && (
                <Link href="/matching/matched">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:!bg-green-500/20"
                  >
                    전체
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {matchedTeams.slice(0, 3).map((matched) => (
                <Card key={matched.id} className="border-border/50 bg-card">
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
                    <Link href={`/team/${matched.matchedTeam.id}`}>
                      <Button variant="outline" className="w-full hover:!bg-green-600 hover:!text-white hover:!border-green-600">
                        팀 상세보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 받은 매칭 요청 전체 모달 */}
      <MatchRequestsModal
        open={showAllRequestsModal}
        onOpenChange={setShowAllRequestsModal}
        matchRequests={matchRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />

      <BottomNav />
    </div>
  )
}
