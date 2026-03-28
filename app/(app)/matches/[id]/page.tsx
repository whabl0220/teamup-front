'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { matchService } from '@/lib/services'
import { getMockMatchById } from '@/lib/mock-matches'
import type { Match, MatchApplicationStatus } from '@/types/match'
import { toast } from 'sonner'
import {
  getStoredApplicationsByMatchId,
  upsertStoredApplication,
  updateStoredApplicationStatus,
} from '@/lib/match-local-store'
import { getLocalUser } from '@/lib/services/match'
import { formatDateTimeKorean } from '@/lib/date-format'
import { APPLICATION_STATUS_META, MATCH_STATUS_META } from '@/lib/status-meta'

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

const isSelfHostApplyForbiddenError = (err: unknown): boolean =>
  err instanceof Error && err.message.includes('SELF_HOST_APPLY_FORBIDDEN')

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = params?.id
  const fromNotifications = searchParams.get('from') === 'notifications'

  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [application, setApplication] = useState<LocalApplicationState | null>(null)
  const [highlightMatchCard, setHighlightMatchCard] = useState(false)

  useEffect(() => {
    if (!matchId) return
    const localUser = getLocalUser()
    const applications = getStoredApplicationsByMatchId(matchId)
    const mine = applications.find((app) => app.userId === localUser.userId)
    if (mine) setApplication({ applicationId: mine.id, status: mine.status })
  }, [matchId])

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
      setApplication({ applicationId: result.id, status: result.status })
      const updatedMatch = await matchService.getMatch(match.id)
      setMatch(updatedMatch)
      toast.success('참가 신청이 완료되었습니다. 입금 후 승인을 기다려주세요.')
    } catch (err) {
      if (isSelfHostApplyForbiddenError(err)) {
        toast.error('내가 주최한 경기는 참가 신청할 수 없습니다.')
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
      setApplication({ applicationId: fallbackId, status: 'PENDING_DEPOSIT' })
      const updatedMatch = await matchService.getMatch(match.id).catch(() => match)
      setMatch(updatedMatch)
      toast.success('참가 신청이 완료되었습니다. 입금 후 승인을 기다려주세요.')
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
      setApplication({ ...application, status: 'CANCELLED' })
      const updatedMatch = await matchService.getMatch(match.id)
      setMatch(updatedMatch)
      toast.success('참가 신청 취소가 완료되었습니다.')
    } catch {
      updateStoredApplicationStatus(application.applicationId, 'CANCELLED')
      setApplication({ ...application, status: 'CANCELLED' })
      const updatedMatch = await matchService.getMatch(match.id).catch(() => match)
      setMatch(updatedMatch)
      toast.success('참가 신청 취소가 완료되었습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !match) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
          <Card className="border-border/50">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

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
        <Card className={highlightMatchCard ? 'ring-2 ring-primary/40 animate-pulse' : ''}>
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold">{match.title}</h2>
              <Badge
                variant={MATCH_STATUS_META[match.status].variant}
                className={MATCH_STATUS_META[match.status].className}
              >
                {MATCH_STATUS_META[match.status].label}
              </Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDateTimeKorean(match.startAt)}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.court.name} ({match.court.address})</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4" />{participantText}</p>
            </div>
            <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">{match.level}</Badge>
              </div>
              <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">1인당 참가비</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {feeSummary.perPerson.toLocaleString()}원
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">정원 {match.capacity}명 기준 총액</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {feeSummary.totalAtCapacity.toLocaleString()}원
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                  참가비는 1인 기준이며, 총액은 정원이 모두 찼을 때의 합산 금액입니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {match.status === 'CANCELLED' && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-destructive">경기가 취소되었습니다.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                운영 정책에 따라 취소된 경기이며, 환불 처리는 주최 측 진행으로 처리됩니다.
              </p>
            </CardContent>
          </Card>
        )}

        {application && (
          <Card className="border-primary/40">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">내 신청 상태</p>
              <div className="mt-1">
                <Badge
                  variant={APPLICATION_STATUS_META[application.status].variant}
                  className={APPLICATION_STATUS_META[application.status].className}
                >
                  {APPLICATION_STATUS_META[application.status].label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button
            className="flex-1"
            onClick={handleApply}
            disabled={isSubmitting || match.status !== 'RECRUITING' || isMyHostedMatch}
          >
            {getApplyButtonLabel(match.status, isSubmitting, isMyHostedMatch)}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={
              isSubmitting ||
              !application ||
              match.status !== 'RECRUITING' ||
              application.status === 'CANCELLED' ||
              application.status === 'REFUNDED'
            }
          >
            신청 취소
          </Button>
        </div>
      </div>
    </div>
  )
}

