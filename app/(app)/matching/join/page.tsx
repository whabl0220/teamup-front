'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'
import { TeamCard } from '@/components/shared/team-card'
import { mockJoinTeams } from '@/lib/mock-data'
import type { Team } from '@/types'

export default function JoinTeamsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTeams, setFilteredTeams] = useState<Team[]>(mockJoinTeams)

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = mockJoinTeams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.region.toLowerCase().includes(query) ||
      team.level.toLowerCase().includes(query)
    )
    setFilteredTeams(filtered)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">팀 참여하기</h1>
            <p className="text-xs text-muted-foreground">모집 중인 팀 전체 목록</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="팀 이름, 지역, 레벨로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 팀 목록 */}
        {filteredTeams.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                actionButton={{
                  label: '참여하기',
                  onClick: () => router.push(`/team/${team.id}`),
                  variant: 'outline'
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
