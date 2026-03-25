'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PlusCircle, Wallet, Building2, CalendarDays } from 'lucide-react'
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
import { matchService } from '@/lib/services'
import { MATCH_COURT_PRESETS } from '@/lib/match-courts'
import type { MatchLevel } from '@/types/match'
import { toast } from 'sonner'

const pad2 = (n: number) => String(n).padStart(2, '0')

const toLocalDatetimeValue = (d: Date) => {
  // datetime-local expects local time format: YYYY-MM-DDTHH:mm
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const toIsoFromLocalDatetime = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid datetime')
  }
  return d.toISOString()
}

export default function HostMatchCreatePage() {
  const router = useRouter()

  const defaultStartAt = useMemo(() => {
    const d = new Date()
    d.setHours(d.getHours() + 2)
    return toLocalDatetimeValue(d)
  }, [])

  const [title, setTitle] = useState('오늘 저녁 픽업 게임')
  const [courtId, setCourtId] = useState(MATCH_COURT_PRESETS[0]?.id ?? '')
  const [startAt, setStartAt] = useState(defaultStartAt)
  const [endAt, setEndAt] = useState('')
  const [fee, setFee] = useState<number>(8000)
  const [capacity, setCapacity] = useState<number>(15)
  const [level, setLevel] = useState<MatchLevel>('ALL')
  const [cancellationPolicy, setCancellationPolicy] = useState('경기 시작 12시간 전까지 100% 환불')
  const [notes, setNotes] = useState('유니폼 자유, 물 개인 지참')
  const [depositAccount, setDepositAccount] = useState('토스뱅크 1000-0000-0000 TeamUp')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = Boolean(
    title.trim() &&
      courtId &&
      startAt &&
      Number.isFinite(fee) &&
      fee > 0 &&
      Number.isFinite(capacity) &&
      capacity > 0 &&
      depositAccount.trim()
  )

  const handleCreate = async () => {
    if (!canSubmit) {
      toast.error('필수 항목을 확인해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
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
      }

      const created = await matchService.createMatch(payload)
      toast.success('매치가 생성되었습니다.')
      router.push(`/host/matches/${created.id}`)
    } catch (err) {
      toast.error('매치 생성에 실패했습니다.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/host/matches')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">매치 생성</h1>
          <Badge variant="secondary" className="ml-auto">로컬 생성</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4 pb-24">
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">매치 제목</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 평일 저녁 픽업" />
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
                  <span>
                    {MATCH_COURT_PRESETS.find((c) => c.id === courtId)?.address}
                  </span>
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
                <Input
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">정원</p>
                <Input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">매치 레벨</p>
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
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" /> 입금 계좌
              </p>
              <Input value={depositAccount} onChange={(e) => setDepositAccount(e.target.value)} placeholder="예: 토스뱅크 ..." />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
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
          <Button
            className="flex-1"
            onClick={handleCreate}
            disabled={!canSubmit || isSubmitting}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            생성하기
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/host/matches')}
            disabled={isSubmitting}
          >
            취소
          </Button>
        </div>
      </main>
    </div>
  )
}

