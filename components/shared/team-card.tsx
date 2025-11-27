'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, MapPin, Sparkles } from 'lucide-react'
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

export function TeamCard({ team, actionButton, showMatchScore = true }: TeamCardProps) {
  const iconBgClass = team.isOfficial
    ? 'bg-primary text-primary-foreground'
    : 'bg-secondary'

  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgClass}`}>
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="mb-1 font-bold text-foreground">{team.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  레벨 {team.level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {team.memberCount}/{team.maxMembers}명
                </span>
              </div>
            </div>
          </div>
          {showMatchScore && team.matchScore !== undefined && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">{team.matchScore}%</span>
              </div>
            </div>
          )}
        </div>
        <div className="mb-3 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{team.region}</span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{team.description}</p>
        <Button
          variant={actionButton.variant || 'outline'}
          className="w-full"
          onClick={actionButton.onClick}
        >
          {actionButton.label}
        </Button>
      </CardContent>
    </Card>
  )
}
