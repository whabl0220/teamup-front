'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import type { PostType } from '@/types'

export default function CreatePostPage() {
  const router = useRouter()
  const [postType, setPostType] = useState<PostType | null>(null)
  const [gameTime, setGameTime] = useState('')
  const [location, setLocation] = useState('')
  const [kakaoLink, setKakaoLink] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!postType || !gameTime || !location || !kakaoLink) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    // TODO: 실제 API 연동
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
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                경기 시간 <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={gameTime}
                onChange={(e) => setGameTime(e.target.value)}
                className="bg-background"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                경기 장소 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="예: 광진 농구장"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-background"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                현재 위치 기반으로 지도에 표시됩니다
              </p>
            </div>

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
    </div>
  )
}
