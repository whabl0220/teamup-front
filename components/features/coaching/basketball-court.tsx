'use client'

import Image from 'next/image'
import { POSITION_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Position {
  id: number
  label: string
  shortLabel: string
  top: string
  left: string
}

const POSITIONS: Position[] = [
  { id: 1, label: 'Point Guard', shortLabel: 'PG', top: '32%', left: '50%' },
  { id: 2, label: 'Shooting Guard', shortLabel: 'SG', top: '47%', left: '20%' },
  { id: 3, label: 'Small Forward', shortLabel: 'SF', top: '79%', left: '78%' },
  { id: 4, label: 'Power Forward', shortLabel: 'PF', top: '70%', left: '26%' },
  { id: 5, label: 'Center', shortLabel: 'C', top: '62%', left: '70%' },
]

interface BasketballCourtProps {
  onPositionClick: (positionId: number, positionLabel: string) => void
  selectedPosition?: number | null
}

export function BasketballCourt({ onPositionClick, selectedPosition }: BasketballCourtProps) {
  return (
    <div className="w-full mx-auto">
      {/* 코트 이미지 배경 */}
      <div className="relative w-full h-[500px]">
        <Image
          src="/images/basketballcourt.png"
          alt="Basketball Court"
          fill
          className="object-contain"
        />

        {/* 포지션 버튼들 */}
        {POSITIONS.map((position) => {
          const positionColor = POSITION_COLORS[position.id as keyof typeof POSITION_COLORS]
          const isSelected = selectedPosition === position.id

          return (
            <button
              key={position.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onPositionClick(position.id, position.shortLabel)}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 border-4 border-[var(--position-accent)]',
                positionColor.themeClass,
                isSelected
                  ? 'bg-[var(--position-accent)] text-white shadow-[0_4px_8px_rgba(0,0,0,0.2)]'
                  : 'bg-white text-[var(--position-accent)] shadow-[0_2px_4px_rgba(0,0,0,0.1)]'
              )}
              style={{
                top: position.top,
                left: position.left,
              }}
            >
              <span className="text-lg font-bold leading-none">
                {position.id}
              </span>
              <span className="text-[11px] mt-1 uppercase tracking-wider font-semibold">
                {position.shortLabel}
              </span>
            </button>
          )
        })}
      </div>

      {/* 하단 설명 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          포지션을 선택하여 팀 피드백을 제출하세요
        </p>
      </div>
    </div>
  )
}
