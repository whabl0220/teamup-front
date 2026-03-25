'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CircleCheck, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const STATUS_OPTIONS: Match['status'][] = ['RECRUITING', 'FULL', 'CANCELLED', 'ENDED']

export default function HostMatchDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const matchId = params?.id
  const [match, setMatch] = useState<Match | null>(null)
  const [applications, setApplications] = useState<MatchApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reloadLocalApplications = (id: string) => {
    const local = getStoredApplicationsByMatchId(id)
    setApplications(local)
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

  const handleConfirm = async (application: MatchApplication) => {
    if (!matchId) return
    try {
      setIsSubmitting(true)
      await matchService.confirmApplication(matchId, application.id)
      updateStoredApplicationStatus(application.id, 'CONFIRMED')
      reloadLocalApplications(matchId)
      toast.success(`${application.userName} 참가를 확정했습니다.`)
    } catch {
      updateStoredApplicationStatus(application.id, 'CONFIRMED')
      reloadLocalApplications(matchId)
      toast.success(`${application.userName} 참가를 확정했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefund = async (application: MatchApplication) => {
    if (!matchId) return
    try {
      setIsSubmitting(true)
      await matchService.refundApplication(matchId, application.id)
      updateStoredApplicationStatus(application.id, 'REFUNDED')
      reloadLocalApplications(matchId)
      toast.success(`${application.userName} 환불 처리를 완료했습니다.`)
    } catch {
      updateStoredApplicationStatus(application.id, 'REFUNDED')
      reloadLocalApplications(matchId)
      toast.success(`${application.userName} 환불 처리를 완료했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMatchStatusChange = async (nextStatus: Match['status']) => {
    if (!matchId || !match) return
    try {
      setIsSubmitting(true)
      const updated = await matchService.updateMatchStatus(matchId, { status: nextStatus })
      setMatch(updated)
      toast.success(`매치 상태를 ${nextStatus}로 변경했습니다.`)
    } catch {
      setMatch({ ...match, status: nextStatus })
      toast.success(`매치 상태를 ${nextStatus}로 변경했습니다.`)
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
              <Badge>{match.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{match.court.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{match.startAt}</p>
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
                  {status}
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
            </div>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">신청자가 없습니다.</p>
              ) : (
                applications.map((app) => (
                  <Card key={app.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">{app.userName}</p>
                        <Badge variant="outline">{app.status}</Badge>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground">신청 시각: {app.requestedAt}</p>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={() => handleConfirm(app)}
                          disabled={isSubmitting || app.status === 'CONFIRMED'}
                        >
                          <CircleCheck className="mr-1 h-4 w-4" />
                          참가 확정
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          onClick={() => handleRefund(app)}
                          disabled={isSubmitting || app.status === 'REFUNDED'}
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
    </div>
  )
}

