'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Save } from 'lucide-react'
import { userService } from '@/lib/services'
import { Position, PlayStyle, User } from '@/types'
import { mapApiUserToUser } from '@/lib/mappers/user'
import { toUserErrorMessage } from '@/lib/error-utils'
import { PlayerCard } from '@/components/shared/PlayerCard'
import { toast } from 'sonner'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user: clerkUser } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 폼 상태
  const [formData, setFormData] = useState({
    height: 0,
    position: '' as Position | '',
    subPosition: '' as Position | '',
    playStyle: '' as PlayStyle | '',
    statusMsg: ''
  })

  // 클라이언트에서만 데이터 로드 (hydration 오류 방지)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const userData = await userService.getMe()
        setUser(mapApiUserToUser(userData))
        setLoadError(null)
        if (userData) {
          setFormData({
            height: userData.height || 0,
            position: (userData.mainPosition as Position) || ('' as Position | ''),
            subPosition: (userData.subPosition as Position) || ('' as Position | ''),
            playStyle: (userData.playStyle as PlayStyle) || ('' as PlayStyle | ''),
            statusMsg: userData.statusMsg || ''
          })
        }
      } catch (err) {
        if (clerkUser) {
          setUser({
            id: clerkUser.id,
            name: clerkUser.username || clerkUser.firstName || clerkUser.fullName || '플레이어',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            gender: '',
            address: '',
            height: undefined,
            position: undefined,
            subPosition: undefined,
            playStyle: undefined,
            statusMsg: '',
          })
          setLoadError(null)
        } else {
          console.error('사용자 정보 로드 실패:', err)
          const message = toUserErrorMessage(err, {
            fallback: '사용자 정보를 불러오는데 실패했습니다.',
          })
          setLoadError(message)
          toast.error(message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [clerkUser])

  // 미리보기용 유저 데이터
  const previewUser = {
    ...user!,
    ...formData,
    position: formData.position || undefined,
    subPosition: formData.subPosition || undefined,
    playStyle: formData.playStyle || undefined,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // API로 사용자 정보 업데이트
      await userService.updateMe({
        height: formData.height || undefined,
        mainPosition: formData.position || undefined,
        subPosition: formData.subPosition || undefined,
        playStyle: formData.playStyle || undefined,
        statusMsg: formData.statusMsg || undefined
      })

      toast.success('프로필이 저장되었습니다!')
      router.push('/mypage')
    } catch (error) {
      console.error('프로필 저장 실패:', error)
      toast.error(
        toUserErrorMessage(error, {
          fallback: '프로필 저장에 실패했습니다.',
        })
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-56" />
          </div>
        </header>

        <div className="mx-auto max-w-lg space-y-6 p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>

          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{loadError ?? '로그인이 필요합니다.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">플레이어 카드 설정</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* 미리보기 카드 */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">카드 미리보기</h2>
          <PlayerCard user={previewUser} className="mx-auto max-w-sm" />
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>키와 포지션을 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 키 */}
              <div className="space-y-2">
                <Label htmlFor="height">키 (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="150"
                  max="230"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                  placeholder="예: 180"
                />
              </div>

              {/* 주 포지션 */}
              <div className="space-y-2">
                <Label htmlFor="position">주 포지션</Label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as Position | '' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">선택하세요</option>
                  <option value="GUARD">가드</option>
                  <option value="FORWARD">포워드</option>
                  <option value="CENTER">센터</option>
                </select>
                {/* 카드 색상 안내 */}
                <div className="rounded-lg bg-muted p-0">
                  <p className="text-xs text-muted-foreground">
                    💡 카드 색상은 선택한 주 포지션에 따라 자동으로 변경됩니다
                  </p>
                </div>
              </div>

              {/* 부 포지션 */}
              <div className="space-y-2">
                <Label htmlFor="subPosition">부 포지션 (선택)</Label>
                <select
                  id="subPosition"
                  value={formData.subPosition}
                  onChange={(e) => setFormData({ ...formData, subPosition: e.target.value as Position | '' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">선택하세요</option>
                  <option value="GUARD">가드</option>
                  <option value="FORWARD">포워드</option>
                  <option value="CENTER">센터</option>
                </select>
                {/* 안내 문구 */}
                <p className="text-xs text-muted-foreground">
                  💡 주 포지션을 먼저 선택해야 카드에 부 포지션이 표시됩니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 플레이 스타일 */}
          <Card>
            <CardHeader>
              <CardTitle>플레이 스타일</CardTitle>
              <CardDescription>나의 플레이 스타일을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playStyle">스타일</Label>
                <select
                  id="playStyle"
                  value={formData.playStyle}
                  onChange={(e) => setFormData({ ...formData, playStyle: e.target.value as PlayStyle | '' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">선택하세요</option>
                  <option value="SLASHER">돌파형 (Slasher)</option>
                  <option value="SHOOTER">슈터형 (Shooter)</option>
                  <option value="DEFENDER">수비형 (Defender)</option>
                  <option value="PASSER">패스형 (Passer)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 카드 디자인 */}
          <Card>
            <CardHeader>
              <CardTitle>한 줄 소개</CardTitle>
              <CardDescription>나만의 한 줄 각오를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusMsg">한 줄 소개 (20자 이내)</Label>
                <Textarea
                  id="statusMsg"
                  value={formData.statusMsg}
                  onChange={(e) => setFormData({ ...formData, statusMsg: e.target.value.slice(0, 20) })}
                  placeholder="예: 코트 위의 전사"
                  maxLength={20}
                  rows={1}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.statusMsg.length}/20자
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}
