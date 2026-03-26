'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CircleCheck, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { matchService } from '@/lib/services'
import { getMockMatchById } from '@/lib/mock-matches'
import { mockMatchApplications } from '@/lib/mock-match-applications'
import type { Match, MatchApplication } from '@/types/match'
import {
  getStoredApplicationsByMatchId,
  setStoredApplications,
  updateStoredApplicationStatus,
  getStoredApplications,
} from '@/lib/match-local-store'
import { toast } from 'sonner'
import { formatDateTimeKorean } from '@/lib/date-format'

const STATUS_OPTIONS: Match['status'][] = ['RECRUITING', 'FULL', 'CANCELLED', 'ENDED']
const getMatchStatusLabel = (status: Match['status']) => {
  if (status === 'RECRUITING') return '모집중'
  if (status === 'FULL') return '마감'
  if (status === 'CANCELLED') return '취소'
  return '종료'
}

const getApplicationStatusLabel = (status: MatchApplication['status']) => {
  if (status === 'PENDING_DEPOSIT') return '입금 대기'
  if (status === 'CONFIRMED') return '참가 확정'
  if (status === 'REFUNDED') return '환불 완료'
  return '신청 취소'
}

type ApplicationFilter = 'ALL' | MatchApplication['status'] | 'REFUND_NEEDED'

export default function HostMatchDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const matchId = params?.id
  const [match, setMatch] = useState<Match | null>(null)
  const [applications, setApplications] = useState<MatchApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilter>('ALL')
  const [showRefundAllDialog, setShowRefundAllDialog] = useState(false)

  const reloadLocalApplications = (id: string) => {
    const local = getStoredApplicationsByMatchId(id)
    setApplications(local)
  }

  const refreshMatchAndApplications = async (id: string) => {
    const [matchData, appData] = await Promise.all([
      matchService.getMatch(id),
      matchService.listApplications(id),
    ])
    setMatch(matchData)
    setApplications(appData)
  }

  useEffect(() => {
    if (!matchId) return
    const load = async () => {
      try {
        setIsLoading(true)
        const [matchData, appData] = await Promise.all([
          matchService.getMatch(matchId),
          matchService.listApplications(matchId),
        ])
        setMatch(matchData)
        setApplications(appData)
      } catch {
        const mockMatch = getMockMatchById(matchId)
        if (!mockMatch) {
          toast.error('매치를 찾을 수 없습니다.')
          router.replace('/host/matches')
          return
        }
        setMatch(mockMatch)

        const existing = getStoredApplicationsByMatchId(matchId)
        if (existing.length === 0) {
          const seeded = mockMatchApplications.filter((app) => app.matchId === matchId)
          if (seeded.length > 0) {
            setStoredApplications([...getStoredApplications(), ...seeded])
          }
        }
        reloadLocalApplications(matchId)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [matchId, router])

  const counts = useMemo(() => {
    const pending = applications.filter((app) => app.status === 'PENDING_DEPOSIT').length
    const confirmed = applications.filter((app) => app.status === 'CONFIRMED').length
    const refunded = applications.filter((app) => app.status === 'REFUNDED').length
    return { pending, confirmed, refunded }
  }, [applications])

  const isRefundNeeded = (app: MatchApplication) =>
    app.status === 'CONFIRMED' || app.status === 'CANCELLED'

  const refundNeededCount = useMemo(
    () => applications.filter((app) => isRefundNeeded(app)).length,
    [applications]
  )

  const displayedApplications = useMemo(() => {
    const base =
      match?.status !== 'CANCELLED'
        ? [...applications]
        : [...applications].sort((a, b) => Number(isRefundNeeded(b)) - Number(isRefundNeeded(a)))

    if (applicationFilter === 'ALL') return base
    if (applicationFilter === 'REFUND_NEEDED') return base.filter((app) => isRefundNeeded(app))
    return base.filter((app) => app.status === applicationFilter)
  }, [applications, match?.status, applicationFilter])

  const handleConfirm = async (application: MatchApplication) => {
    if (!matchId) return
    if (!match || match.status !== 'RECRUITING') {
      toast.info('현재 모집중 상태에서만 참가 확정을 할 수 있습니다.')
      return
    }
    if (application.status !== 'PENDING_DEPOSIT') {
      toast.info('입금 대기 상태만 확정할 수 있습니다.')
      return
    }
    try {
      setIsSubmitting(true)
      await matchService.confirmApplication(matchId, application.id)
      await refreshMatchAndApplications(matchId)
      toast.success(`${application.userName} 참가를 확정했습니다.`)
    } catch {
      updateStoredApplicationStatus(application.id, 'CONFIRMED')
      await refreshMatchAndApplications(matchId)
      toast.success(`${application.userName} 참가를 확정했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefund = async (application: MatchApplication) => {
    if (!matchId) return
    if (!match || match.status !== 'CANCELLED') {
      toast.info('환불 처리는 매치가 취소된 상태에서만 처리할 수 있습니다.')
      return
    }
    if (application.status !== 'CONFIRMED' && application.status !== 'CANCELLED') {
      toast.info('참가 확정 또는 신청 취소 상태에서만 환불 처리할 수 있습니다.')
      return
    }
    try {
      setIsSubmitting(true)
      await matchService.refundApplication(matchId, application.id)
      await refreshMatchAndApplications(matchId)
      toast.success(`${application.userName} 환불 처리를 완료했습니다.`)
    } catch {
      updateStoredApplicationStatus(application.id, 'REFUNDED')
      await refreshMatchAndApplications(matchId)
      toast.success(`${application.userName} 환불 처리를 완료했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefundAll = async () => {
    if (!matchId || !match) return
    if (match.status !== 'CANCELLED') {
      toast.info('일괄 환불은 매치가 취소된 상태에서만 처리할 수 있습니다.')
      return
    }

    const targets = applications.filter((app) => isRefundNeeded(app))
    if (targets.length === 0) {
      toast.info('환불이 필요한 신청자가 없습니다.')
      return
    }

    try {
      setIsSubmitting(true)
      setShowRefundAllDialog(false)
      let successCount = 0

      for (const app of targets) {
        try {
          await matchService.refundApplication(matchId, app.id)
          successCount += 1
        } catch {
          updateStoredApplicationStatus(app.id, 'REFUNDED')
          successCount += 1
        }
      }

      await refreshMatchAndApplications(matchId)
      toast.success(`환불 ${successCount}건을 일괄 처리했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMatchStatusChange = async (nextStatus: Match['status']) => {
    if (!matchId || !match) return
    if (nextStatus === 'FULL' && counts.confirmed < match.capacity) {
      toast.error('확정 인원이 정원에 도달했을 때만 마감 처리할 수 있습니다.')
      return
    }
    if (nextStatus === 'RECRUITING' && match.status === 'ENDED') {
      toast.error('종료된 매치는 다시 모집중으로 변경할 수 없습니다.')
      return
    }
    try {
      setIsSubmitting(true)
      const updated = await matchService.updateMatchStatus(matchId, { status: nextStatus })
      setMatch(updated)
      toast.success(`매치 상태를 ${getMatchStatusLabel(nextStatus)}로 변경했습니다.`)
    } catch {
      setMatch({ ...match, status: nextStatus })
      toast.success(`매치 상태를 ${getMatchStatusLabel(nextStatus)}로 변경했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !match) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/host/matches')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">운영자 매치 상세</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{match.title}</p>
              <Badge>{getMatchStatusLabel(match.status)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{match.court.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateTimeKorean(match.startAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="mb-3 font-medium">매치 상태 변경</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status}
                  variant={match.status === status ? 'default' : 'outline'}
                  onClick={() => handleMatchStatusChange(status)}
                  disabled={isSubmitting}
                >
                  {getMatchStatusLabel(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
              {match.status === 'CANCELLED' && (
                <Badge variant="default">환불 필요 {refundNeededCount}</Badge>
              )}
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={applicationFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setApplicationFilter('ALL')}
              >
                전체
              </Button>
              <Button
                size="sm"
                variant={applicationFilter === 'PENDING_DEPOSIT' ? 'default' : 'outline'}
                onClick={() => setApplicationFilter('PENDING_DEPOSIT')}
              >
                입금 대기
              </Button>
              <Button
                size="sm"
                variant={applicationFilter === 'CONFIRMED' ? 'default' : 'outline'}
                onClick={() => setApplicationFilter('CONFIRMED')}
              >
                확정
              </Button>
              <Button
                size="sm"
                variant={applicationFilter === 'REFUNDED' ? 'default' : 'outline'}
                onClick={() => setApplicationFilter('REFUNDED')}
              >
                환불
              </Button>
              {match.status === 'CANCELLED' && (
                <Button
                  size="sm"
                  variant={applicationFilter === 'REFUND_NEEDED' ? 'default' : 'outline'}
                  onClick={() => setApplicationFilter('REFUND_NEEDED')}
                >
                  환불 필요
                </Button>
              )}
            </div>
            {match.status === 'CANCELLED' && (
              <Card className="mb-4 border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-destructive">환불 처리 대상</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowRefundAllDialog(true)}
                      disabled={isSubmitting || refundNeededCount === 0}
                    >
                      일괄 환불 처리
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    취소된 매치의 환불 처리 대상 신청자를 우선 확인하세요.
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
                        <Badge variant="outline">{getApplicationStatusLabel(app.status)}</Badge>
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
                          onClick={() => handleConfirm(app)}
                          disabled={isSubmitting || match.status !== 'RECRUITING' || app.status !== 'PENDING_DEPOSIT'}
                        >
                          <CircleCheck className="mr-1 h-4 w-4" />
                          참가 확정
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          onClick={() => handleRefund(app)}
                          disabled={
                            isSubmitting ||
                            match.status !== 'CANCELLED' ||
                            (app.status !== 'CONFIRMED' && app.status !== 'CANCELLED') ||
                            app.status === 'REFUNDED'
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

        <Link href={`/matches/${match.id}`}>
          <Button variant="outline" className="w-full">참가자 화면으로 이동</Button>
        </Link>
      </main>

      <Dialog open={showRefundAllDialog} onOpenChange={setShowRefundAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일괄 환불 처리</DialogTitle>
            <DialogDescription>
              환불 필요 대상 {refundNeededCount}명을 한 번에 환불 처리합니다. 계속 진행할까요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundAllDialog(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundAll}
              disabled={isSubmitting || refundNeededCount === 0}
            >
              일괄 환불 진행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

