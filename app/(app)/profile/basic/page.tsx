'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { userService } from '@/lib/services'
import { User } from '@/types'
import { UserInfoForm, UserInfoFormData } from '@/components/features/profile/UserInfoForm'
import { toast } from 'sonner'

export default function BasicInfoEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
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
        const userData = await userService.getMe()
        setUser(userData)
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
        console.error('사용자 정보 로드 실패:', err)
        toast.error('사용자 정보를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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
      setError('기본 정보 수정에 실패했습니다.')
      toast.error('기본 정보 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
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
