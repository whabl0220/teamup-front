'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, MessageCircle, Sparkles, Settings, LogOut, Crown, Copy, Check, X, Users, UserPlus, Shield, Zap, Users2 } from 'lucide-react'
import { toast } from 'sonner'
import { teamService, userService } from '@/lib/services'
import type { Team, TeamDNA } from '@/types'

// Team DNA 정보
const DNA_INFO: Record<TeamDNA, { name: string; icon: typeof Shield; color: string; bgColor: string; description: string }> = {
  BULLS: {
    name: 'Chicago Bulls',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: '수비와 투지'
  },
  WARRIORS: {
    name: 'Golden State Warriors',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: '3점슛과 재미'
  },
  SPURS: {
    name: 'San Antonio Spurs',
    icon: Users2,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    description: '패스와 기본기'
  }
}

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const teamId = params.id as string
  const fromParam = searchParams.get('from') // 'match-request', 'matched', null

  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; position: string; isLeader: boolean; kakaoId: string }>>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [showTeamSettingsModal, setShowTeamSettingsModal] = useState(false)
  const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false)
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false)
  const [showTransferLeaderModal, setShowTransferLeaderModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{ name: string; position: string; isLeader: boolean; kakaoId: string } | null>(null)
  const [teamName, setTeamName] = useState('')
  const [teamPhoto, setTeamPhoto] = useState('')
  const [teamDna, setTeamDna] = useState<TeamDNA>('BULLS')
  const [teamDescription, setTeamDescription] = useState('')

  // 현재 유저가 팀 멤버인지 확인
  const [isTeamMember, setIsTeamMember] = useState(false)
  const [isTeamLeader, setIsTeamLeader] = useState(false)

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true)

        // 팀 상세 정보 조회
        const teamData = await teamService.getTeam(teamId)
        setTeam(teamData)
        setTeamName(teamData.name)

        // 팀 사진 로드
        if (teamData.logo) {
          setTeamPhoto(teamData.logo)
        }

        // 팀 DNA 로드
        if (teamData.teamDna) {
          setTeamDna(teamData.teamDna)
        }

        // 팀 소개 로드
        if (teamData.description) {
          setTeamDescription(teamData.description)
        }

        // 현재 사용자 정보 조회
        const user = await userService.getMe()

        // 내 팀 목록 조회하여 멤버십 확인
        const myTeams = await teamService.getMyTeams()
        const isMember = myTeams.some((t) => t.id === teamId)
        setIsTeamMember(isMember)
        setIsTeamLeader(teamData.captainId === user.id)

        // 팀원 목록 생성 (현재는 팀장만 표시, 향후 API 추가 필요)
        const captain = {
          name: user.nickname || '팀장',
          position: user.mainPosition || 'SF',
          isLeader: true,
          kakaoId: user.email || 'captain_kakao_id',
        }
        setTeamMembers([captain])
      } catch (err) {
        console.error('팀 정보 로드 실패:', err)
        toast.error('팀 정보를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [teamId])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setTeamPhoto(base64)

      // localStorage에 개별 저장 (호환성)
      localStorage.setItem('teamPhoto', base64)

      // teamup_app_data에도 팀 사진 업데이트
      const appDataStr = localStorage.getItem('teamup_app_data')
      if (appDataStr) {
        const appData = JSON.parse(appDataStr)
        const teamIndex = appData.teams?.findIndex((t: Team) => t.id === teamId)
        if (teamIndex !== -1 && appData.teams) {
          appData.teams[teamIndex] = {
            ...appData.teams[teamIndex],
            logo: base64
          }
          localStorage.setItem('teamup_app_data', JSON.stringify(appData))
        }
      }

      // 현재 페이지의 team 상태도 업데이트
      if (team) {
        setTeam({
          ...team,
          logo: base64
        })
      }

      toast.success('팀 사진이 변경되었습니다!')
    }
    reader.readAsDataURL(file)
  }

  const handleCopyKakaoId = async (id: string, name: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(id)
      toast.success(`${name}님의 카카오톡 ID가 복사되었습니다!`)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      toast.error('복사에 실패했습니다.')
    }
  }

  const handleLeaveTeam = async () => {
    // TODO: 백엔드 API 연동
    setShowLeaveTeamModal(false)
    toast.info('팀 탈퇴 기능은 백엔드 연동 후 활성화됩니다.')
  }

  const handleJoinRequest = () => {
    setShowJoinRequestModal(true)
  }

  const confirmJoinRequest = () => {
    // TODO: 실제 API 연동
    setShowJoinRequestModal(false)
    toast.success('팀 참여 요청을 보냈습니다!')
  }

  const handleTransferLeader = (member: { name: string; position: string; isLeader: boolean; kakaoId: string }) => {
    setSelectedMember(member)
    setShowTransferLeaderModal(true)
  }

  const confirmTransferLeader = () => {
    // TODO: 실제 API 연동
    setShowTransferLeaderModal(false)
    toast.success(`${selectedMember?.name}님에게 팀장을 위임했습니다!`)

    // 팀원 목록에서 팀장 변경
    setTeamMembers(prev =>
      prev.map(m => ({
        ...m,
        isLeader: m.kakaoId === selectedMember?.kakaoId
      }))
    )

    // 내가 더 이상 팀장이 아니므로 팀장 권한 제거
    setIsTeamLeader(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-foreground">팀을 찾을 수 없습니다</p>
          <Button onClick={() => router.back()}>돌아가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">팀 정보</h1>
              <p className="text-xs text-muted-foreground">{teamName || team.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Team Profile */}
        <Card className="mb-6 overflow-hidden border-border/50 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {teamPhoto ? (
                  <img src={teamPhoto} alt="Team" className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                    {team.shortName}
                  </div>
                )}
                <div>
                  <h2 className="mb-1 text-2xl font-bold text-foreground">{teamName || team.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary/20 text-primary">레벨 {team.level}</Badge>
                    <Badge variant="secondary" className="text-xs">{team.region}</Badge>
                    {team.teamDna && DNA_INFO[team.teamDna] && (
                      <Badge className={`${DNA_INFO[team.teamDna].bgColor} ${DNA_INFO[team.teamDna].color} text-xs`}>
                        {DNA_INFO[team.teamDna].description}
                      </Badge>
                    )}
                  </div>
                  {team.isOfficial && (
                    <Badge className="mt-2 bg-green-500/10 text-green-600">정식 팀</Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              {team.description || '팀 소개가 없습니다.'}
            </p>

            {/* Team DNA 상세 정보 */}
            {team.teamDna && DNA_INFO[team.teamDna] && (
              <div className="mb-4 rounded-lg border border-border/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  {(() => {
                    const DnaIcon = DNA_INFO[team.teamDna!].icon
                    return <DnaIcon className={`h-5 w-5 ${DNA_INFO[team.teamDna!].color}`} />
                  })()}
                  <span className="text-sm font-semibold text-foreground">{DNA_INFO[team.teamDna].name} DNA</span>
                </div>

                {/* 레벨 및 경험치 바 */}
                {team.teamLevel !== undefined && team.teamExp !== undefined && (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">레벨 {team.teamLevel}</span>
                      <span className="text-muted-foreground">{team.teamExp} / 100 XP</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${DNA_INFO[team.teamDna].bgColor.replace('/10', '')}`}
                        style={{ width: `${team.teamExp}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-card/50 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{team.totalGames || 0}</p>
                <p className="text-xs text-muted-foreground">총 경기</p>
              </div>
              <div className="rounded-lg bg-card/50 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{team.aiReports || 0}</p>
                <p className="text-xs text-muted-foreground">AI 리포트</p>
              </div>
              <div className="rounded-lg bg-card/50 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{team.activeDays || 0}일</p>
                <p className="text-xs text-muted-foreground">활동</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 팀 멤버가 아닌 경우: 참여 요청 버튼 */}
        {!isTeamMember && !team.isOfficial && (
          <Button
            onClick={handleJoinRequest}
            className="mb-6 w-full font-semibold shadow-lg shadow-primary/20"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            팀 참여 요청하기
          </Button>
        )}

        {/* Team Members */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              팀원 목록
            </h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {team.memberCount}/{team.maxMembers}명
            </Badge>
          </div>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-0">
              {teamMembers.slice(0, team.memberCount).map((member, index) => (
                <div
                  key={index}
                  className={`p-4 ${
                    index !== team.memberCount - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary font-semibold text-foreground">
                        {member.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{member.name}</p>
                          {member.isLeader && (
                            <Crown className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.isLeader && (
                        <Badge variant="secondary" className="text-xs">팀장</Badge>
                      )}
                      {/* 팀장만 다른 팀원에게 팀장 위임 가능 */}
                      {isTeamLeader && !member.isLeader && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleTransferLeader(member)}
                        >
                          팀장 위임
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 카카오톡 ID 표시 로직 */}
                  {(() => {
                    // 받은 매칭 요청에서 온 경우: 카카오톡 아이디 전부 숨김
                    if (fromParam === 'match-request') {
                      return null
                    }

                    // 매칭된 경기에서 온 경우: 팀장의 카카오톡 아이디만 표시
                    if (fromParam === 'matched') {
                      if (!member.isLeader) return null

                      return (
                        <div className="ml-[52px] flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{member.kakaoId}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleCopyKakaoId(member.kakaoId, member.name)}
                          >
                            {copied === member.kakaoId ? (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                완료
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3 w-3" />
                                복사
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    }

                    // 기본: 팀 멤버면 모든 카카오톡 아이디 표시
                    if (isTeamMember) {
                      return (
                        <div className="ml-[52px] flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{member.kakaoId}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleCopyKakaoId(member.kakaoId, member.name)}
                          >
                            {copied === member.kakaoId ? (
                              <>
                                <Check className="mr-1 h-3 w-3" />
                                완료
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3 w-3" />
                                복사
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    }

                    return null
                  })()}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 최근 AI 코칭 - 팀 멤버만 볼 수 있음, 경기 기록이 있을 때만 표시 */}
        {isTeamMember && team.totalGames > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">최근 AI 코칭</h3>
            </div>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">아직 AI 코칭 기록이 없습니다.</p>
                  <p className="text-xs text-muted-foreground mt-1">경기를 진행하면 AI 분석 결과를 받을 수 있습니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Actions - 팀 멤버만 볼 수 있음 */}
        {isTeamMember && (
          <div className="space-y-2">
            {isTeamLeader && (
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  // 팀 설정 모달을 열 때마다 현재 team 상태에서 값 로드
                  if (team) {
                    setTeamName(team.name)
                    // 팀 사진도 team.logo에서 로드
                    setTeamPhoto(team.logo || '')
                    // 팀 DNA 로드
                    setTeamDna(team.teamDna || 'BULLS')
                    // 팀 소개 로드
                    setTeamDescription(team.description || '')
                  }
                  setShowTeamSettingsModal(true)
                }}
              >
                <Settings className="mr-2 h-5 w-5" />
                팀 설정
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              size="lg"
              onClick={() => setShowLeaveTeamModal(true)}
            >
              <LogOut className="mr-2 h-5 w-5" />
              팀 탈퇴하기
            </Button>
          </div>
        )}
      </main>

      {/* Join Request Modal */}
      {showJoinRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">팀 참여 요청</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{team.name}</span> 팀에 참여 요청을 보내시겠습니까?<br />
                팀장의 승인 후 팀원이 될 수 있습니다.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowJoinRequestModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmJoinRequest}
                >
                  요청 보내기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Settings Modal */}
      {showTeamSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">팀 설정</h3>
                  <p className="text-sm text-muted-foreground">팀 정보를 수정할 수 있습니다</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowTeamSettingsModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Team Photo */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-foreground">
                    팀 사진
                  </label>
                  <div className="flex items-center gap-4">
                    {teamPhoto ? (
                      <img src={teamPhoto} alt="Team" className="h-20 w-20 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                        {team.shortName}
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        사진 변경
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Team Name */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-foreground">
                    팀 이름
                  </label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Team DNA */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-foreground">
                    팀 DNA (AI 코치 스타일)
                  </label>
                  <div className="grid gap-2">
                    {(Object.keys(DNA_INFO) as TeamDNA[]).map((dna) => {
                      const DnaIcon = DNA_INFO[dna].icon
                      const isSelected = teamDna === dna
                      return (
                        <Card
                          key={dna}
                          className={`cursor-pointer border-2 transition-all ${
                            isSelected
                              ? `${DNA_INFO[dna].color.replace('text-', 'border-')} ${DNA_INFO[dna].bgColor}`
                              : 'border-border/50 hover:border-border'
                          }`}
                          onClick={() => setTeamDna(dna)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <DnaIcon className={`h-5 w-5 ${DNA_INFO[dna].color}`} />
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${isSelected ? DNA_INFO[dna].color : 'text-foreground'}`}>
                                  {DNA_INFO[dna].name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {DNA_INFO[dna].description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Team Description */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      팀 소개
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {teamDescription.length}/30
                    </span>
                  </div>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 30) {
                        setTeamDescription(value)
                      }
                    }}
                    placeholder="팀을 소개하는 문구를 입력하세요 (최대 30자)"
                    className="h-16 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button
                  className="w-full font-semibold"
                  size="lg"
                  onClick={() => {
                    // localStorage에 개별 저장 (홈 페이지 호환성)
                    localStorage.setItem('teamName', teamName)
                    if (teamPhoto) {
                      localStorage.setItem('teamPhoto', teamPhoto)
                    }

                    // teamup_app_data에도 팀 정보 업데이트 (이름, 사진, DNA, 소개 모두)
                    const appDataStr = localStorage.getItem('teamup_app_data')
                    if (appDataStr) {
                      const appData = JSON.parse(appDataStr)
                      const teamIndex = appData.teams?.findIndex((t: Team) => t.id === teamId)
                      if (teamIndex !== -1 && appData.teams) {
                        appData.teams[teamIndex] = {
                          ...appData.teams[teamIndex],
                          name: teamName,
                          logo: teamPhoto || appData.teams[teamIndex].logo,
                          teamDna: teamDna,
                          description: teamDescription
                        }
                        localStorage.setItem('teamup_app_data', JSON.stringify(appData))
                      }
                    }

                    // 현재 페이지의 team 상태도 업데이트 (이름, 사진, DNA, 소개 모두)
                    if (team) {
                      setTeam({
                        ...team,
                        name: teamName,
                        logo: teamPhoto || team.logo,
                        teamDna: teamDna,
                        description: teamDescription
                      })
                    }

                    toast.success('팀 설정이 저장되었습니다!')
                    setShowTeamSettingsModal(false)
                  }}
                >
                  변경사항 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer Leader Modal */}
      {showTransferLeaderModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">팀장 위임</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedMember.name}</span>님에게 팀장을 위임하시겠습니까?<br />
                <span className="font-semibold text-primary">위임 후에는 되돌릴 수 없습니다.</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTransferLeaderModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmTransferLeader}
                >
                  위임하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Team Modal */}
      {showLeaveTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">팀 탈퇴</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                정말 탈퇴하시겠습니까?<br />
                <span className="font-semibold text-destructive">팀 기록을 더 이상 볼 수 없습니다.</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLeaveTeamModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleLeaveTeam}
                >
                  탈퇴하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
