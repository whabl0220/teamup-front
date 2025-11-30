'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { ArrowLeft, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react'
import type { PostType } from '@/types'
import DaumPostcodeEmbed from 'react-daum-postcode'
import useKakaoLoader from '@/hooks/useKakaoLoader'

export default function CreatePostPage() {
  useKakaoLoader()

  const router = useRouter()
  const [postType, setPostType] = useState<PostType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedHour, setSelectedHour] = useState('')
  const [selectedMinute, setSelectedMinute] = useState('')
  const [location, setLocation] = useState('') // 상세주소 (장소명)
  const [address, setAddress] = useState('') // 기본주소
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [kakaoLink, setKakaoLink] = useState('')
  const [description, setDescription] = useState('')
  const [showPostcode, setShowPostcode] = useState(false)
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)

  // 시간 옵션
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = ['00', '10', '20', '30', '40', '50']

  // 날짜/시간 포맷팅
  const formatDateTime = () => {
    if (!selectedDate || !selectedHour || !selectedMinute) {
      return '경기 시간을 선택하세요'
    }
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    return `${year}년 ${month}월 ${day}일 ${selectedHour}:${selectedMinute}`
  }

  // 주소 검색 완료 시
  const handleAddressComplete = (data: any) => {
    const fullAddress = data.address // 기본주소
    setAddress(fullAddress)
    setShowPostcode(false)

    // 카카오 Geocoder로 주소 → 좌표 변환
    if (window.kakao && window.kakao.maps) {
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(fullAddress, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setLatitude(parseFloat(result[0].y))
          setLongitude(parseFloat(result[0].x))
        }
      })
    }
  }

  const handleSubmit = () => {
    if (!postType || !selectedDate || !selectedHour || !selectedMinute || !address || !location || !kakaoLink) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    if (!latitude || !longitude) {
      alert('주소에서 위치를 찾을 수 없습니다. 다시 검색해주세요.')
      return
    }

    // TODO: 실제 API 연동
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const gameTime = `${year}-${month}-${day} ${selectedHour}:${selectedMinute}`

    const newPost = {
      type: postType,
      address, // 기본주소
      location, // 상세주소 (장소명)
      latitude,
      longitude,
      gameTime,
      kakaoLink,
      description,
    }
    console.log('새 모집글:', newPost)
    alert('모집글이 등록되었습니다!')
    router.push('/map')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">모집글 작성</h1>
            <p className="text-sm text-muted-foreground">근처에서 같이 농구할 사람을 찾아보세요</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* 모집 유형 선택 */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">모집 유형</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className={`cursor-pointer border-2 transition-all ${
                postType === 'MATCH'
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => setPostType('MATCH')}
            >
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-3xl">⚔️</div>
                <h4 className="font-bold text-foreground">팀 경기</h4>
                <p className="text-xs text-muted-foreground mt-1">5 vs 5 팀 대결</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer border-2 transition-all ${
                postType === 'GUEST'
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50 hover:border-border'
              }`}
              onClick={() => setPostType('GUEST')}
            >
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-3xl">🏃</div>
                <h4 className="font-bold text-foreground">용병 모집</h4>
                <p className="text-xs text-muted-foreground mt-1">부족한 인원 채우기</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 경기 정보 입력 */}
        {postType && (
          <>
            {/* 날짜/시간 선택 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                경기 날짜 및 시간 <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDateTimePicker(true)}
                className="w-full justify-start text-left h-auto py-3 gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <Clock className="h-4 w-4" />
                {formatDateTime()}
              </Button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                경기 장소 주소 <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="주소를 검색하세요"
                  value={address}
                  readOnly
                  className="bg-background flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPostcode(true)}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  검색
                </Button>
              </div>
              {latitude && longitude && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ 위치 확인됨 ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </p>
              )}
            </div>

            {address && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  장소명 (상세주소) <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="예: 광진 농구장, 워커힐 체육관"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-background"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  지도에 표시될 장소명을 입력하세요
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                카카오톡 오픈채팅 링크 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="https://open.kakao.com/o/..."
                value={kakaoLink}
                onChange={(e) => setKakaoLink(e.target.value)}
                className="bg-background"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                참여자들이 이 링크로 입장합니다
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                추가 설명 (선택)
              </label>
              <Textarea
                placeholder={
                  postType === 'MATCH'
                    ? '예: 주말 저녁 한 게임 하실 팀 구합니다!'
                    : '예: 가드 포지션 1명 급구!'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background min-h-[100px]"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {description.length}/100
              </p>
            </div>

            {/* 등록 버튼 */}
            <div className="pt-4">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
              >
                모집글 등록하기
              </Button>
            </div>
          </>
        )}
      </main>

      {/* 우편번호 검색 모달 */}
      {showPostcode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-lg max-h-[600px] overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-foreground">주소 검색</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPostcode(false)}
              >
                닫기
              </Button>
            </div>
            <div className="overflow-auto max-h-[500px]">
              <DaumPostcodeEmbed
                onComplete={handleAddressComplete}
                autoClose={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* 날짜/시간 선택 모달 */}
      {showDateTimePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-foreground">경기 날짜 및 시간 선택</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDateTimePicker(false)}
              >
                닫기
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {/* 달력 */}
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>

              {/* 시간 선택 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">시간 선택</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">시</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="w-full h-12 rounded-md border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                    >
                      <option value="">선택</option>
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}시</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">분</label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="w-full h-12 rounded-md border-2 border-border bg-background px-3 text-base focus:border-primary focus:outline-none"
                    >
                      <option value="">선택</option>
                      {minutes.map((m) => (
                        <option key={m} value={m}>{m}분</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 확인 버튼 */}
              <Button
                type="button"
                className="w-full"
                onClick={() => setShowDateTimePicker(false)}
                disabled={!selectedDate || !selectedHour || !selectedMinute}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
