'use client'

import Image from 'next/image'

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
  { id: 3, label: 'Small Forward', shortLabel: 'SF', top: '75%', left: '76%' },
  { id: 4, label: 'Power Forward', shortLabel: 'PF', top: '70%', left: '26%' },
  { id: 5, label: 'Center', shortLabel: 'C', top: '62%', left: '62%' },
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
        {POSITIONS.map((position) => (
          <button
            key={position.id}
            onClick={() => onPositionClick(position.id, position.shortLabel)}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
            style={{
              top: position.top,
              left: position.left,
              boxShadow: selectedPosition === position.id
                ? '0 8px 20px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              background: selectedPosition === position.id ? 'hsl(var(--primary))' : 'white',
              color: selectedPosition === position.id ? 'white' : '#1b1b1b',
            }}
          >
            <span className="text-lg font-bold leading-none">
              {position.id}
            </span>
            <span className="text-[11px] mt-1 uppercase tracking-wider font-semibold" style={{
              color: selectedPosition === position.id ? 'white' : '#ff7b32'
            }}>
              {position.shortLabel}
            </span>
          </button>
        ))}
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
