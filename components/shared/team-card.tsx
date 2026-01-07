'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MapPin, Sparkles, Trophy, Target, Calendar } from 'lucide-react'
import type { Team } from '@/types'

interface TeamCardProps {
  team: Team
  actionButton: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  showMatchScore?: boolean
}

// 팀 DNA별 색상 및 아이콘
const getTeamDnaInfo = (dna?: string) => {
  switch (dna) {
    case 'BULLS':
      return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Bulls' }
    case 'WARRIORS':
      return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Warriors' }
    case 'SPURS':
      return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Spurs' }
    default:
      return { color: 'text-primary', bg: 'bg-primary/10', label: 'Team' }
  }
}

export function TeamCard({ team, actionButton, showMatchScore = true }: TeamCardProps) {
  const iconBgClass = team.isOfficial
    ? 'bg-primary text-primary-foreground'
    : 'bg-secondary'
  
  const dnaInfo = getTeamDnaInfo(team.teamDna)

  return (
    <Card className="border-border/50 bg-card hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        {/* 헤더: 팀 이름, 레벨, 매칭 점수 */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgClass} shrink-0`}>
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 font-bold text-foreground text-lg">{team.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  레벨 {team.level}
                </Badge>
                {team.teamDna && (
                  <Badge className={`text-xs ${dnaInfo.bg} ${dnaInfo.color} border-0`}>
                    {dnaInfo.label}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {team.memberCount}/{team.maxMembers}명
                </span>
              </div>
            </div>
          </div>
          {showMatchScore && team.matchScore !== undefined && (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">{team.matchScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">매칭</p>
            </div>
          )}
        </div>

        {/* 지역 정보 */}
        <div className="mb-3 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{team.region}</span>
        </div>

        {/* 팀 소개 */}
        {team.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {team.description}
          </p>
        )}

        {/* 통계 정보 */}
        <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-secondary/30 p-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{team.totalGames}</span>
            </div>
            <p className="text-xs text-muted-foreground">경기</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{team.aiReports}</span>
            </div>
            <p className="text-xs text-muted-foreground">리포트</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{team.activeDays}</span>
            </div>
            <p className="text-xs text-muted-foreground">활동일</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-2">
          <Button
            variant={actionButton.variant || 'outline'}
            className="w-full"
            onClick={actionButton.onClick}
          >
            {actionButton.label}
          </Button>
          <a href={`/team/${team.id}`} className="w-full">
            <Button variant="default" className="w-full">상세 보기</Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
