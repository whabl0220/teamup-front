'use client'

import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Post } from '@/types'
import KakaoMap, { type MarkerData } from '@/components/shared/KakaoMap'

const mockPosts: Post[] = [
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
    description: '가드 포지션 1명 급구!',
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

  // localStorage에서 posts 읽어오기
  useEffect(() => {
    const savedPosts = localStorage.getItem('teamup_posts')
    if (savedPosts) {
      const parsedPosts: Post[] = JSON.parse(savedPosts)
      // Mock 데이터와 합치기
      setNearbyPosts([...mockPosts, ...parsedPosts])
    }
  }, [])

  const [activeTab, setActiveTab] = useState<'posts' | 'courts'>('posts')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    type: 'post' as const
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
        <main className="mx-auto max-w-lg">
          <KakaoMap
            className="h-[calc(100vh-230px)] w-full"
            markers={activeTab === 'posts' ? postMarkers : courtMarkers}
            onMarkerClick={handleMarkerClick}
          />
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
            {selectedPost && (
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
                  {/* 설명 */}
                  {selectedPost.description && (
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        {selectedPost.description}
                      </h3>
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
      </div>
    </>
  )
}
