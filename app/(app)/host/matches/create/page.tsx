'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PlusCircle, Wallet, Building2, CalendarDays } from 'lucide-react'
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
import { getMatchCourtById, MATCH_COURT_PRESETS } from '@/lib/match-courts'
import { getMatchLevelLabel } from '@/lib/match-level-meta'
import type { MatchLevel } from '@/types/match'
import { toast } from 'sonner'

const toIsoFromLocalDatetime = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid datetime')
  }
  return d.toISOString()
}

export default function HostMatchCreatePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [courtId, setCourtId] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [fee, setFee] = useState('')
  const [capacity, setCapacity] = useState('')
  const [level, setLevel] = useState<MatchLevel>('ALL')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [notes, setNotes] = useState('')
  const [depositAccount, setDepositAccount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedFee = Number(fee)
  const parsedCapacity = Number(capacity)
  const canSubmit = Boolean(
    title.trim() &&
      courtId &&
      startAt &&
      fee.trim() &&
      Number.isFinite(parsedFee) &&
      parsedFee > 0 &&
      capacity.trim() &&
      Number.isFinite(parsedCapacity) &&
      parsedCapacity > 0 &&
      depositAccount.trim()
  )

  const handleCreate = async () => {
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

      const payload = {
        title: title.trim(),
        courtId,
        startAt: toIsoFromLocalDatetime(startAt),
        endAt: endAt.trim() ? toIsoFromLocalDatetime(endAt) : undefined,
        fee: Math.round(parsedFee),
        capacity: Math.round(parsedCapacity),
        level,
        cancellationPolicy: cancellationPolicy.trim() || undefined,
        notes: notes.trim() || undefined,
        depositAccount: depositAccount.trim(),
      }

      const created = await matchService.createMatch(payload)
      toast.success('주최 경기가 생성되었습니다.')
      router.push(`/host/matches/${created.id}`)
    } catch (err) {
      if (err instanceof Error && err.message === 'HOST_SCHEDULE_OVERLAP') {
        toast.error('이미 주최 중인 경기와 시간이 겹칩니다.')
        return
      }
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      toast.error(`주최 경기 생성에 실패했습니다: ${message}`)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <h1 className="text-2xl font-bold tracking-tight">주최 경기 생성</h1>
            <p className="text-sm text-muted-foreground">새로운 주최 경기를 등록하세요</p>
          </div>
          <Badge variant="secondary" className="ml-auto">로컬 생성</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4 pb-24">
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">경기 제목</p>
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
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  placeholder="예: 2026-03-30T19:00"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">종료 (선택)</p>
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  placeholder="예: 2026-03-30T21:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">총 참가비</p>
                <Input
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="예: 8000"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">정원</p>
                <Input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="예: 15"
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">경기 레벨</p>
              <Select value={level} onValueChange={(v) => setLevel(v as MatchLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="레벨 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{getMatchLevelLabel('ALL')}</SelectItem>
                  <SelectItem value="BEGINNER">{getMatchLevelLabel('BEGINNER')}</SelectItem>
                  <SelectItem value="INTERMEDIATE">{getMatchLevelLabel('INTERMEDIATE')}</SelectItem>
                  <SelectItem value="ADVANCED">{getMatchLevelLabel('ADVANCED')}</SelectItem>
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
              <Textarea
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="예: 경기 시작 12시간 전까지 100% 환불"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">유의사항</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 유니폼 자유, 물 개인 지참"
              />
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

