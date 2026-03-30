'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { matchService } from '@/lib/services'
import { getMockMatchById } from '@/lib/mock-matches'
import { mockMatchApplications } from '@/lib/mock-match-applications'
import type { Match, MatchApplication } from '@/types/match'
import {
  getStoredApplicationsByMatchId,
  mergeStoredApplications,
  updateStoredApplicationStatus,
} from '@/lib/match-local-store'
import { toast } from 'sonner'
import { APPLICATION_STATUS_META, MATCH_STATUS_META } from '@/lib/status-meta'
import { getLocalUser } from '@/lib/services/match'
import { isRecoverableNetworkError } from '@/lib/error-utils'
import { HostMatchDetailLoading } from './_components/host-match-detail-loading'
import { HostMatchSummaryCard } from './_components/host-match-summary-card'
import { HostMatchStatusCard } from './_components/host-match-status-card'
import { HostApplicationsCard } from './_components/host-applications-card'
import { RefundAllDialog } from './_components/refund-all-dialog'

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
  const [hasHostAccess, setHasHostAccess] = useState(true)

  const ensureHostAccess = (targetMatch: Match): boolean => {
    const { userId } = getLocalUser()
    return targetMatch.hostId === userId
  }

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
        if (!ensureHostAccess(matchData)) {
          setHasHostAccess(false)
          toast.error('내가 주최한 경기만 관리할 수 있습니다.')
          router.replace('/host/matches')
          return
        }
        setMatch(matchData)
        setApplications(appData)
      } catch {
        const mockMatch = getMockMatchById(matchId)
        if (!mockMatch) {
          toast.error('경기를 찾을 수 없습니다.')
          router.replace('/host/matches')
          return
        }
        if (!ensureHostAccess(mockMatch)) {
          setHasHostAccess(false)
          toast.error('내가 주최한 경기만 관리할 수 있습니다.')
          router.replace('/host/matches')
          return
        }
        setMatch(mockMatch)

        const existing = getStoredApplicationsByMatchId(matchId)
        if (existing.length === 0) {
          const seeded = mockMatchApplications.filter((app) => app.matchId === matchId)
          if (seeded.length > 0) {
            mergeStoredApplications(seeded)
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
    if (!hasHostAccess) return
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
    } catch (err) {
      if (!isRecoverableNetworkError(err)) {
        toast.error('참가 확정 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      updateStoredApplicationStatus(application.id, 'CONFIRMED')
      await refreshMatchAndApplications(matchId)
      toast.success(`${application.userName} 참가를 임시 반영했습니다. 연결 후 다시 확인해주세요.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefund = async (application: MatchApplication) => {
    if (!matchId) return
    if (!hasHostAccess) return
    if (!match || match.status !== 'CANCELLED') {
      toast.info('환불 처리는 경기가 취소된 상태에서만 처리할 수 있습니다.')
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
    } catch (err) {
      if (!isRecoverableNetworkError(err)) {
        toast.error('환불 처리에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      updateStoredApplicationStatus(application.id, 'REFUNDED')
      await refreshMatchAndApplications(matchId)
      toast.success(`${application.userName} 환불 처리를 임시 반영했습니다. 연결 후 다시 확인해주세요.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefundAll = async () => {
    if (!matchId || !match) return
    if (!hasHostAccess) return
    if (match.status !== 'CANCELLED') {
      toast.info('일괄 환불은 경기가 취소된 상태에서만 처리할 수 있습니다.')
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
        } catch (err) {
          if (!isRecoverableNetworkError(err)) {
            throw err
          }
          updateStoredApplicationStatus(app.id, 'REFUNDED')
          successCount += 1
        }
      }

      await refreshMatchAndApplications(matchId)
      toast.success(`환불 ${successCount}건을 일괄 처리했습니다.`)
    } catch {
      toast.error('일괄 환불 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMatchStatusChange = async (nextStatus: Match['status']) => {
    if (!matchId || !match) return
    if (!hasHostAccess) return
    if (nextStatus === 'FULL' && counts.confirmed < match.capacity) {
      toast.error('확정 인원이 정원에 도달했을 때만 마감 처리할 수 있습니다.')
      return
    }
    if (nextStatus === 'RECRUITING' && match.status === 'ENDED') {
      toast.error('종료된 경기는 다시 모집중으로 변경할 수 없습니다.')
      return
    }
    try {
      setIsSubmitting(true)
      const updated = await matchService.updateMatchStatus(matchId, { status: nextStatus })
      setMatch(updated)
      toast.success(`경기 상태를 ${MATCH_STATUS_META[nextStatus].label}로 변경했습니다.`)
    } catch (err) {
      if (!isRecoverableNetworkError(err)) {
        toast.error('경기 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      setMatch({ ...match, status: nextStatus })
      toast.success(`네트워크 불안정으로 상태를 임시 반영했습니다. 연결 후 다시 확인해주세요.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !match || !hasHostAccess) return <HostMatchDetailLoading />

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/host/matches')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">주최 경기 상세</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <HostMatchSummaryCard match={match} />
        <HostMatchStatusCard
          currentStatus={match.status}
          isSubmitting={isSubmitting}
          onChangeStatus={handleMatchStatusChange}
        />
        <HostApplicationsCard
          matchStatus={match.status}
          counts={counts}
          refundNeededCount={refundNeededCount}
          applicationFilter={applicationFilter}
          displayedApplications={displayedApplications}
          isSubmitting={isSubmitting}
          onChangeFilter={setApplicationFilter}
          onOpenRefundAll={() => setShowRefundAllDialog(true)}
          onConfirm={handleConfirm}
          onRefund={handleRefund}
        />

        <Link href={`/matches/${match.id}`}>
          <Button variant="outline" className="w-full">참가자 화면으로 이동</Button>
        </Link>
      </main>

      <RefundAllDialog
        open={showRefundAllDialog}
        refundNeededCount={refundNeededCount}
        isSubmitting={isSubmitting}
        onOpenChange={setShowRefundAllDialog}
        onConfirm={handleRefundAll}
      />
    </div>
  )
}

