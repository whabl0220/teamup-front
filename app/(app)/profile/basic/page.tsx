'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { userService } from '@/lib/services'
import { User } from '@/types'
import { mapApiUserToUser } from '@/lib/mappers/user'
import { toUserErrorMessage } from '@/lib/error-utils'
import { UserInfoForm, UserInfoFormData } from '@/components/features/profile/UserInfoForm'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function BasicInfoEditPage() {
  const router = useRouter()
  const { user: clerkUser } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // 폼 상태
  const [formData, setFormData] = useState<UserInfoFormData>({
    nickname: '',
    gender: '',
    address: '',
    height: '',
    mainPosition: '',
    subPosition: '',
    playStyle: '',
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
            nickname: userData.nickname || '',
            gender: userData.gender || '',
            address: userData.address || '',
            height: userData.height?.toString() || '',
            mainPosition: userData.mainPosition || '',
            subPosition: userData.subPosition || '',
            playStyle: userData.playStyle || '',
            statusMsg: userData.statusMsg || ''
          })
        }
      } catch (err) {
        if (clerkUser) {
          const fallbackName =
            clerkUser.username || clerkUser.firstName || clerkUser.fullName || '플레이어'
          setUser({
            id: clerkUser.id,
            name: fallbackName,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            gender: '',
            address: '',
            height: undefined,
            position: undefined,
            subPosition: undefined,
            playStyle: undefined,
            statusMsg: '',
          })
          setFormData((prev) => ({
            ...prev,
            nickname: prev.nickname || fallbackName,
          }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      // API로 사용자 정보 업데이트
      await userService.updateMe({
        nickname: formData.nickname,
        gender: formData.gender,
        address: formData.address,
        height: formData.height ? Number(formData.height) : undefined,
        mainPosition: formData.mainPosition || undefined,
        subPosition: formData.subPosition || undefined,
        playStyle: formData.playStyle || undefined,
        statusMsg: formData.statusMsg || undefined
      })

      toast.success('기본 정보가 저장되었습니다!')
      router.push('/mypage')
    } catch (err) {
      console.error('기본 정보 수정 실패:', err)
      const message = toUserErrorMessage(err, {
        fallback: '기본 정보 수정에 실패했습니다.',
      })
      setError(message)
      toast.error(message)
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
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
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
          <h1 className="text-lg font-bold text-foreground">기본 정보 수정</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg p-4">
        <UserInfoForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          error={error}
          submitButtonText="저장하기"
          fields="basic"
        />
      </div>
    </div>
  )
}
