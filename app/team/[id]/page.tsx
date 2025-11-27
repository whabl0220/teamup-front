'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, MapPin, Clock, Target, UserPlus, Crown } from 'lucide-react'

// TODO: 백엔드 API 연결 시 사용할 타입
interface TeamDetail {
  id: string
  name: string
  shortName: string
  level: string
  region: string
  memberCount: number
  maxMembers: number
  totalGames: number
  aiReports: number
  isOfficial: boolean
  description: string
  preferredTime?: string
  playStyle?: string
  gameFrequency?: string
  teamMood?: string
  captainKakaoId?: string // 참여 승인 후에만 제공
}

interface TeamMember {
  id: string
  name: string
  position: string
  isLeader: boolean
  joinedAt?: string
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [teamData, setTeamData] = useState<TeamDetail | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    // TODO: 백엔드 API 호출
    // const fetchTeamData = async () => {
    //   const response = await fetch(`/api/teams/${id}`)
    //   const data = await response.json()
    //   setTeamData(data)
    // }
    // fetchTeamData()

    // Mock 데이터 (팀 ID별로 다른 데이터)
    const mockTeams: Record<string, TeamDetail> = {
      '2': {
        id: '2',
        name: '세종 Warriors',
        shortName: 'SW',
        level: 'A',
        region: '광진구 능동',
        memberCount: 5,
        maxMembers: 5,
        totalGames: 20,
        aiReports: 15,
        isOfficial: true,
        description: '주말 오후에 활동하는 친목 위주 팀입니다. 즐겁게 운동하며 실력도 향상시켜요!',
        preferredTime: '주말 오후 (14:00 - 18:00)',
        playStyle: '빠른 공격',
        gameFrequency: '주 2-3회',
        teamMood: '친목 위주',
      },
      '3': {
        id: '3',
        name: '강남 Thunder',
        shortName: 'GT',
        level: 'A+',
        region: '강남구 역삼',
        memberCount: 4,
        maxMembers: 5,
        totalGames: 25,
        aiReports: 20,
        isOfficial: false,
        description: '1명 모집 중! 가드 포지션 우대합니다. 실력 향상을 목표로 하는 열정적인 팀입니다.',
        preferredTime: '평일 저녁 (19:00 - 22:00)',
        playStyle: '수비 중심',
        gameFrequency: '주 3-4회',
        teamMood: '실력 향상',
      },
      '4': {
        id: '4',
        name: '관악 Hoops',
        shortName: 'GH',
        level: 'B+',
        region: '관악구 신림',
        memberCount: 5,
        maxMembers: 5,
        totalGames: 15,
        aiReports: 12,
        isOfficial: true,
        description: '주 2회 정기 경기를 진행합니다. 부담 없이 즐기면서 실력도 키워요!',
        preferredTime: '주말 오전 (10:00 - 12:00)',
        playStyle: '균형잡힌',
        gameFrequency: '주 2회',
        teamMood: '친목 위주',
      },
      '5': {
        id: '5',
        name: '송파 Dunk',
        shortName: 'SD',
        level: 'A',
        region: '송파구 잠실',
        memberCount: 5,
        maxMembers: 5,
        totalGames: 22,
        aiReports: 18,
        isOfficial: true,
        description: '잠실 코트에서 주로 활동합니다. 덩크슛 연습도 함께 해요!',
        preferredTime: '주말 오후 (15:00 - 18:00)',
        playStyle: '골밑 플레이',
        gameFrequency: '주 2-3회',
        teamMood: '승부욕 강함',
      },
    }

    const mockMembersData: Record<string, TeamMember[]> = {
      '2': [
        { id: '1', name: '김철수', position: '포워드', isLeader: true },
        { id: '2', name: '이영희', position: '가드', isLeader: false },
        { id: '3', name: '박민수', position: '센터', isLeader: false },
        { id: '4', name: '최지원', position: '가드', isLeader: false },
        { id: '5', name: '정태영', position: '포워드', isLeader: false },
      ],
      '3': [
        { id: '6', name: '장민호', position: '센터', isLeader: true },
        { id: '7', name: '강수진', position: '포워드', isLeader: false },
        { id: '8', name: '윤서연', position: '포워드', isLeader: false },
        { id: '9', name: '한지우', position: '가드', isLeader: false },
      ],
      '4': [
        { id: '10', name: '박준영', position: '가드', isLeader: true },
        { id: '11', name: '최현우', position: '포워드', isLeader: false },
        { id: '12', name: '김나영', position: '가드', isLeader: false },
        { id: '13', name: '이도윤', position: '센터', isLeader: false },
        { id: '14', name: '정서현', position: '포워드', isLeader: false },
      ],
      '5': [
        { id: '15', name: '송민재', position: '센터', isLeader: true },
        { id: '16', name: '배현수', position: '포워드', isLeader: false },
        { id: '17', name: '오지호', position: '가드', isLeader: false },
        { id: '18', name: '서유진', position: '포워드', isLeader: false },
        { id: '19', name: '임채원', position: '가드', isLeader: false },
      ],
    }

    const mockTeam = mockTeams[id] || mockTeams['2']
    const mockMembers = mockMembersData[id] || mockMembersData['2']

    setTeamData(mockTeam)
    setMembers(mockMembers)

    // TODO: 현재 유저가 이 팀에 속해있는지 확인
    // const checkMembership = async () => {
    //   const response = await fetch(`/api/teams/${id}/is-member`)
    //   const { isMember } = await response.json()
    //   setIsJoined(isMember)
    // }
    // checkMembership()
  }, [id])

  const handleJoinTeam = async () => {
    // TODO: 백엔드 API 호출
    // const response = await fetch(`/api/teams/${id}/join`, {
    //   method: 'POST',
    //   body: JSON.stringify({ userId: currentUser.id })
    // })
    //
    // if (response.ok) {
    //   // AI가 적합도 분석 (선택적)
    //   const aiScore = await fetch('/api/ai/match-score', {
    //     method: 'POST',
    //     body: JSON.stringify({ userId: currentUser.id, teamId: id })
    //   })
    //
    //   setShowJoinModal(true)
    // }

    // Mock: 참여 요청
    alert('팀 참여 요청이 전송되었습니다!\n팀장이 승인하면 카카오톡 ID를 확인할 수 있습니다.')
    setShowJoinModal(true)
  }

  if (!teamData) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => router.push('/matching')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">팀 상세 정보</h1>
            <p className="text-xs text-muted-foreground">{teamData.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* 팀 기본 정보 카드 */}
        <Card className="mb-6 overflow-hidden border-border/50 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                {teamData.shortName}
              </div>
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold text-foreground">{teamData.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/20 text-primary">레벨 {teamData.level}</Badge>
                  <Badge variant="secondary" className="text-xs">{teamData.region}</Badge>
                  {teamData.isOfficial && (
                    <Badge className="bg-primary/10 text-xs text-primary">정식 팀</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-card/50 p-3">
                <p className="text-2xl font-bold text-foreground">
                  {teamData.memberCount}/{teamData.maxMembers}명
                </p>
                <p className="text-xs text-muted-foreground">팀원</p>
              </div>
              <div className="rounded-lg bg-card/50 p-3">
                <p className="text-2xl font-bold text-foreground">{teamData.totalGames}경기</p>
                <p className="text-xs text-muted-foreground">총 경기</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 팀 상세 정보 */}
        <Card className="mb-6 border-border/50 bg-card">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="mb-1 text-sm font-semibold text-foreground">활동 지역</p>
                <p className="text-sm text-muted-foreground">{teamData.region}</p>
              </div>
            </div>

            {teamData.preferredTime && (
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">선호 시간대</p>
                  <p className="text-sm text-muted-foreground">{teamData.preferredTime}</p>
                </div>
              </div>
            )}

            {teamData.description && (
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="mb-1 text-sm font-semibold text-foreground">팀 소개</p>
                  <p className="text-sm text-muted-foreground">{teamData.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 팀원 목록 */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              팀원 목록
            </h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {members.length}명
            </Badge>
          </div>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-0">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== members.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary font-semibold text-foreground">
                      {member.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{member.name}</p>
                        {member.isLeader && <Crown className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.position}</p>
                    </div>
                  </div>
                  {member.isLeader && (
                    <Badge variant="secondary" className="text-xs">
                      팀장
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 카카오톡 ID 안내 */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-center text-sm text-foreground">
              <span className="font-semibold">팀장 카카오톡 ID</span>는
              <br />
              팀 참여 승인 후에 확인할 수 있습니다
            </p>
          </CardContent>
        </Card>

        {/* 참여하기 버튼 */}
        <Button
          className="w-full font-semibold shadow-lg shadow-primary/20"
          size="lg"
          onClick={handleJoinTeam}
          disabled={teamData.memberCount >= teamData.maxMembers}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          {teamData.memberCount >= teamData.maxMembers ? '팀원 모집 완료' : '팀 참여하기'}
        </Button>
      </main>

      {/* 참여 완료 모달 (선택적) */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-center text-xl font-bold">참여 요청 완료!</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              팀장이 승인하면 알림을 보내드립니다
            </p>
            <Button className="w-full" onClick={() => router.push('/matching')}>
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
