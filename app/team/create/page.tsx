'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Shield, Zap, Users2 } from 'lucide-react'
import type { TeamCreationData, TeamDNA } from '@/types'
import { SEOUL_DISTRICTS, DISTRICT_LIST, formatRegion, type DistrictName } from '@/lib/constants'
import { teamService, type CreateTeamApiRequest } from '@/lib/services'
import { toast } from 'sonner'
import { userService } from '@/lib/services'

// 선택 옵션 정의
const TIME_OPTIONS = [
  { value: 'weekday_morning', label: '평일 오전' },
  { value: 'weekday_afternoon', label: '평일 오후' },
  { value: 'weekday_evening', label: '평일 저녁' },
  { value: 'weekend_morning', label: '주말 오전' },
  { value: 'weekend_afternoon', label: '주말 오후' },
  { value: 'weekend_evening', label: '주말 저녁' },
]

const STYLE_OPTIONS = [
  { value: 'fast_attack', label: '빠른 공격' },
  { value: 'defense', label: '수비 중심' },
  { value: 'balanced', label: '균형잡힌' },
  { value: 'three_point', label: '3점슛 위주' },
  { value: 'inside', label: '골밑 플레이' },
]

const FREQUENCY_OPTIONS = [
  { value: 'week_1', label: '주 1회' },
  { value: 'week_2_3', label: '주 2-3회' },
  { value: 'week_4_plus', label: '주 4회 이상' },
  { value: 'month_1_2', label: '월 1-2회' },
]

const MOOD_OPTIONS = [
  { value: 'competitive', label: '승부욕 강함' },
  { value: 'friendly', label: '친목 위주' },
  { value: 'improvement', label: '실력 향상' },
  { value: 'casual', label: '가볍게' },
]

const DISTANCE_OPTIONS = [
  { value: 'local_only', label: '우리 지역만' },
  { value: 'nearby_5km', label: '인접 지역 (5km)' },
  { value: 'seoul_all', label: '서울 전역' },
  { value: 'metropolitan', label: '수도권 전역' },
]

// Team DNA 옵션
const DNA_OPTIONS = [
  {
    value: 'BULLS' as TeamDNA,
    name: 'Chicago Bulls',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    description: '수비와 투지',
    detail: '강한 수비와 끈질긴 투지로 승리를 쟁취하는 팀'
  },
  {
    value: 'WARRIORS' as TeamDNA,
    name: 'Golden State Warriors',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    description: '3점슛과 재미',
    detail: '화끈한 3점슛과 빠른 템포로 즐기는 팀'
  },
  {
    value: 'SPURS' as TeamDNA,
    name: 'San Antonio Spurs',
    icon: Users2,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/50',
    description: '패스와 기본기',
    detail: '정확한 패스와 탄탄한 기본기로 이기는 팀'
  }
]

export default function CreateTeamPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<TeamCreationData>({
    name: '',
    region: '',
    level: 'B',
    preferredTime: null,
    playStyle: null,
    gameFrequency: null,
    teamMood: null,
    travelDistance: null,
    maxMembers: 5,
  })

  // Team DNA 선택 상태
  const [selectedDNA, setSelectedDNA] = useState<TeamDNA | null>(null)

  // 지역 선택 상태
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictName | null>(null)
  const [selectedDong, setSelectedDong] = useState<string | null>(null)
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 드롭다운 상태
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showStyleDropdown, setShowStyleDropdown] = useState(false)
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [showMoodDropdown, setShowMoodDropdown] = useState(false)
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false)

  // 팀 생성 완료 모달
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // 구 선택 핸들러
  const handleDistrictSelect = (district: DistrictName) => {
    setSelectedDistrict(district)
    setSelectedDong(null) // 구 변경 시 동 초기화
  }

  // 동 선택 핸들러
  const handleDongSelect = (dong: string) => {
    setSelectedDong(dong)
    if (selectedDistrict) {
      setFormData({ ...formData, region: formatRegion(selectedDistrict, dong) })
      setShowRegionModal(false)
      setSearchQuery('')
    }
  }

  // 구만 선택 완료
  const handleDistrictConfirm = () => {
    if (selectedDistrict) {
      setFormData({ ...formData, region: selectedDistrict })
      setShowRegionModal(false)
      setSearchQuery('')
    }
  }

  // 검색 필터링 (구 이름 + 동 이름)
  const filteredDistricts = DISTRICT_LIST.filter(district => {
    // 구 이름으로 검색
    if (district.includes(searchQuery)) return true
    // 동 이름으로 검색
    return SEOUL_DISTRICTS[district].some(dong => dong.includes(searchQuery))
  })

  const handleSubmit = async () => {
    // 필수 항목 검증
    if (!formData.name || !formData.region || !formData.level) {
      toast.error('필수 항목을 모두 입력해주세요!')
      return
    }

    // 정원 검증
    if (!formData.maxMembers || formData.maxMembers < 2 || formData.maxMembers > 50) {
      toast.error('팀 정원은 2명 이상 50명 이하여야 합니다!')
      return
    }

    // Team DNA 필수 검증
    if (!selectedDNA) {
      toast.error('팀 DNA를 선택해주세요!')
      return
    }

    try {
      // 로그인된 유저 정보 가져오기
      const currentUser = await userService.getMe()
      if (!currentUser) {
        toast.error('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      const userId = parseInt(currentUser.id)

      const createTeamRequest: CreateTeamApiRequest = {
        name: formData.name,
        teamDna: selectedDNA,
        emblemUrl: undefined, // 엠블럼은 나중에 추가
      }

      const response = await teamService.createTeamApi(userId, createTeamRequest)

      toast.success('팀 생성 완료!', {
        description: `${response.name} 팀이 생성되었습니다.`,
      })

      // 팀 생성 완료 - API로 조회하므로 localStorage에 저장 불필요

      // 성공 모달 표시
      setShowSuccessModal(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '팀 생성에 실패했습니다.'
      toast.error('팀 생성 실패', {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">팀 생성하기</h1>
            <p className="text-xs text-muted-foreground">AI 매칭을 위한 팀 정보</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <Card className="border-border/50 bg-card">
          <CardContent className="space-y-6 p-6">

            {/* 팀 이름 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                팀 이름 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 세종 Warriors"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 정원 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                팀 정원 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="예: 5"
                value={formData.maxMembers || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  if (value === '') {
                    setFormData({ ...formData, maxMembers: undefined })
                  } else {
                    setFormData({ ...formData, maxMembers: parseInt(value) })
                  }
                }}
                className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formData.maxMembers !== undefined && (formData.maxMembers < 2 || formData.maxMembers > 50 || isNaN(formData.maxMembers)) && (
                <p className="mt-2 text-sm text-destructive">
                  2~50 사이의 숫자를 입력해주세요
                </p>
              )}
            </div>

            {/* 활동 지역 */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                활동 지역 <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={() => setShowRegionModal(!showRegionModal)}
              >
                <span className={formData.region ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.region || '지역을 선택하세요'}
                </span>
                <span className="text-muted-foreground">▼</span>
              </Button>

              {/* 드롭다운 */}
              {showRegionModal && (
                <div className="absolute z-10 mt-2 w-full max-w-[calc(100%-2rem)] rounded-lg border border-border bg-card shadow-lg">
                  {/* 검색 */}
                  <div className="p-3 border-b border-border">
                    <input
                      type="text"
                      placeholder="검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* 구/동 선택 */}
                  <div className="flex max-h-60 overflow-hidden">
                    {/* 왼쪽: 구 */}
                    <div className="w-1/2 border-r border-border overflow-y-auto">
                      {filteredDistricts.map((district) => (
                        <button
                          key={district}
                          onClick={() => handleDistrictSelect(district)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 ${
                            selectedDistrict === district ? 'bg-primary/10 text-primary font-semibold' : ''
                          }`}
                        >
                          {district}
                        </button>
                      ))}
                    </div>

                    {/* 오른쪽: 동 */}
                    <div className="w-1/2 overflow-y-auto">
                      {selectedDistrict ? (
                        <>
                          <button
                            onClick={handleDistrictConfirm}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/50"
                          >
                            {selectedDistrict} 전체
                          </button>
                          {SEOUL_DISTRICTS[selectedDistrict]
                            .filter(dong => dong.includes(searchQuery))
                            .map((dong) => (
                              <button
                                key={dong}
                                onClick={() => handleDongSelect(dong)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 ${
                                  selectedDong === dong ? 'bg-primary/10 text-primary font-semibold' : ''
                                }`}
                              >
                                {dong}
                              </button>
                            ))}
                        </>
                      ) : (
                        <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                          구를 선택하세요
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 실력 레벨 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                실력 레벨 <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'] as const).map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={formData.level === level ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, level })}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Team DNA 선택 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                팀 DNA <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                NBA 레전드 팀 스타일을 선택하세요. AI 매니저의 조언 방식이 달라집니다.
              </p>
              <div className="grid gap-3">
                {DNA_OPTIONS.map((dna) => {
                  const Icon = dna.icon
                  const isSelected = selectedDNA === dna.value
                  return (
                    <button
                      key={dna.value}
                      type="button"
                      onClick={() => setSelectedDNA(isSelected ? null : dna.value)}
                      className={`relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all ${
                        isSelected
                          ? `${dna.borderColor} ${dna.bgColor}`
                          : 'border-border bg-secondary/30 hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${dna.bgColor}`}>
                          <Icon className={`h-6 w-6 ${dna.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-bold text-foreground">{dna.name}</h3>
                            {isSelected && (
                              <Badge className={dna.color}>선택됨</Badge>
                            )}
                          </div>
                          <p className={`text-sm font-semibold ${dna.color}`}>{dna.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{dna.detail}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-border/50 pt-2">
              <p className="text-xs text-muted-foreground">
                아래 항목은 선택사항입니다. 입력하지 않으면 "상관없음"으로 간주됩니다.
              </p>
            </div>

            {/* 선호 시간대 */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                선호 시간대 <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              >
                <span className={formData.preferredTime ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.preferredTime
                    ? TIME_OPTIONS.find(o => o.value === formData.preferredTime)?.label
                    : '선택하세요'}
                </span>
                <span className="text-muted-foreground">▼</span>
              </Button>

              {/* 드롭다운 */}
              {showTimeDropdown && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, preferredTime: null })
                      setShowTimeDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 border-b border-border text-muted-foreground"
                  >
                    선택 안 함
                  </button>
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, preferredTime: option.value as any })
                        setShowTimeDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 ${
                        formData.preferredTime === option.value ? 'bg-primary/10 text-primary font-semibold' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 플레이 스타일 */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                플레이 스타일 <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
              >
                <span className={formData.playStyle ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.playStyle
                    ? STYLE_OPTIONS.find(o => o.value === formData.playStyle)?.label
                    : '선택하세요'}
                </span>
                <span className="text-muted-foreground">▼</span>
              </Button>

              {/* 드롭다운 */}
              {showStyleDropdown && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, playStyle: null })
                      setShowStyleDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 border-b border-border text-muted-foreground"
                  >
                    선택 안 함
                  </button>
                  {STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, playStyle: option.value as any })
                        setShowStyleDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 ${
                        formData.playStyle === option.value ? 'bg-primary/10 text-primary font-semibold' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 경기 빈도 */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                경기 빈도 <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
              >
                <span className={formData.gameFrequency ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.gameFrequency
                    ? FREQUENCY_OPTIONS.find(o => o.value === formData.gameFrequency)?.label
                    : '선택하세요'}
                </span>
                <span className="text-muted-foreground">▼</span>
              </Button>

              {/* 드롭다운 */}
              {showFrequencyDropdown && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, gameFrequency: null })
                      setShowFrequencyDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 border-b border-border text-muted-foreground"
                  >
                    선택 안 함
                  </button>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, gameFrequency: option.value as any })
                        setShowFrequencyDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 ${
                        formData.gameFrequency === option.value ? 'bg-primary/10 text-primary font-semibold' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 팀 분위기 */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                팀 분위기 <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={() => setShowMoodDropdown(!showMoodDropdown)}
              >
                <span className={formData.teamMood ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.teamMood
                    ? MOOD_OPTIONS.find(o => o.value === formData.teamMood)?.label
                    : '선택하세요'}
                </span>
                <span className="text-muted-foreground">▼</span>
              </Button>

              {/* 드롭다운 */}
              {showMoodDropdown && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, teamMood: null })
                      setShowMoodDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 border-b border-border text-muted-foreground"
                  >
                    선택 안 함
                  </button>
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, teamMood: option.value as any })
                        setShowMoodDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 ${
                        formData.teamMood === option.value ? 'bg-primary/10 text-primary font-semibold' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 이동 가능 거리 */}
            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                이동 가능 거리 <span className="text-muted-foreground text-xs">(선택)</span>
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={() => setShowDistanceDropdown(!showDistanceDropdown)}
              >
                <span className={formData.travelDistance ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.travelDistance
                    ? DISTANCE_OPTIONS.find(o => o.value === formData.travelDistance)?.label
                    : '선택하세요'}
                </span>
                <span className="text-muted-foreground">▼</span>
              </Button>

              {/* 드롭다운 */}
              {showDistanceDropdown && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, travelDistance: null })
                      setShowDistanceDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 border-b border-border text-muted-foreground"
                  >
                    선택 안 함
                  </button>
                  {DISTANCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData({ ...formData, travelDistance: option.value as any })
                        setShowDistanceDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 ${
                        formData.travelDistance === option.value ? 'bg-primary/10 text-primary font-semibold' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 생성 버튼 */}
            <Button
              className="w-full font-semibold shadow-lg shadow-primary/20"
              size="lg"
              onClick={handleSubmit}
            >
              <Plus className="mr-2 h-5 w-5" />
              팀 생성하기
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* 팀 생성 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-center text-xl font-bold">팀 생성 완료!</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{formData.name}</span> 팀이 생성되었습니다.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/matching')}
              >
                매칭 보기
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push('/home')}
              >
                홈으로
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
