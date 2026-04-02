'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toDateKey, WEEKDAY_LABELS_KO } from '@/lib/match-list-date'

export type MatchDateCarouselProps = {
  selectedDate: 'ALL' | string
  onSelect: (value: 'ALL' | string) => void
  /** 오늘 기준 며칠치까지 표시 (기본 14일 = 2주) */
  days?: number
  className?: string
}

export function MatchDateCarousel({
  selectedDate,
  onSelect,
  days = 14,
  className,
}: MatchDateCarouselProps) {
  /** 사용자 기기 로컬 타임존의 “오늘”부터 연속 캘린더 일자 (일자·요일·키 모두 이 Date 기준) */
  const items = useMemo(() => {
    const today = new Date()
    return Array.from({ length: days }, (_, idx) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + idx)
      const key = toDateKey(d)
      const dayOfMonth = d.getDate()
      const weekday = WEEKDAY_LABELS_KO[d.getDay()]
      return { key, dayOfMonth, weekday }
    })
  }, [days])

  return (
    <div
      className={cn(
        'match-date-carousel-scroll -mx-1 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-1 pb-2',
        className
      )}
    >
      <Button
        type="button"
        variant={selectedDate === 'ALL' ? 'default' : 'outline'}
        size="sm"
        className="h-auto min-h-[3.5rem] shrink-0 snap-start self-stretch px-3 py-2"
        onClick={() => onSelect('ALL')}
      >
        전체
      </Button>
      {items.map((opt) => {
        const selected = selectedDate === opt.key
        return (
          <Button
            key={opt.key}
            type="button"
            variant={selected ? 'default' : 'outline'}
            size="sm"
            className="h-auto min-h-[3.5rem] shrink-0 snap-start min-w-[3rem] flex-col gap-0.5 px-2 py-2"
            onClick={() => onSelect(opt.key)}
          >
            <span className="text-base font-semibold leading-none tabular-nums">{opt.dayOfMonth}</span>
            <span
              className={cn(
                'text-[11px] font-medium leading-none',
                selected ? 'text-primary-foreground/90' : 'text-muted-foreground'
              )}
            >
              {opt.weekday}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
