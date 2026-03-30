'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { matchService } from '@/lib/services'
import { getMockMatchById } from '@/lib/mock-matches'
import type { Match, MatchApplicationStatus } from '@/types/match'
import { toast } from 'sonner'
import {
  upsertStoredApplication,
  updateStoredApplicationStatus,
} from '@/lib/match-local-store'
import { getLocalUser } from '@/lib/services/match'
import { isRecoverableNetworkError, isSelfHostApplyForbiddenError } from '@/lib/error-utils'
import { useStoredApplicationsByMatchId } from '@/hooks/useStoredApplications'
import { MatchDetailLoading } from './_components/match-detail-loading'
import { MatchOverviewCard } from './_components/match-overview-card'
import { MatchInfoCard } from './_components/match-info-card'
import { MatchStatusNotices } from './_components/match-status-notices'
import { MatchActionBar } from './_components/match-action-bar'

type LocalApplicationState = {
  applicationId: string
  status: MatchApplicationStatus
}

const getApplyButtonLabel = (matchStatus: Match['status'], isSubmitting: boolean, isMyHostedMatch: boolean) => {
  if (isSubmitting) return '처리 중...'
  if (isMyHostedMatch) return '내 주최 경기'
  if (matchStatus === 'RECRUITING') return '참가 신청'
  if (matchStatus === 'FULL') return '신청 마감'
  if (matchStatus === 'CANCELLED') return '취소된 경기'
  return '종료된 경기'
}

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = params?.id
  const fromNotifications = searchParams.get('from') === 'notifications'

  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [highlightMatchCard, setHighlightMatchCard] = useState(false)
  const applicationsByMatch = useStoredApplicationsByMatchId(matchId)
  const application = useMemo<LocalApplicationState | null>(() => {
    if (!matchId) return null
    const localUserId = getLocalUser().userId
    const mine = applicationsByMatch.find((app) => app.userId === localUserId)
    return mine ? { applicationId: mine.id, status: mine.status } : null
  }, [applicationsByMatch, matchId])

  useEffect(() => {
    if (!matchId) return
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await matchService.getMatch(matchId)
        setMatch(data)
      } catch {
        const mock = getMockMatchById(matchId)
        if (!mock) {
          toast.error('경기를 찾을 수 없습니다.')
          router.replace('/matches')
          return
        }
        setMatch(mock)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [matchId, router])

  useEffect(() => {
    if (!fromNotifications) return
    setHighlightMatchCard(true)
    const timer = window.setTimeout(() => setHighlightMatchCard(false), 1400)
    return () => window.clearTimeout(timer)
  }, [fromNotifications])

  const participantText = useMemo(() => {
    if (!match) return ''
    return `${match.confirmedCount + match.pendingCount}/${match.capacity}`
  }, [match])

  const feeSummary = useMemo(() => {
    if (!match) return { perPerson: 0, totalAtCapacity: 0 }
    const cap = Math.max(1, match.capacity)
    const perPerson = match.fee
    const totalAtCapacity = perPerson * cap
    return { perPerson, totalAtCapacity }
  }, [match])

  const isMyHostedMatch = useMemo(() => {
    if (!match) return false
    const localUser = getLocalUser()
    return match.hostId === localUser.userId
  }, [match])

  const handleHeaderBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push(fromNotifications ? '/notifications' : '/matches')
  }, [fromNotifications, router])

  const handleApply = async () => {
    if (!match) return
    if (isMyHostedMatch) {
      toast.error('내가 주최한 경기는 참가 신청할 수 없습니다.')
      return
    }
    if (match.status !== 'RECRUITING') {
      toast.error('현재 신청할 수 없는 경기입니다.')
      return
    }
    if (application && (application.status === 'PENDING_DEPOSIT' || application.status === 'CONFIRMED')) {
      toast.info('이미 신청한 경기입니다.')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await matchService.applyToMatch(match.id)
      upsertStoredApplication(result)
      const updatedMatch = await matchService.getMatch(match.id)
      setMatch(updatedMatch)
      toast.success('참가 신청이 완료되었습니다. 입금 후 승인을 기다려주세요.')
    } catch (err) {
      if (isSelfHostApplyForbiddenError(err)) {
        toast.error('내가 주최한 경기는 참가 신청할 수 없습니다.')
        return
      }
      if (!isRecoverableNetworkError(err)) {
        toast.error('참가 신청에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      const localUser = getLocalUser()
      const fallbackId = `local-${Date.now()}`
      upsertStoredApplication({
        id: fallbackId,
        matchId: match.id,
        userId: localUser.userId,
        userName: localUser.userName,
        status: 'PENDING_DEPOSIT',
        requestedAt: new Date().toISOString(),
      })
      const updatedMatch = await matchService.getMatch(match.id).catch(() => match)
      setMatch(updatedMatch)
      toast.success('네트워크 불안정으로 임시 저장되었습니다. 연결 후 다시 확인해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!match || !application) return

    try {
      setIsSubmitting(true)
      await matchService.cancelApplication(match.id, application.applicationId)
      updateStoredApplicationStatus(application.applicationId, 'CANCELLED')
      const updatedMatch = await matchService.getMatch(match.id)
      setMatch(updatedMatch)
      toast.success('참가 신청 취소가 완료되었습니다.')
    } catch (err) {
      if (!isRecoverableNetworkError(err)) {
        toast.error('참가 신청 취소에 실패했습니다. 잠시 후 다시 시도해주세요.')
        return
      }
      updateStoredApplicationStatus(application.applicationId, 'CANCELLED')
      const updatedMatch = await matchService.getMatch(match.id).catch(() => match)
      setMatch(updatedMatch)
      toast.success('네트워크 불안정으로 임시 반영되었습니다. 연결 후 다시 확인해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !match) return <MatchDetailLoading />

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={handleHeaderBack} aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">참가 상세</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-36">
        <MatchOverviewCard
          match={match}
          participantText={participantText}
          feeSummary={feeSummary}
          highlight={highlightMatchCard}
        />
        <MatchInfoCard match={match} />
        <MatchStatusNotices match={match} application={application} />
      </main>

      <MatchActionBar
        match={match}
        application={application}
        isSubmitting={isSubmitting}
        isMyHostedMatch={isMyHostedMatch}
        applyButtonLabel={getApplyButtonLabel(match.status, isSubmitting, isMyHostedMatch)}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    </div>
  )
}

