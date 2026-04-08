'use client'

import { User, Position, PlayStyle, CardSkin, Team } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Sword, Target, Shield, Users, Mail, ChevronRight, UserRound } from 'lucide-react'
import Link from 'next/link'

interface PlayerCardProps {
  user: User
  currentTeam?: Team | null
  showExtendedInfo?: boolean // 이메일, 팀 정보 표시 여부
  className?: string
}

// 포지션 정보 (라이트 / 다크 대비)
const POSITION_INFO: Record<Position, { name: string; color: string }> = {
  GUARD: { name: '가드', color: 'player-card-position-guard' },
  FORWARD: { name: '포워드', color: 'player-card-position-forward' },
  CENTER: { name: '센터', color: 'player-card-position-center' },
}

// 플레이 스타일 정보
const PLAY_STYLE_INFO: Record<PlayStyle, { name: string; icon: typeof Sword; color: string }> = {
  SLASHER: { name: '돌파형', icon: Sword, color: 'player-card-playstyle-slasher' },
  SHOOTER: { name: '슈터형', icon: Target, color: 'player-card-playstyle-shooter' },
  DEFENDER: { name: '수비형', icon: Shield, color: 'player-card-playstyle-defender' },
  PASSER: { name: '패스형', icon: Users, color: 'player-card-playstyle-passer' },
}

/** 0·빈값·NaN은 미입력으로 취급 (폼 기본값 0으로 인한 "0cm" 노출 방지) */
const resolvePositiveHeightCm = (height: User['height']): number | undefined => {
  if (height === undefined || height === null) return undefined
  const n = typeof height === 'string' ? Number(height) : height
  if (typeof n !== 'number' || Number.isNaN(n) || n <= 0) return undefined
  return n
}

export function PlayerCard({ user, currentTeam, showExtendedInfo = false, className = '' }: PlayerCardProps) {
  const heightCm = resolvePositiveHeightCm(user.height)

  const hasPlayerCardDetails =
    heightCm != null ||
    Boolean(user.position) ||
    Boolean(user.playStyle) ||
    Boolean(user.statusMsg?.trim())

  const displayName = user.name?.trim() || '닉네임 미설정'

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

  // Border (라이트 paste / 다크 은은한 글로우)
  const getBorderClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE':
        return 'player-card-border-pg'
      case 'SG_CYAN':
        return 'player-card-border-sg'
      case 'SF_GREEN':
        return 'player-card-border-sf'
      case 'PF_ORANGE':
        return 'player-card-border-pf'
      case 'C_PURPLE':
        return 'player-card-border-c'
      default:
        return 'player-card-border-pg'
    }
  }

  // Gradient (라이트 밝은 파스텔 / 다크 딥 톤)
  const getGradientClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE':
        return 'player-card-gradient-pg'
      case 'SG_CYAN':
        return 'player-card-gradient-sg'
      case 'SF_GREEN':
        return 'player-card-gradient-sf'
      case 'PF_ORANGE':
        return 'player-card-gradient-pf'
      case 'C_PURPLE':
        return 'player-card-gradient-c'
      default:
        return 'player-card-gradient-pg'
    }
  }

  // 강조 텍스트 (닉네임·수치)
  const getTextClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE':
        return 'player-card-accent-pg'
      case 'SG_CYAN':
        return 'player-card-accent-sg'
      case 'SF_GREEN':
        return 'player-card-accent-sf'
      case 'PF_ORANGE':
        return 'player-card-accent-pf'
      case 'C_PURPLE':
        return 'player-card-accent-c'
      default:
        return 'player-card-accent-pg'
    }
  }

  const getShadowClass = () => {
    switch (cardSkin) {
      case 'PG_BLUE':
        return 'player-card-shadow-pg'
      case 'SG_CYAN':
        return 'player-card-shadow-sg'
      case 'SF_GREEN':
        return 'player-card-shadow-sf'
      case 'PF_ORANGE':
        return 'player-card-shadow-pf'
      case 'C_PURPLE':
        return 'player-card-shadow-c'
      default:
        return 'player-card-shadow-pg'
    }
  }

  const panelClass =
    'player-card-panel rounded-lg p-2 text-center'
  const mutedLabelClass = 'player-card-muted-label text-xs'

  const isUnsetCard = !hasPlayerCardDetails
  const unsetCardFrameClass =
    'border-slate-300/90 dark:border-slate-600 bg-gradient-to-br from-slate-100 via-slate-200/95 to-slate-300/80 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-950 shadow-lg shadow-slate-400/20 dark:shadow-black/35'
  const unsetAccentClass = 'text-slate-700 dark:text-slate-100'
  const unsetBottomBarClass =
    'from-slate-300 via-slate-400 to-slate-500 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800'
  const unsetBackdropClass =
    'from-slate-300/70 via-slate-400/50 to-slate-500/40 dark:from-slate-800/70 dark:via-slate-900/60 dark:to-slate-950/50'

  const cardFrameClassName = isUnsetCard
    ? `player-card-shadow relative overflow-hidden rounded-2xl border-4 bg-gradient-to-br ${unsetCardFrameClass}`
    : `player-card-shadow ${getShadowClass()} relative overflow-hidden rounded-2xl border-4 bg-gradient-to-br ${getBorderClass()} ${getGradientClass()}`

  const accentClassName = isUnsetCard ? unsetAccentClass : getTextClass()

  return (
    <div className={`relative ${className}`}>
      {/* FIFA 스타일 카드 */}
      <div className={cardFrameClassName}>
        {/* 카드 배경 패턴 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent opacity-70 dark:from-white/[0.08] dark:opacity-100" />

        {/* 카드 내용 */}
        <div className="relative p-6">
          {!hasPlayerCardDetails ? (
            <>
              <div className="mb-4 flex flex-col items-center gap-2 text-center">
                <Badge variant="secondary" className="font-normal">
                  카드 미설정
                </Badge>
                <h3 className={`text-2xl font-bold ${accentClassName}`}>{displayName}</h3>
                {showExtendedInfo && user.email && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Mail className="player-card-email-icon h-3.5 w-3.5" />
                    <p className="player-card-email text-xs">{user.email}</p>
                  </div>
                )}
              </div>

              <div className="mb-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-400/50 bg-slate-200/35 px-4 py-8 text-center dark:border-slate-500/45 dark:bg-slate-900/45">
                <UserRound className={`h-10 w-10 opacity-80 ${accentClassName}`} />
                <p className="text-sm font-medium text-foreground/90">플레이어 카드 정보가 아직 없어요</p>
                <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                  프로필 설정에서 포지션·플레이 스타일·한 줄 소개를 입력하면 카드가 채워져요.
                </p>
              </div>

              {showExtendedInfo && currentTeam && (
                <div className="mt-3">
                  <Link href={`/team/${currentTeam.id}`}>
                    <div className="player-card-team rounded-lg p-3 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={mutedLabelClass}>소속 팀</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${accentClassName}`}>{currentTeam.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="player-card-team-level text-xs">
                            레벨 {currentTeam.level}
                          </Badge>
                          <ChevronRight className="player-card-chevron h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
          {/* 상단: 닉네임 */}
          <div className="mb-4">
            <h3 className={`text-2xl font-bold ${accentClassName}`}>
              {displayName}
            </h3>

            {/* 이메일 정보 (확장 모드일 때만) */}
            {showExtendedInfo && (
              <div className="mt-2 flex items-center gap-1.5">
                <Mail className="player-card-email-icon h-3.5 w-3.5" />
                <p className="player-card-email text-xs">{user.email}</p>
              </div>
            )}
          </div>

          {/* 중앙: 플레이어 정보 */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {/* 키 */}
            {heightCm != null && (
              <div className={panelClass}>
                <p className={mutedLabelClass}>키</p>
                <p className={`text-lg font-bold ${accentClassName}`}>{heightCm}cm</p>
              </div>
            )}

            {/* 플레이 스타일 */}
            {user.playStyle && (
              <div className={panelClass}>
                <p className={mutedLabelClass}>스타일</p>
                <div className="flex items-center justify-center gap-1">
                  {(() => {
                    const StyleIcon = PLAY_STYLE_INFO[user.playStyle].icon
                    return <StyleIcon className={`h-4 w-4 ${PLAY_STYLE_INFO[user.playStyle].color}`} />
                  })()}
                  <p className={`text-sm font-bold ${accentClassName}`}>
                    {PLAY_STYLE_INFO[user.playStyle].name}
                  </p>
                </div>
              </div>
            )}

            {/* 포지션 */}
            {user.position && POSITION_INFO[user.position] && (
              <div className={`col-span-2 ${panelClass}`}>
                <p className={mutedLabelClass}>포지션</p>
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-lg font-bold ${POSITION_INFO[user.position].color}`}>
                    {POSITION_INFO[user.position].name}
                  </p>
                  {user.subPosition && user.subPosition !== user.position && POSITION_INFO[user.subPosition] && (
                    <>
                      <span className="player-card-divider">/</span>
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
            <div className="player-card-panel rounded-lg p-2 text-center">
              <p className="player-card-status-msg text-sm italic">
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
                <div className="player-card-team rounded-lg p-3 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={mutedLabelClass}>소속 팀</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${accentClassName}`}>{currentTeam.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="player-card-team-level text-xs">
                        레벨 {currentTeam.level}
                      </Badge>
                      <ChevronRight className="player-card-chevron h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
            </>
          )}
        </div>

        {/* 카드 하단 장식 */}
        <div
          className={
            isUnsetCard
              ? `h-2 bg-gradient-to-r ${unsetBottomBarClass} opacity-80`
              : `h-2 bg-gradient-to-r ${getGradientClass()} opacity-70`
          }
        />
      </div>

      {/* 카드 섀도우 효과 */}
      <div
        className={
          isUnsetCard
            ? `player-card-backdrop absolute inset-0 -z-10 translate-y-2 rounded-2xl bg-gradient-to-br ${unsetBackdropClass} blur-xl`
            : `player-card-backdrop absolute inset-0 -z-10 translate-y-2 rounded-2xl bg-gradient-to-br ${getGradientClass()} blur-xl`
        }
      />
    </div>
  )
}
