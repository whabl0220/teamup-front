'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser, updateCurrentUser } from '@/lib/storage'
import { User } from '@/types'
import { UserInfoForm, UserInfoFormData } from '@/components/features/profile/UserInfoForm'

const API_URL = 'http://localhost:8080'
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false' // 기본값: Mock 사용

export default function BasicInfoEditPage() {
  const router = useRouter()
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
    const userData = getCurrentUser()
    setUser(userData)
    if (userData) {
      setFormData({
        nickname: userData.name || '',
        gender: userData.gender || '',
        address: userData.address || '',
        height: userData.height?.toString() || '',
        mainPosition: userData.position || '',
        subPosition: userData.subPosition || '',
        playStyle: userData.playStyle || '',
        statusMsg: userData.statusMsg || ''
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    // Mock 모드
    if (USE_MOCK) {
      setTimeout(() => {
        console.log('Mock 기본 정보 수정 성공:', formData)
        // 현재 유저 정보 업데이트
        updateCurrentUser({
          name: formData.nickname,
          gender: formData.gender,
          address: formData.address
        })
        alert('Mock 모드: 기본 정보 수정 성공!')
        router.push('/mypage')
        setIsSaving(false)
      }, 1000)
      return
    }

    // 실제 API 호출
    try {
      const updateBody = {
        nickname: formData.nickname,
        gender: formData.gender,
        address: formData.address
      }

      const response = await fetch(`${API_URL}/user/update-basic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
      })

      if (response.ok) {
        // 업데이트 성공 - 로컬 스토리지도 업데이트
        updateCurrentUser({
          name: formData.nickname,
          gender: formData.gender,
          address: formData.address
        })
        router.push('/mypage')
      } else {
        const errorText = await response.text()
        setError(errorText || '기본 정보 수정에 실패했습니다.')
      }
    } catch (err) {
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setIsSaving(false)
    }
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
