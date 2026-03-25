'use client'

import { User, Position, PlayStyle, CardSkin, Team } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Sword, Target, Shield, Users, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PlayerCardProps {
  user: User
  currentTeam?: Team | null
  showExtendedInfo?: boolean // 이메일, 팀 정보 표시 여부
  className?: string
}

// 포지션 정보
const POSITION_INFO: Record<Position, { name: string; color: string }> = {
  GUARD: { name: '가드', color: 'text-blue-500' },
  FORWARD: { name: '포워드', color: 'text-green-500' },
  CENTER: { name: '센터', color: 'text-purple-500' }
}

// 플레이 스타일 정보
const PLAY_STYLE_INFO: Record<PlayStyle, { name: string; icon: typeof Sword; color: string }> = {
  SLASHER: { name: '돌파형', icon: Sword, color: 'text-red-500' },
  SHOOTER: { name: '슈터형', icon: Target, color: 'text-orange-500' },
  DEFENDER: { name: '수비형', icon: Shield, color: 'text-blue-600' },
  PASSER: { name: '패스형', icon: Users, color: 'text-green-600' }
}

export function PlayerCard({ user, currentTeam, showExtendedInfo = false, className = '' }: PlayerCardProps) {
  // 포지션에 따라 자동으로 카드 스킨 결정
  const getCardSkinFromPosition = (position?: Position): CardSkin => {
    if (!position) return 'PG_BLUE'

    switch (position) {
      case 'GUARD': return 'PG_BLUE'
      case 'FORWARD': return 'SF_GREEN'
      case 'CENTER': return 'C_PURPLE'
      default: return 'PG_BLUE'
    }
  }

  const cardSkin: CardSkin = getCardSkinFromPosition(user.position)

  // Border color 매핑
  const getBorderClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE': return 'border-blue-500'
      case 'SG_CYAN': return 'border-cyan-500'
      case 'SF_GREEN': return 'border-green-500'
      case 'PF_ORANGE': return 'border-orange-500'
      case 'C_PURPLE': return 'border-purple-500'
      default: return 'border-blue-500'
    }
  }

  // Gradient 매핑
  const getGradientClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE': return 'from-blue-600 to-blue-800'
      case 'SG_CYAN': return 'from-cyan-600 to-cyan-800'
      case 'SF_GREEN': return 'from-green-600 to-green-800'
      case 'PF_ORANGE': return 'from-orange-600 to-orange-800'
      case 'C_PURPLE': return 'from-purple-600 to-purple-800'
      default: return 'from-blue-600 to-blue-800'
    }
  }

  // Text color 매핑
  const getTextClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE': return 'text-blue-50'
      case 'SG_CYAN': return 'text-cyan-50'
      case 'SF_GREEN': return 'text-green-50'
      case 'PF_ORANGE': return 'text-orange-50'
      case 'C_PURPLE': return 'text-purple-50'
      default: return 'text-blue-50'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* FIFA 스타일 카드 */}
      <div className={`relative overflow-hidden rounded-2xl border-4 ${getBorderClass()} bg-gradient-to-br ${getGradientClass()} shadow-2xl`}>
        {/* 카드 배경 패턴 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />

        {/* 카드 내용 */}
        <div className="relative p-6">
          {/* 상단: 닉네임 */}
          <div className="mb-4">
            <h3 className={`text-2xl font-bold ${getTextClass()}`}>
              {user.name}
            </h3>

            {/* 이메일 정보 (확장 모드일 때만) */}
            {showExtendedInfo && (
              <div className="mt-2 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-white/60" />
                <p className="text-xs text-white/80">{user.email}</p>
              </div>
            )}
          </div>

          {/* 중앙: 플레이어 정보 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {/* 키 */}
            {user.height && (
              <div className="rounded-lg bg-black/20 p-2 text-center">
                <p className="text-xs text-white/70">키</p>
                <p className={`text-lg font-bold ${getTextClass()}`}>{user.height}cm</p>
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
                  <p className={`text-sm font-bold ${getTextClass()}`}>
                    {PLAY_STYLE_INFO[user.playStyle].name}
                  </p>
                </div>
              </div>
            )}

            {/* 포지션 */}
            {user.position && POSITION_INFO[user.position] && (
              <div className="col-span-2 rounded-lg bg-black/20 p-2 text-center">
                <p className="text-xs text-white/70">포지션</p>
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-lg font-bold ${POSITION_INFO[user.position].color}`}>
                    {POSITION_INFO[user.position].name}
                  </p>
                  {user.subPosition && user.subPosition !== user.position && POSITION_INFO[user.subPosition] && (
                    <>
                      <span className="text-white/50">/</span>
                      <p className={`text-sm font-bold ${POSITION_INFO[user.subPosition].color}`}>
                        {POSITION_INFO[user.subPosition].name}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 하단: 한 줄 각오 */}
          {user.statusMsg && (
            <div className="rounded-lg bg-black/30 p-2 text-center">
              <p className="text-sm italic text-white/90">
                {'"'}
                {user.statusMsg}
                {'"'}
              </p>
            </div>
          )}

          {/* 팀 정보 (확장 모드일 때만) */}
          {showExtendedInfo && currentTeam && (
            <div className="mt-3">
              <Link href={`/team/${currentTeam.id}`}>
                <div className="rounded-lg bg-black/30 p-3 transition-all hover:bg-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-white/70">소속 팀</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${getTextClass()}`}>{currentTeam.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-xs text-white">
                        레벨 {currentTeam.level}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-white/60" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* 카드 하단 장식 */}
        <div className={`h-2 bg-gradient-to-r ${getGradientClass()} opacity-50`} />
      </div>

      {/* 카드 섀도우 효과 */}
      <div className={`absolute inset-0 -z-10 translate-y-2 rounded-2xl bg-gradient-to-br ${getGradientClass()} opacity-30 blur-xl`} />
    </div>
  )
}
