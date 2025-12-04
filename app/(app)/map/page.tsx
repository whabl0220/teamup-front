'use client'

import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Post, Team } from '@/types'
import KakaoMap, { type MarkerData } from '@/components/shared/KakaoMap'
import { mockMatchTeams } from '@/lib/mock-data'
import { toast } from 'sonner'

// 용병 모집 글
const mockGuestPosts: Post[] = [
  {
    id: 'post_1',
    type: 'GUEST',
    teamId: '6',
    teamName: '관악 Thunders',
    latitude: 37.5481,
    longitude: 127.0851,
    gameTime: '2025-11-30 15:00',
    location: '서울특별시 광진구 구천면로 2',
    kakaoLink: 'https://open.kakao.com/o/example1',
    description: '어린이 대공원 근처에서 같이 농구할 사람 모집해요.',
    additionalDescription: '초보자도 환영합니다! 편한 분위기에서 즐겁게 농구해요.',
    createdAt: '2025-11-30 11:00',
    distance: 0.5
  },
  {
    id: 'post_2',
    type: 'GUEST',
    teamId: '1',
    teamName: '세종 born',
    latitude: 37.5475,
    longitude: 127.0740,
    gameTime: '2025-12-01 19:00',
    location: '서울특별시 광진구 능동로 10',
    kakaoLink: 'https://open.kakao.com/o/example2',
    description: '포워드 포지션 2명 구합니다!',
    additionalDescription: '키 180 이상 선호합니다. 실력은 중수 이상이면 좋아요! 주 2회 정기 경기 있습니다.',
    createdAt: '2025-11-30 10:00',
    distance: 1.0
  },
  {
    id: 'post_3',
    type: 'GUEST',
    teamId: '8',
    teamName: '송파 Dragons',
    latitude: 37.5478,
    longitude: 127.0741,
    gameTime: '2025-12-02 18:00',
    location: '서울특별시 광진구 능동로 27',
    kakaoLink: 'https://open.kakao.com/o/example3',
    description: '센터 포지션 1명 급구합니다',
    createdAt: '2025-11-30 09:00',
    distance: 1.1
  },
]

// 팀 매칭 모집 글 (matching 페이지의 팀들을 지도에 표시)
const teamLocations = [
  { lat: 37.5667, lng: 127.0417, address: '서울 성동구 중랑천동자전거길 366' },
  { lat: 37.5500, lng: 127.0950, address: '서울 광진구 광나루로 369' },
  { lat: 37.5430, lng: 127.0720, address: '서울 광진구 긴고랑로46가길 23' },
  { lat: 37.5700, lng: 126.9850, address: '서울 종로구 종로 133' },
  { lat: 37.5615, lng: 127.0375, address: '서울 성동구 왕십리광장로 6' },
]

const mockMatchPosts: Post[] = mockMatchTeams.map((team, index) => ({
  id: `match_post_${team.id}`,
  type: 'MATCH' as const,
  teamId: team.id,
  teamName: team.name,
  latitude: teamLocations[index]?.lat || 37.5400,
  longitude: teamLocations[index]?.lng || 127.0695,
  gameTime: '2025-12-05 18:00', // 임시 날짜
  location: teamLocations[index]?.address || team.region,
  kakaoLink: 'https://open.kakao.com/o/team-match',
  description: `${team.name} 팀과 경기하기`,
  additionalDescription: team.description,
  createdAt: '2025-12-01 10:00',
}))

const mockPosts: Post[] = [...mockGuestPosts, ...mockMatchPosts]

// 광진구 농구장 타입
interface Court {
  name: string
  address: string
  type: string
  lat: number
  lng: number
  distance?: number
}

// 광진구 농구장 데이터 (좌표 포함)
const allCourts: Court[] = [
  {
    name: '광진청소년센터',
    address: '서울특별시 광진구 구천면로 2',
    type: '실내',
    lat: 37.5481,
    lng: 127.0851
  },
  {
    name: '광진청소년센터 농구장',
    address: '서울특별시 광진구 구천면로 2',
    type: '실외',
    lat: 37.5481,
    lng: 127.0851
  },
  {
    name: '뚝섬한강공원 농구장',
    address: '서울특별시 광진구 강변북로 2273',
    type: '실외',
    lat: 37.5305,
    lng: 127.0689
  },
  {
    name: '아트큐브 농구장',
    address: '서울특별시 광진구 능동로 27',
    type: '실외',
    lat: 37.5478,
    lng: 127.0741
  },
  {
    name: '자양문화체육센터',
    address: '서울특별시 광진구 뚝섬로52길 66',
    type: '실내',
    lat: 37.5332,
    lng: 127.0699
  },
  {
    name: '중랑천 체육공원 농구장',
    address: '서울시 광진구 중곡동 485-7',
    type: '실외',
    lat: 37.5583,
    lng: 127.0831
  },
]

// 두 좌표 간 거리 계산 (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // km
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyCourts, setNearbyCourts] = useState<Court[]>(allCourts)
  const [nearbyPosts, setNearbyPosts] = useState<Post[]>(mockPosts)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isTeamLeader, setIsTeamLeader] = useState(false)
  const [showMatchRequestModal, setShowMatchRequestModal] = useState(false)
  const [selectedMatchTeam, setSelectedMatchTeam] = useState<Team | null>(null)

  // 사용자 위치 받아오고 거리 계산
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          setUserLocation({ lat: userLat, lng: userLng })

          // 거리 계산 후 정렬
          const courtsWithDistance = allCourts.map((court) => ({
            ...court,
            distance: calculateDistance(userLat, userLng, court.lat, court.lng)
          }))

          // 거리순 정렬
          const sortedCourts = courtsWithDistance.sort((a, b) => a.distance! - b.distance!)
          setNearbyCourts(sortedCourts)
        },
        () => {
          // 위치 실패 시 기본값 (건대입구역 근처)
          const defaultLat = 37.5400
          const defaultLng = 127.0695
          setUserLocation({ lat: defaultLat, lng: defaultLng })

          const courtsWithDistance = allCourts.map((court) => ({
            ...court,
            distance: calculateDistance(defaultLat, defaultLng, court.lat, court.lng)
          }))

          const sortedCourts = courtsWithDistance.sort((a, b) => a.distance! - b.distance!)
          setNearbyCourts(sortedCourts)
        }
      )
    }
  }, [])

  // localStorage에서 posts 읽어오기 및 팀 정보 확인
  useEffect(() => {
    const savedPosts = localStorage.getItem('teamup_posts')
    if (savedPosts) {
      const parsedPosts: Post[] = JSON.parse(savedPosts)
      // Mock 데이터와 합치기
      setNearbyPosts([...mockPosts, ...parsedPosts])
    }

    // 팀 정보 로드 (storage.ts의 구조에 맞게 수정)
    const appData = localStorage.getItem('teamup_app_data')
    if (appData) {
      const parsed = JSON.parse(appData)
      const team = parsed.user?.team // user.team에서 현재 팀 가져오기
      setCurrentTeam(team)
      if (team && parsed.user) {
        setIsTeamLeader(team.captainId === parsed.user.id)
      }
    }
  }, [])

  const [activeTab, setActiveTab] = useState<'posts' | 'courts'>('posts')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(true)

  const formatGameTime = (gameTime: string) => {
    const date = new Date(gameTime)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]

    return `${month}/${day} (${dayOfWeek}) ${hours}:${minutes.toString().padStart(2, '0')}`
  }

  // 마커 데이터 생성
  const postMarkers: MarkerData[] = nearbyPosts.map((post) => ({
    id: post.id,
    lat: post.latitude,
    lng: post.longitude,
    title: post.teamName,
    type: 'post' as const,
    postType: post.type // MATCH or GUEST
  }))

  const courtMarkers: MarkerData[] = nearbyCourts.map((court) => ({
    id: court.name,
    lat: court.lat,
    lng: court.lng,
    title: court.name,
    type: 'court' as const
  }))

  // 마커 클릭 핸들러
  const handleMarkerClick = (marker: MarkerData) => {
    if (activeTab === 'posts') {
      const post = nearbyPosts.find(p => p.id === marker.id)
      if (post) {
        setSelectedPost(post)
        setSelectedCourt(null)
        setIsModalOpen(true)
      }
    } else {
      const court = nearbyCourts.find(c => c.name === marker.id)
      if (court) {
        setSelectedCourt(court)
        setSelectedPost(null)
        setIsModalOpen(true)
      }
    }
  }

  const handleKakaoClick = (post: Post) => {
    window.open(post.kakaoLink, '_blank')
  }

  // 팀 정보 가져오기 (팀 매칭용)
  const getTeamInfo = (teamId: string): Team | undefined => {
    return mockMatchTeams.find(team => team.id === teamId)
  }

  // 매칭 요청 핸들러 (matching 페이지와 동일한 로직)
  const handleMatchRequest = (team: Team) => {
    if (!isTeamLeader) {
      toast.error('팀장만 매칭 요청을 보낼 수 있습니다.')
      return
    }
    if (!currentTeam?.isOfficial) {
      toast.error('정식 팀(5명 이상)만 매칭 요청을 보낼 수 있습니다.')
      return
    }
    setSelectedMatchTeam(team)
    setShowMatchRequestModal(true)
    setIsModalOpen(false) // 기존 모달 닫기
  }

  const confirmMatchRequest = () => {
    setShowMatchRequestModal(false)
    toast.success(`${selectedMatchTeam?.name}에 매칭 요청을 보냈습니다!`)
    // TODO: 실제 API 연동
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg">
          <div className="border-b border-border/50">
            <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
              <Image
                src="/images/logo.jpg"
                alt="TeamUp Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">지도</h1>
                <p className="text-sm text-muted-foreground">근처 팀과 경기장을 찾아보세요</p>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="mx-auto max-w-lg px-4 py-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'posts' | 'courts')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="posts"
                  className="data-[state=active]:font-bold data-[state=inactive]:font-normal"
                >
                  근처 모집글
                </TabsTrigger>
                <TabsTrigger
                  value="courts"
                  className="data-[state=active]:font-bold data-[state=inactive]:font-normal"
                >
                  주변 농구장
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* 지도 영역 */}
        <main className="mx-auto max-w-lg relative">
          <KakaoMap
            className="h-[calc(100vh-230px)] w-full"
            markers={activeTab === 'posts' ? postMarkers : courtMarkers}
            onMarkerClick={handleMarkerClick}
            onLoadingChange={setIsMapLoading}
          />

          {/* 범례 (근처 모집글 탭에만 표시, 지도 로딩 완료 후) */}
          {activeTab === 'posts' && !isMapLoading && (
            <div className="absolute bottom-6 right-4 bg-background/95 backdrop-blur-sm border-2 border-border/50 rounded-xl px-3 py-2 shadow-xl z-10">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-6 flex items-center justify-center">
                    <Image
                      src="/icons/star-marker.svg"
                      alt="용병 모집"
                      width={20}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-foreground font-semibold">용병 모집</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-6 flex items-center justify-center">
                    <Image
                      src="/icons/vs-marker.svg"
                      alt="팀 경기 모집"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-foreground font-semibold">팀 경기 모집</span>
                </div>
              </div>
            </div>
          )}
        </main>

        <BottomNav />

        {/* 플로팅 버튼 - 모집글 작성 */}
        <Link href="/map/create">
          <Button
            size="lg"
            className="fixed bottom-24 right-6 z-30 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>

        {/* 모집글/농구장 상세 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className="w-[430px] p-4 gap-3 border-2 border-foreground/30"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {selectedPost && selectedPost.type === 'GUEST' && (
              <>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      🏃 용병 모집
                    </Badge>
                    {selectedPost.distance && (
                      <span className="text-xs text-muted-foreground">
                        {selectedPost.distance}km
                      </span>
                    )}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  {/* 모집 제목 */}
                  {selectedPost.description && (
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        {selectedPost.description}
                      </h3>
                    </div>
                  )}

                  {/* 상세 설명 */}
                  {selectedPost.additionalDescription && (
                    <div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedPost.additionalDescription}
                      </p>
                    </div>
                  )}

                  {/* 경기 정보 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatGameTime(selectedPost.gameTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-2">{selectedPost.location}</span>
                    </div>
                  </div>

                  {/* 카카오톡 입장 버튼 */}
                  <Button
                    className="w-full h-9 text-sm"
                    onClick={() => handleKakaoClick(selectedPost)}
                  >
                    💬 카카오톡 입장
                  </Button>
                </div>
              </>
            )}

            {selectedPost && selectedPost.type === 'MATCH' && (() => {
              const teamInfo = getTeamInfo(selectedPost.teamId)
              return teamInfo ? (
                <>
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center gap-2 text-sm">
                      <Badge className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 border-orange-500/20">
                        ⚔️ 팀 경기 모집
                      </Badge>
                      {selectedPost.distance && (
                        <span className="text-xs text-muted-foreground">
                          {selectedPost.distance}km
                        </span>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-3">
                    {/* 팀 이름 */}
                    <div>
                      <h3 className="font-bold text-foreground text-xl">
                        {teamInfo.name}
                      </h3>
                      {teamInfo.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {teamInfo.description}
                        </p>
                      )}
                    </div>

                    {/* 팀 정보 */}
                    <div className="grid grid-cols-3 gap-3 rounded-lg bg-secondary/30 p-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">팀원</p>
                        <p className="font-bold text-foreground">
                          {teamInfo.memberCount}명
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">레벨</p>
                        <p className="font-bold text-foreground">{teamInfo.level}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">경기</p>
                        <p className="font-bold text-foreground">{teamInfo.totalGames}회</p>
                      </div>
                    </div>

                    {/* 매칭률 */}
                    {teamInfo.matchScore && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">AI 매칭</span>
                        <Badge className="bg-primary/10 text-primary text-xs">
                          {teamInfo.matchScore}%
                        </Badge>
                      </div>
                    )}

                    {/* 경기 정보 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatGameTime(selectedPost.gameTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-2">{selectedPost.location}</span>
                      </div>
                    </div>

                    {/* 매칭하기 버튼 */}
                    <Button
                      className="w-full h-9 text-sm bg-orange-500"
                      onClick={() => handleMatchRequest(teamInfo)}
                    >
                      ⚔️ 매칭 요청하기
                    </Button>
                  </div>
                </>
              ) : null
            })()}

            {selectedCourt && (
              <>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>농구장 정보</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  {/* 농구장 이름 */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">
                      {selectedCourt.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {selectedCourt.type}
                    </Badge>
                  </div>

                  {/* 주소 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{selectedCourt.address}</span>
                    </div>
                    {selectedCourt.distance && (
                      <div className="text-muted-foreground">
                        약 {selectedCourt.distance.toFixed(1)}km
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* 매칭 요청 확인 모달 (matching 페이지와 동일) */}
        {showMatchRequestModal && selectedMatchTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-sm border-border/50 bg-card">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-bold text-foreground">매칭 요청</h3>
                <div className="mb-6">
                  <p className="mb-2 text-sm text-muted-foreground">상대 팀</p>
                  <div className="rounded-lg bg-secondary/30 p-3">
                    <p className="font-bold text-foreground">{selectedMatchTeam.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMatchTeam.description}</p>
                  </div>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">
                  이 팀에 매칭 요청을 보낼까요?<br />
                  상대 팀이 수락하면 팀장끼리 카카오톡으로 연락할 수 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowMatchRequestModal(false)}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={confirmMatchRequest}
                  >
                    요청 보내기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
