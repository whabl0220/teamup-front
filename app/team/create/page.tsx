'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus } from 'lucide-react'
import type { TeamCreationData } from '@/types'
import { SEOUL_DISTRICTS, DISTRICT_LIST, formatRegion, type DistrictName } from '@/lib/constants'

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
      alert('필수 항목을 모두 입력해주세요!')
      return
    }

    // TODO: 실제 백엔드 API 호출
    // const response = await api.createTeam(formData)

    // Mock: localStorage에 팀 저장
    const newTeam = {
      id: Date.now().toString(),
      name: formData.name,
      shortName: formData.name.substring(0, 2).toUpperCase(),
      memberCount: 1,
      maxMembers: formData.maxMembers || 5,
      level: formData.level,
      region: formData.region,
      totalGames: 0,
      aiReports: 0,
      activeDays: 0,
      isOfficial: false,
      captainId: 'user1', // TODO: 실제 유저 ID
      description: formData.description || `${formData.region}에서 활동하는 팀입니다.`,
      matchScore: 0,
      // AI 매칭용 데이터
      preferredTime: formData.preferredTime,
      playStyle: formData.playStyle,
      gameFrequency: formData.gameFrequency,
      teamMood: formData.teamMood,
      travelDistance: formData.travelDistance,
    }

    localStorage.setItem('myTeam', JSON.stringify(newTeam))
    localStorage.setItem('teamName', formData.name)

    // 성공 모달 표시
    setShowSuccessModal(true)
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
