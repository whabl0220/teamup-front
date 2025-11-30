'use client'

import Image from 'next/image'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Megaphone } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/types'

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

const nearbyCourts = [
  { name: '광진 농구장', address: '서울 광진구 능동로 123', type: '실외' },
  { name: '워커힐 체육관', address: '서울 광진구 워커힐로 177', type: '실내' },
  { name: '능동 체육공원', address: '서울 광진구 능동로 216', type: '실외' },
]

export default function MapPage() {
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
        {/* 지도 영역 (나중에 API 연동) */}
        <div className="h-[300px] w-full bg-muted/30 flex items-center justify-center border-b border-border/50">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">지도 API 연동 예정</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Nearby Courts */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">주변 농구장</h2>
            </div>

            <div className="space-y-3">
              {nearbyCourts.slice(0, 2).map((court, index) => (
                <Card key={index} className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#181B1F]">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{court.name}</h3>
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
