'use client'

import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Post } from '@/types'
import KakaoMap from '@/components/shared/KakaoMap'

const nearbyPosts: Post[] = [
  {
    id: 'post_1',
    type: 'MATCH',
    teamId: '1',
    teamName: '세종 born',
    latitude: 37.5547,
    longitude: 127.0845,
    gameTime: '2025-12-01 19:00',
    location: '광진 농구장',
    kakaoLink: 'https://open.kakao.com/o/example1',
    description: '주말 저녁 한 게임 하실 팀 구합니다!',
    createdAt: '2025-11-30 10:00',
    distance: 1.2
  },
  {
    id: 'post_2',
    type: 'GUEST',
    teamId: '6',
    teamName: '관악 Thunders',
    latitude: 37.5548,
    longitude: 127.0846,
    gameTime: '2025-11-30 15:00',
    location: '워커힐 체육관',
    kakaoLink: 'https://open.kakao.com/o/example2',
    description: '가드 포지션 1명 급구!',
    createdAt: '2025-11-30 11:00',
    distance: 0.8
  },
  {
    id: 'post_3',
    type: 'MATCH',
    teamId: '8',
    teamName: '송파 Dragons',
    latitude: 37.5549,
    longitude: 127.0847,
    gameTime: '2025-12-02 18:00',
    location: '능동 체육공원',
    kakaoLink: 'https://open.kakao.com/o/example3',
    description: '평일 저녁 5 vs 5',
    createdAt: '2025-11-30 09:00',
    distance: 2.1
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
    name: '광진청소년센터 농구장',
    address: '서울특별시 광진구 구천면로 2',
    type: '실내',
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
  const [nearbyCourts, setNearbyCourts] = useState<Court[]>(allCourts.slice(0, 2))

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

          // 거리순 정렬 후 2개만
          const sortedCourts = courtsWithDistance.sort((a, b) => a.distance - b.distance)
          setNearbyCourts(sortedCourts.slice(0, 2))
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

          const sortedCourts = courtsWithDistance.sort((a, b) => a.distance - b.distance)
          setNearbyCourts(sortedCourts.slice(0, 2))
        }
      )
    }
  }, [])

  const handleKakaoClick = (post: Post) => {
    // 카카오톡 오픈채팅방으로 이동
    window.open(post.kakaoLink, '_blank')
  }

  const formatGameTime = (gameTime: string) => {
    const date = new Date(gameTime)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]

    return `${month}/${day} (${dayOfWeek}) ${hours}:${minutes.toString().padStart(2, '0')}`
  }
  return (
    <>
      <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
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
      </header>

      <main className="mx-auto max-w-lg">
        {/* 지도 영역 */}
        <KakaoMap className="h-[300px] w-full border-b border-border/50" />

        <div className="p-4 space-y-6">
          {/* Nearby Courts */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">주변 농구장</h2>
            </div>

            <div className="space-y-3">
              {nearbyCourts.map((court, index) => (
                <Card key={index} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#181B1F]">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-foreground">{court.name}</h3>
                          {court.distance && (
                            <span className="text-xs text-muted-foreground">
                              {court.distance.toFixed(1)}km
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="mt-1 text-xs">{court.type}</Badge>
                        <p className="mt-1 text-sm text-muted-foreground">{court.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Nearby Posts */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">근처 모집 글</h2>
              </div>
              <Link href="/map/posts">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary"
                >
                  전체
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {nearbyPosts.map((post) => (
                <Card key={post.id} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* 헤더 */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={post.type === 'MATCH' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {post.type === 'MATCH' ? '⚔️ 팀 경기' : '🏃 용병 모집'}
                          </Badge>
                          {post.distance && (
                            <span className="text-xs text-muted-foreground">
                              {post.distance}km
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 팀 이름 & 설명 */}
                      <div>
                        <h3 className="font-bold text-foreground mb-1">{post.teamName}</h3>
                        {post.description && (
                          <p className="text-sm text-muted-foreground">{post.description}</p>
                        )}
                      </div>

                      {/* 경기 정보 */}
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{formatGameTime(post.gameTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{post.location}</span>
                        </div>
                      </div>

                      {/* 카카오톡 입장 버튼 */}
                      <Button
                        className="w-full"
                        onClick={() => handleKakaoClick(post)}
                      >
                        💬 카카오톡 입장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
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
    </div>
    </>
  )
}
