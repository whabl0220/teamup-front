'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

type LocalApplicationState = {
  applicationId: string
  status: MatchApplicationStatus
}

const getStatusLabel = (status: MatchApplicationStatus) => {
  if (status === 'PENDING_DEPOSIT') return '입금 대기'
  if (status === 'CONFIRMED') return '참가 확정'
  if (status === 'REFUNDED') return '환불 완료'
  return '취소됨'
}

const getMatchStatusLabel = (status: Match['status']) => {
  if (status === 'RECRUITING') return '모집중'
  if (status === 'FULL') return '마감'
  if (status === 'CANCELLED') return '취소'
  return '종료'
}

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const matchId = params?.id

  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [application, setApplication] = useState<LocalApplicationState | null>(null)

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
          toast.error('매치를 찾을 수 없습니다.')
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

  const participantText = useMemo(() => {
    if (!match) return ''
    return `${match.confirmedCount + match.pendingCount}/${match.capacity}`
  }, [match])

  const handleApply = async () => {
    if (!match) return
    if (match.status !== 'RECRUITING') {
      toast.error('현재 신청 가능한 매치가 아닙니다.')
      return
    }
    if (application && (application.status === 'PENDING_DEPOSIT' || application.status === 'CONFIRMED')) {
      toast.info('이미 신청한 매치입니다.')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await matchService.applyToMatch(match.id)
      upsertStoredApplication(result)
      setApplication({ applicationId: result.id, status: result.status })
      const updatedMatch = await matchService.getMatch(match.id)
      setMatch(updatedMatch)
      toast.success('신청이 완료되었습니다. 입금 후 승인 대기 상태입니다.')
    } catch {
      const fallbackId = `local-${Date.now()}`
      upsertStoredApplication({
        id: fallbackId,
        matchId: match.id,
        userId: 'local-user',
        userName: '내 계정',
        status: 'PENDING_DEPOSIT',
        requestedAt: new Date().toISOString(),
      })
      setApplication({ applicationId: fallbackId, status: 'PENDING_DEPOSIT' })
      const updatedMatch = await matchService.getMatch(match.id).catch(() => match)
      setMatch(updatedMatch)
      toast.success('신청이 완료되었습니다. 입금 후 승인 대기 상태입니다.')
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
      toast.success('신청이 취소되었습니다.')
    } catch {
      updateStoredApplicationStatus(application.applicationId, 'CANCELLED')
      setApplication({ ...application, status: 'CANCELLED' })
      const updatedMatch = await matchService.getMatch(match.id).catch(() => match)
      setMatch(updatedMatch)
      toast.success('신청이 취소되었습니다.')
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

  const start = new Date(match.startAt)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Link href="/matches">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">매치 상세</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-28">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{match.title}</h2>
              <Badge>{getMatchStatusLabel(match.status)}</Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{start.toLocaleDateString()}</p>
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{match.court.name} ({match.court.address})</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4" />{participantText}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline">{match.level}</Badge>
              <p className="font-semibold">{match.fee.toLocaleString()}원</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5 text-sm">
            <div>
              <p className="mb-1 font-medium text-foreground">입금 계좌</p>
              <p className="text-muted-foreground">{match.depositAccount ?? '주최자 계좌 정보 준비 중'}</p>
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
              <p className="text-sm font-semibold text-destructive">매치가 취소되었습니다.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                운영 정책에 따라 취소된 매치이며, 환불 처리는 운영자 진행으로 처리됩니다.
              </p>
            </CardContent>
          </Card>
        )}

        {application && (
          <Card className="border-primary/40">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">내 신청 상태</p>
              <p className="text-base font-semibold text-foreground">{getStatusLabel(application.status)}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            운영자라면{' '}
            <Link href={`/host/matches/${match.id}`} className="font-semibold text-primary underline underline-offset-4">
              주최자 관리 화면
            </Link>
            에서 참가 상태를 관리할 수 있습니다.
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button className="flex-1" onClick={handleApply} disabled={isSubmitting || match.status !== 'RECRUITING'}>
            참가 신청
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

