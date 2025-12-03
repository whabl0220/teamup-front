'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Clock, User, MapPin, AlertCircle } from 'lucide-react'
import { RegionSelectModal } from '@/components/shared/RegionSelectModal'

const API_URL = 'http://localhost:8080'
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false' // 기본값: Mock 사용

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code' | 'info'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '',
    address: '',
    height: '',
    mainPosition: '',
    subPosition: '',
    playStyle: '',
    statusMsg: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const [mockCode, setMockCode] = useState('') // Mock 인증코드 저장
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false)

  // 타이머 카운트다운 (5분)
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 1️⃣ 이메일 인증코드 요청
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Mock 모드
    if (USE_MOCK) {
      setTimeout(() => {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
        setMockCode(generatedCode)
        console.log(`🔐 Mock 인증코드: ${generatedCode}`)
        alert(`Mock 모드: 인증코드는 "${generatedCode}" 입니다`)
        setStep('code')
        setTimer(300) // 5분
        setIsLoading(false)
      }, 1000)
      return
    }

    // 실제 API 호출
    try {
      const response = await fetch(`${API_URL}/email/verify/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setStep('code')
        setTimer(300) // 5분
      } else {
        const errorText = await response.text()
        setError(errorText || '인증코드 발송에 실패했습니다.')
      }
    } catch (err) {
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 2️⃣ 인증코드 확인
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Mock 모드
    if (USE_MOCK) {
      setTimeout(() => {
        if (code === mockCode) {
          setStep('info')
        } else {
          setError('인증코드가 올바르지 않습니다.')
        }
        setIsLoading(false)
      }, 1000)
      return
    }

    // 실제 API 호출
    try {
      const response = await fetch(`${API_URL}/email/verify/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      if (response.ok) {
        setStep('info')
      } else {
        const errorText = await response.text()
        setError(errorText || '인증코드가 올바르지 않습니다.')
      }
    } catch (err) {
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 3️⃣ 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Mock 모드
    if (USE_MOCK) {
      setTimeout(() => {
        console.log('Mock 회원가입 성공:', { email, ...formData })
        alert('Mock 모드: 회원가입 성공!')
        router.push('/login')
        setIsLoading(false)
      }, 1000)
      return
    }

    // 실제 API 호출
    try {
      const registerBody = {
        email,
        nickname: formData.nickname,
        gender: formData.gender,
        address: formData.address,
        height: parseInt(formData.height),
        mainPosition: formData.mainPosition,
        subPosition: formData.subPosition || undefined,
        playStyle: formData.playStyle,
        statusMsg: formData.statusMsg,
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerBody)
      })

      if (response.ok) {
        // 회원가입 성공 - 로그인 페이지로 이동
        router.push('/login')
      } else {
        const errorText = await response.text()
        setError(errorText || '회원가입에 실패했습니다.')
      }
    } catch (err) {
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 인증코드 재전송
  const handleResendCode = async () => {
    setIsLoading(true)
    setError('')
    setCode('')

    // Mock 모드
    if (USE_MOCK) {
      setTimeout(() => {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
        setMockCode(generatedCode)
        console.log(`🔐 Mock 인증코드 (재전송): ${generatedCode}`)
        alert(`Mock 모드: 인증코드는 "${generatedCode}" 입니다`)
        setTimer(300) // 5분 리셋
        setIsLoading(false)
      }, 1000)
      return
    }

    // 실제 API 호출
    try {
      const response = await fetch(`${API_URL}/email/verify/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setTimer(300) // 5분 리셋
      } else {
        setError('인증코드 재전송에 실패했습니다.')
      }
    } catch (err) {
      setError('서버와 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return '이메일 인증으로 안전하게 시작하세요'
      case 'code':
        return '이메일로 받은 6자리 인증코드를 입력하세요'
      case 'info':
        return '플레이어 카드 정보를 입력하세요'
    }
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <Image
          src="/images/logo.jpg"
          alt="TeamUp Logo"
          width={64}
          height={64}
          className="mx-auto mb-2 rounded-xl object-cover"
        />
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>{getStepDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step 1: 이메일 입력 */}
        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className={`h-11 pl-10 ${error && step === 'email' ? 'border-red-500' : ''}`}
                />
              </div>
              {error && step === 'email' && (
                <div className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  인증코드 발송 중...
                </div>
              ) : (
                '인증코드 받기'
              )}
            </Button>
          </form>
        )}

        {/* Step 2: 인증코드 입력 */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">인증코드</Label>
                {timer > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(timer)}</span>
                  </div>
                )}
              </div>
              <Input
                id="code"
                type="text"
                placeholder="6자리 인증코드"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                  setError('') // 입력 시 에러 클리어
                }}
                required
                disabled={isLoading}
                className={`h-11 text-center text-lg tracking-widest ${error && step === 'code' ? 'border-red-500' : ''}`}
                maxLength={6}
              />
              {error && step === 'code' ? (
                <div className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <strong>{email}</strong> 으로 전송된 인증코드를 입력하세요
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={() => setStep('email')}
                disabled={isLoading}
              >
                이메일 변경
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={handleResendCode}
                disabled={isLoading || timer > 240}
              >
                재전송
              </Button>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  확인 중...
                </div>
              ) : (
                '다음'
              )}
            </Button>
          </form>
        )}

        {/* Step 3: 회원정보 입력 */}
        {step === 'info' && (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* 닉네임 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">이름 *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="nickname"
                  type="text"
                  placeholder="홍길동"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value.slice(0, 25) })}
                  required
                  disabled={isLoading}
                  className="h-11 pl-10"
                  maxLength={25}
                />
              </div>
            </div>

            {/* 성별 & 키 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gender">성별 *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="성별" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="남성">남성</SelectItem>
                    <SelectItem value="여성">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">키 (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  min="150"
                  max="250"
                  placeholder="180"
                  value={formData.height}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 3)
                    setFormData({ ...formData, height: value })
                  }}
                  onKeyDown={(e) => {
                    // e, E, +, -, . 입력 방지
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            {/* 활동 지역 */}
            <div className="space-y-2">
              <Label htmlFor="address">활동 지역 *</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => setIsRegionModalOpen(true)}
              >
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="address"
                  type="text"
                  placeholder="지역을 선택하세요"
                  value={formData.address}
                  readOnly
                  required
                  disabled={isLoading}
                  className="h-11 pl-10 cursor-pointer"
                />
              </div>
            </div>

            {/* 주 포지션 & 부 포지션 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="mainPosition">주 포지션 *</Label>
                <Select
                  value={formData.mainPosition}
                  onValueChange={(value) => setFormData({ ...formData, mainPosition: value })}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="주 포지션" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PG">포인트 가드</SelectItem>
                    <SelectItem value="SG">슈팅 가드</SelectItem>
                    <SelectItem value="SF">스몰 포워드</SelectItem>
                    <SelectItem value="PF">파워 포워드</SelectItem>
                    <SelectItem value="C">센터</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subPosition">부 포지션</Label>
                <Select
                  value={formData.subPosition}
                  onValueChange={(value) => setFormData({ ...formData, subPosition: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="선택사항" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PG">포인트 가드</SelectItem>
                    <SelectItem value="SG">슈팅 가드</SelectItem>
                    <SelectItem value="SF">스몰 포워드</SelectItem>
                    <SelectItem value="PF">파워 포워드</SelectItem>
                    <SelectItem value="C">센터</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 플레이 스타일 */}
            <div className="space-y-2">
              <Label htmlFor="playStyle">플레이 스타일 *</Label>
              <Select
                value={formData.playStyle}
                onValueChange={(value) => setFormData({ ...formData, playStyle: value })}
                required
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="플레이 스타일 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SL">돌파형 (Slasher)</SelectItem>
                  <SelectItem value="SH">슈터형 (Shooter)</SelectItem>
                  <SelectItem value="DF">수비형 (Defender)</SelectItem>
                  <SelectItem value="PA">패스형 (Passer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 한 줄 소개 */}
            <div className="space-y-2">
              <Label htmlFor="statusMsg">한 줄 소개 *</Label>
              <Input
                id="statusMsg"
                type="text"
                placeholder="예: 코트 위의 전사"
                value={formData.statusMsg}
                onChange={(e) => setFormData({ ...formData, statusMsg: e.target.value.slice(0, 20) })}
                required
                disabled={isLoading}
                className="h-11"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                {formData.statusMsg.length}/20자
              </p>
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  가입 중...
                </div>
              ) : (
                '회원가입 완료'
              )}
            </Button>
          </form>
        )}

        {/* 로그인 링크 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </div>
      </CardContent>

      {/* 지역 선택 모달 */}
      <RegionSelectModal
        open={isRegionModalOpen}
        onOpenChange={setIsRegionModalOpen}
        onSelect={(region) => setFormData({ ...formData, address: region })}
      />
    </Card>
  )
}
