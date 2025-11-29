'use client'

import { User, Position, PlayStyle, SkillLevel, CardSkin, SKILL_LEVEL_SCORES } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sword, Target, Shield, Users, Award, Star } from 'lucide-react'

interface PlayerCardProps {
  user: User
  className?: string
}

// 포지션 정보
const POSITION_INFO: Record<Position, { name: string; color: string }> = {
  G: { name: '가드', color: 'text-blue-500' },
  F: { name: '포워드', color: 'text-green-500' },
  C: { name: '센터', color: 'text-purple-500' }
}

// 플레이 스타일 정보
const PLAY_STYLE_INFO: Record<PlayStyle, { name: string; icon: typeof Sword; color: string }> = {
  SL: { name: '돌파형', icon: Sword, color: 'text-red-500' },
  SH: { name: '슈터형', icon: Target, color: 'text-orange-500' },
  DF: { name: '수비형', icon: Shield, color: 'text-blue-600' },
  PA: { name: '패스형', icon: Users, color: 'text-green-600' }
}

// 스킬 레벨 이름
const SKILL_LEVEL_NAMES: Record<SkillLevel, string> = {
  ROOKIE: '입문',
  BEGINNER: '초보',
  INTERMEDIATE: '중수',
  ADVANCED: '고수',
  PRO: '선출'
}

// 카드 스킨 스타일
const CARD_SKIN_STYLES: Record<CardSkin, { gradient: string; borderColor: string; textColor: string }> = {
  DEFAULT: {
    gradient: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-500',
    textColor: 'text-slate-100'
  },
  GOLD: {
    gradient: 'from-yellow-600 to-amber-700',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-50'
  },
  RARE: {
    gradient: 'from-purple-600 to-pink-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-50'
  }
}

export function PlayerCard({ user, className = '' }: PlayerCardProps) {
  const cardSkin = user.cardSkin || 'DEFAULT'
  const skinStyle = CARD_SKIN_STYLES[cardSkin]
  const skillScore = user.skillLevel ? SKILL_LEVEL_SCORES[user.skillLevel] : 50

  return (
    <div className={`relative ${className}`}>
      {/* FIFA 스타일 카드 */}
      <div className={`relative overflow-hidden rounded-2xl border-4 ${skinStyle.borderColor} bg-gradient-to-br ${skinStyle.gradient} shadow-2xl`}>
        {/* 카드 배경 패턴 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />

        {/* 카드 내용 */}
        <div className="relative p-6">
          {/* 상단: 닉네임 & 레벨 */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className={`text-2xl font-bold ${skinStyle.textColor}`}>
                {user.name}
              </h3>
              {user.position && (
                <p className={`text-sm font-semibold ${POSITION_INFO[user.position].color}`}>
                  {POSITION_INFO[user.position].name}
                  {user.subPosition && user.subPosition !== user.position && (
                    <span className="text-xs text-white/70"> / {POSITION_INFO[user.subPosition].name}</span>
                  )}
                </p>
              )}
            </div>

            {/* 종합 점수 */}
            <div className="flex flex-col items-center">
              <div className={`text-5xl font-black ${skinStyle.textColor}`}>
                {skillScore}
              </div>
              <div className="text-xs text-white/80">OVR</div>
            </div>
          </div>

          {/* 중앙: 플레이어 정보 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {/* 키 */}
            {user.height && (
              <div className="rounded-lg bg-black/20 p-2 text-center">
                <p className="text-xs text-white/70">키</p>
                <p className={`text-lg font-bold ${skinStyle.textColor}`}>{user.height}cm</p>
              </div>
            )}

            {/* 플레이 스타일 */}
            {user.playStyle && (
              <div className="rounded-lg bg-black/20 p-2 text-center">
                <p className="text-xs text-white/70">스타일</p>
                <div className="flex items-center justify-center gap-1">
                  {(() => {
                    const StyleIcon = PLAY_STYLE_INFO[user.playStyle].icon
                    return <StyleIcon className={`h-4 w-4 ${PLAY_STYLE_INFO[user.playStyle].color}`} />
                  })()}
                  <p className={`text-sm font-bold ${skinStyle.textColor}`}>
                    {PLAY_STYLE_INFO[user.playStyle].name}
                  </p>
                </div>
              </div>
            )}

            {/* 실력 레벨 */}
            {user.skillLevel && (
              <div className="col-span-2 rounded-lg bg-black/20 p-2 text-center">
                <p className="text-xs text-white/70">실력</p>
                <div className="flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <p className={`text-lg font-bold ${skinStyle.textColor}`}>
                    {SKILL_LEVEL_NAMES[user.skillLevel]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 하단: 한 줄 각오 */}
          {user.statusMsg && (
            <div className="rounded-lg bg-black/30 p-2 text-center">
              <p className="text-sm italic text-white/90">"{user.statusMsg}"</p>
            </div>
          )}

          {/* 카드 등급 뱃지 */}
          {cardSkin !== 'DEFAULT' && (
            <div className="absolute right-3 top-3">
              <Badge className="bg-white/20 text-xs text-white">
                {cardSkin === 'GOLD' && '⭐ GOLD'}
                {cardSkin === 'RARE' && '💎 RARE'}
              </Badge>
            </div>
          )}
        </div>

        {/* 카드 하단 장식 */}
        <div className={`h-2 bg-gradient-to-r ${skinStyle.gradient} opacity-50`} />
      </div>

      {/* 카드 섀도우 효과 */}
      <div className={`absolute inset-0 -z-10 translate-y-2 rounded-2xl bg-gradient-to-br ${skinStyle.gradient} opacity-30 blur-xl`} />
    </div>
  )
}
