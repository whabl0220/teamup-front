'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Wallet, Building2, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { matchService } from '@/lib/services'
import { getMatchCourtById, MATCH_COURT_PRESETS } from '@/lib/match-courts'
import { getLocalUser } from '@/lib/services/match'
import type { Match, MatchLevel } from '@/types/match'
import { toast } from 'sonner'

const pad2 = (n: number) => String(n).padStart(2, '0')

const toLocalDatetimeValue = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`

const toIsoFromLocalDatetime = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) throw new Error('Invalid datetime')
  return d.toISOString()
}

export default function HostMatchEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const matchId = params?.id

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [match, setMatch] = useState<Match | null>(null)

  const [title, setTitle] = useState('')
  const [courtId, setCourtId] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [fee, setFee] = useState<number>(0)
  const [capacity, setCapacity] = useState<number>(0)
  const [level, setLevel] = useState<MatchLevel>('ALL')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [notes, setNotes] = useState('')
  const [depositAccount, setDepositAccount] = useState('')

  useEffect(() => {
    if (!matchId) return
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await matchService.getMatch(matchId)
        const { userId } = getLocalUser()
        if (data.hostId !== userId) {
          toast.error('내가 주최한 경기만 수정할 수 있습니다.')
          router.replace('/host/matches')
          return
        }

        setMatch(data)
        setTitle(data.title)
        setCourtId(data.court.id)
        setStartAt(toLocalDatetimeValue(new Date(data.startAt)))
        setEndAt(data.endAt ? toLocalDatetimeValue(new Date(data.endAt)) : '')
        setFee(data.fee)
        setCapacity(data.capacity)
        setLevel(data.level)
        setCancellationPolicy(data.cancellationPolicy ?? '')
        setNotes(data.notes ?? '')
        setDepositAccount(data.depositAccount ?? '')
      } catch {
        toast.error('수정할 경기를 불러오지 못했습니다.')
        router.replace('/host/matches')
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [matchId, router])

  const canSubmit = useMemo(
    () =>
      Boolean(
        title.trim() &&
          courtId &&
          startAt &&
          Number.isFinite(fee) &&
          fee > 0 &&
          Number.isFinite(capacity) &&
          capacity > 0 &&
          depositAccount.trim()
      ),
    [title, courtId, startAt, fee, capacity, depositAccount]
  )

  const handleSave = async () => {
    if (!matchId || !match) return
    if (!canSubmit) {
      toast.error('필수 항목을 확인해주세요.')
      return
    }
    if (!getMatchCourtById(courtId)) {
      toast.error('유효한 구장을 다시 선택해주세요.')
      return
    }

    const startDate = new Date(startAt)
    const endDate = endAt ? new Date(endAt) : null
    if (Number.isNaN(startDate.getTime()) || (endDate && Number.isNaN(endDate.getTime()))) {
      toast.error('시작/종료 시간을 다시 확인해주세요.')
      return
    }
    if (endDate && endDate.getTime() <= startDate.getTime()) {
      toast.error('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    try {
      setIsSubmitting(true)
      await matchService.updateMatch(matchId, {
        title: title.trim(),
        courtId,
        startAt: toIsoFromLocalDatetime(startAt),
        endAt: endAt.trim() ? toIsoFromLocalDatetime(endAt) : undefined,
        fee: Math.round(fee),
        capacity: Math.round(capacity),
        level,
        cancellationPolicy: cancellationPolicy.trim() || undefined,
        notes: notes.trim() || undefined,
        depositAccount: depositAccount.trim(),
      })
      toast.success('주최 경기 정보를 수정했습니다.')
      router.push(`/host/matches/${matchId}`)
    } catch (err) {
      if (err instanceof Error && err.message === 'HOST_SCHEDULE_OVERLAP') {
        toast.error('이미 주최 중인 다른 경기와 시간이 겹칩니다.')
        return
      }
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      toast.error(`수정에 실패했습니다: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !match) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
          <Card className="border-border/50">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/host/matches/${matchId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Image
            src="/images/logo.jpg"
            alt="TeamUp Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">주최 경기 수정</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            수정
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <Card className="border-border/50">
          <CardContent className="space-y-5 p-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">경기 제목</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">구장</p>
              <Select value={courtId} onValueChange={setCourtId}>
                <SelectTrigger>
                  <SelectValue placeholder="구장을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {MATCH_COURT_PRESETS.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courtId && (
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{MATCH_COURT_PRESETS.find((c) => c.id === courtId)?.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">시작</p>
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">종료 (선택)</p>
                <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">참가비</p>
                <Input type="number" min={0} value={fee} onChange={(e) => setFee(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">정원</p>
                <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">경기 레벨</p>
              <Select value={level} onValueChange={(v) => setLevel(v as MatchLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="레벨 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ALL</SelectItem>
                  <SelectItem value="BEGINNER">BEGINNER</SelectItem>
                  <SelectItem value="INTERMEDIATE">INTERMEDIATE</SelectItem>
                  <SelectItem value="ADVANCED">ADVANCED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wallet className="h-4 w-4" /> 입금 계좌
              </p>
              <Input value={depositAccount} onChange={(e) => setDepositAccount(e.target.value)} />
            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4" /> 취소 정책
              </p>
              <Textarea value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">유의사항</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave} disabled={!canSubmit || isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            저장하기
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/host/matches/${matchId}`)}
            disabled={isSubmitting}
          >
            취소
          </Button>
        </div>
      </main>
    </div>
  )
}

