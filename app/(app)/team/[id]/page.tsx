'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, MessageCircle, Sparkles, CheckCircle, Settings, LogOut, Crown, Copy, Check, X, TrendingUp, Target, Lightbulb, Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import type { Team } from '@/types'

// Mock 팀원 데이터 (실제로는 API에서 가져와야 함)
const mockTeamMembers = [
  { name: '김철수', position: '포워드', isLeader: true, kakaoId: 'captain_kim_123' },
  { name: '이영희', position: '가드', isLeader: false, kakaoId: 'lee_younghee' },
  { name: '박민수', position: '센터', isLeader: false, kakaoId: 'park_minsu' },
  { name: '최지원', position: '가드', isLeader: false, kakaoId: 'choi_jiwon' },
  { name: '정태영', position: '포워드', isLeader: false, kakaoId: 'jung_taeyoung' },
]

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showSurveyModal, setShowSurveyModal] = useState(false)
  const [showCoachingModal, setShowCoachingModal] = useState(false)
  const [showTeamSettingsModal, setShowTeamSettingsModal] = useState(false)
  const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false)
  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teamPhoto, setTeamPhoto] = useState('')

  const [surveyData, setSurveyData] = useState({
    opponent: '',
    result: '',
    difficulty: '',
    teamwork: '',
    tempo: '',
    strength: '',
    improvement: '',
    weakness: [] as string[],
    comment: ''
  })

  // 현재 유저가 팀 멤버인지 확인 (Mock)
  const [isTeamMember, setIsTeamMember] = useState(false)
  const [isTeamLeader, setIsTeamLeader] = useState(false)

  useEffect(() => {
    // TODO: 실제 API로 팀 데이터 로드
    // const fetchTeam = async () => {
    //   try {
    //     const response = await fetch(`/api/team/${teamId}`)
    //     const data = await response.json()
    //     setTeam(data)
    //   } catch (error) {
    //     toast.error('팀 정보를 불러올 수 없습니다.')
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchTeam()

    // Mock: localStorage에서 팀 데이터 로드
    const loadTeamData = () => {
      const appDataStr = localStorage.getItem('teamup_app_data')
      if (appDataStr) {
        const appData = JSON.parse(appDataStr)
        const foundTeam = appData.teams?.find((t: Team) => t.id === teamId)

        if (foundTeam) {
          setTeam(foundTeam)
          setTeamName(foundTeam.name)

          // 팀 사진도 로드 (logo 필드에서)
          if (foundTeam.logo) {
            setTeamPhoto(foundTeam.logo)
          }

          // 현재 유저가 이 팀의 멤버인지 확인
          const currentTeamId = appData.user?.currentTeamId
          setIsTeamMember(currentTeamId === teamId)
          setIsTeamLeader(foundTeam.captainId === appData.user?.id)
        } else {
          toast.error('팀을 찾을 수 없습니다.')
        }
      }
      setLoading(false)
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

  const handleStartCompletion = () => {
    setShowCompleteModal(true)
  }

  const handleConfirmComplete = () => {
    setShowCompleteModal(false)
    setShowSurveyModal(true)
  }

  const handleSubmitSurvey = () => {
    // TODO: 실제 백엔드 API 호출
    setShowSurveyModal(false)
    setShowCoachingModal(true)
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
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary">레벨 {team.level}</Badge>
                    <Badge variant="secondary" className="text-xs">{team.region}</Badge>
                  </div>
                  {team.isOfficial && (
                    <Badge className="mt-2 bg-green-500/10 text-green-600">정식 팀</Badge>
                  )}
                </div>
              </div>
            </div>

            {team.description && (
              <p className="mb-4 text-sm text-muted-foreground">{team.description}</p>
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

        {/* 팀 멤버인 경우: 경기 완료 버튼 */}
        {isTeamMember && (
          <Button
            onClick={handleStartCompletion}
            className="mb-6 w-full font-semibold shadow-lg shadow-primary/20"
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            경기 완료하기
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
                    {member.isLeader && (
                      <Badge variant="secondary" className="text-xs">팀장</Badge>
                    )}
                  </div>

                  {/* 카카오톡 ID - 팀 멤버만 볼 수 있음 */}
                  {isTeamMember && (
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
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 최근 AI 코칭 - 팀 멤버만 볼 수 있음 */}
        {isTeamMember && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">최근 AI 코칭</h3>
            </div>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">8월 10일 경기 분석</p>
                    <p className="text-xs text-muted-foreground">{team.name} vs 서울 Tigers</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">승리</Badge>
                </div>

                <div className="mb-3 space-y-2">
                  <div className="rounded-lg bg-primary/5 p-3">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold text-primary">강점:</span> 팀워크가 우수하며 빠른 공격 전환이 돋보였습니다.
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-3">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold text-muted-foreground">개선점:</span> 수비 리바운드 강화가 필요합니다.
                    </p>
                  </div>
                </div>

                <Link href="/coaching">
                  <Button variant="outline" size="sm" className="w-full">
                    전체 코칭 보기
                  </Button>
                </Link>
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
                    if (team.logo) {
                      setTeamPhoto(team.logo)
                    }
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

      {/* Complete Match Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">경기 완료 처리</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                경기 완료로 처리할까요?<br />
                팀원 중 누구라도 누르면 경기 전체가 종료됩니다.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCompleteModal(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmComplete}
                >
                  경기 완료
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">AI 코칭 설문</h3>
                    <p className="text-sm text-muted-foreground">경기 피드백을 입력해주세요</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowSurveyModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* 상대팀 이름 */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-foreground">
                      상대팀 이름
                    </label>
                    <Input
                      placeholder="예: 강남 Warriors"
                      value={surveyData.opponent}
                      onChange={(e) => setSurveyData({ ...surveyData, opponent: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  {/* 경기 결과 */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-foreground">
                      경기 결과
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['승리', '패배'].map((option) => (
                        <Button
                          key={option}
                          variant={surveyData.result === option ? 'default' : 'outline'}
                          onClick={() => setSurveyData({ ...surveyData, result: option })}
                          className="w-full"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 난이도 */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-foreground">
                      오늘 경기 난이도는 어땠나요?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['쉬움', '보통', '어려움'].map((option) => (
                        <Button
                          key={option}
                          variant={surveyData.difficulty === option ? 'default' : 'outline'}
                          onClick={() => setSurveyData({ ...surveyData, difficulty: option })}
                          className="w-full"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 팀워크 */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-foreground">
                      팀워크는 어땠나요?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['좋음', '보통', '부족'].map((option) => (
                        <Button
                          key={option}
                          variant={surveyData.teamwork === option ? 'default' : 'outline'}
                          onClick={() => setSurveyData({ ...surveyData, teamwork: option })}
                          className="w-full"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 강점 */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-foreground">
                      우리 팀의 강점은?
                    </label>
                    <textarea
                      value={surveyData.strength}
                      onChange={(e) => setSurveyData({ ...surveyData, strength: e.target.value })}
                      placeholder="예: 패스가 잘 연결됨, 빠른 공격 전환 등"
                      className="h-20 w-full rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* 보완점 */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-foreground">
                      보완해야 할 점은?
                    </label>
                    <textarea
                      value={surveyData.improvement}
                      onChange={(e) => setSurveyData({ ...surveyData, improvement: e.target.value })}
                      placeholder="예: 리바운드 약함, 수비 소통 부족 등"
                      className="h-20 w-full rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button
                    className="w-full font-semibold"
                    size="lg"
                    onClick={handleSubmitSurvey}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI 코칭 생성하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Coaching Modal */}
      {showCoachingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">AI 코칭 리포트</h3>
                      <p className="text-sm text-muted-foreground">오늘 경기 분석</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowCoachingModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      오늘 경기 총평
                    </p>
                    <p className="text-sm text-foreground">
                      팀원 간의 호흡이 좋았으며, 공격적인 플레이가 돋보였습니다.
                      다만 체력 관리와 수비 리바운드 개선이 필요해 보입니다.
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">강점</p>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-secondary/30 p-3">
                        <p className="text-sm text-foreground">• 빠른 공격 전환과 팀워크</p>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-3">
                        <p className="text-sm text-foreground">• 패스 정확도가 우수함</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">약점</p>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded-lg bg-secondary/30 p-3">
                        <p className="text-sm text-foreground">• 수비 리바운드 강화 필요</p>
                      </div>
                      <div className="rounded-lg bg-secondary/30 p-3">
                        <p className="text-sm text-foreground">• 후반 체력 관리 개선 필요</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">다음 경기 추천 전략</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-3">
                      <p className="text-sm text-foreground">
                        리바운드 포지셔닝 연습과 지구력 훈련을 병행하면
                        다음 경기에서 더 좋은 결과를 얻을 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full font-semibold"
                    size="lg"
                    onClick={() => setShowCoachingModal(false)}
                  >
                    닫기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Team Settings Modal */}
      {showTeamSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/50 bg-card">
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

                <Button
                  className="w-full font-semibold"
                  size="lg"
                  onClick={() => {
                    // localStorage에 개별 저장 (홈 페이지 호환성)
                    localStorage.setItem('teamName', teamName)
                    if (teamPhoto) {
                      localStorage.setItem('teamPhoto', teamPhoto)
                    }

                    // teamup_app_data에도 팀 정보 업데이트 (이름과 사진 모두)
                    const appDataStr = localStorage.getItem('teamup_app_data')
                    if (appDataStr) {
                      const appData = JSON.parse(appDataStr)
                      const teamIndex = appData.teams?.findIndex((t: Team) => t.id === teamId)
                      if (teamIndex !== -1 && appData.teams) {
                        appData.teams[teamIndex] = {
                          ...appData.teams[teamIndex],
                          name: teamName,
                          logo: teamPhoto || appData.teams[teamIndex].logo
                        }
                        localStorage.setItem('teamup_app_data', JSON.stringify(appData))
                      }
                    }

                    // 현재 페이지의 team 상태도 업데이트 (이름과 사진 모두)
                    if (team) {
                      setTeam({
                        ...team,
                        name: teamName,
                        logo: teamPhoto || team.logo
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
