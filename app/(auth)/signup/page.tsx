'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth, useSignIn, useSignUp } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Eye, EyeOff, Apple } from 'lucide-react'
import { UserInfoForm, UserInfoFormData } from '@/components/features/profile/UserInfoForm'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp()
  const { isLoaded: isSignInLoaded, signIn } = useSignIn()
  const [step, setStep] = useState<'account' | 'profile'>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [formData, setFormData] = useState<UserInfoFormData>({
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

  useEffect(() => {
    if (isSignedIn) router.replace('/home')
  }, [isSignedIn, router])

  const getClerkErrorMessage = (err: unknown, fallback: string) => {
    if (
      typeof err === 'object' &&
      err !== null &&
      'errors' in err &&
      Array.isArray((err as { errors?: unknown[] }).errors)
    ) {
      const first = (err as { errors: Array<{ longMessage?: string; message?: string }> }).errors[0]
      if (first?.longMessage) return first.longMessage
      if (first?.message) return first.message
    }
    return fallback
  }

  // Step 1: 이메일/비밀번호 검증 및 다음 단계
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 이메일 검증
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 주소를 입력해주세요.')
      return
    }

    // 비밀번호 검증
    if (!password || password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    // 다음 단계로
    setStep('profile')
  }

  // Step 2: 회원가입 완료
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSignUpLoaded || !signUp) return
    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        username: formData.nickname || undefined,
        unsafeMetadata: {
          nickname: formData.nickname,
          gender: formData.gender,
          address: formData.address,
          height: formData.height ? Number(formData.height) : undefined,
          mainPosition: formData.mainPosition,
          subPosition: formData.subPosition || undefined,
          playStyle: formData.playStyle || undefined,
          statusMsg: formData.statusMsg || undefined,
        },
      })

      if (result.status !== 'complete') {
        throw new Error('회원가입 후 인증 절차가 필요합니다. Clerk 설정을 확인해주세요.')
      }

      await setActive({ session: result.createdSessionId })
      toast.success('회원가입 완료', {
        description: `환영합니다, ${formData.nickname || '플레이어'}님!`,
      })
      router.push('/home')
    } catch (err) {
      const errorMessage = getClerkErrorMessage(err, '회원가입에 실패했습니다.')
      setError(errorMessage)
      toast.error('회원가입 실패', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isSignInLoaded || !signIn) return
    setError('')
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/home',
      })
    } catch (err) {
      const message = getClerkErrorMessage(err, '소셜 로그인에 실패했습니다.')
      setError(message)
      toast.error(message)
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'account':
        return '이메일과 비밀번호로 계정을 생성하세요'
      case 'profile':
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
        {/* Step 1: 이메일/비밀번호 입력 */}
        {step === 'account' && (
          <>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
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
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="최소 8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pl-10 pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/95"
                disabled={isLoading}
              >
                다음
              </Button>
            </form>
            <div className="my-4">
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">또는</span>
                <Separator className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() => void handleSocialSignup('oauth_google')}
                disabled={isLoading}
              >
                Google로 계속하기
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2"
                onClick={() => void handleSocialSignup('oauth_apple')}
                disabled={isLoading}
              >
                <Apple className="h-4 w-4" />
                Apple로 계속하기
              </Button>
            </div>
          </>
        )}

        {/* Step 2: 프로필 정보 입력 */}
        {step === 'profile' && (
          <>
            <div className="mb-4 rounded-lg bg-secondary/30 p-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{email}</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('account')}
                className="mt-1 h-auto p-0 text-xs text-primary hover:bg-transparent"
              >
                이메일 변경
              </Button>
            </div>

            <UserInfoForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleRegister}
              isLoading={isLoading}
              error={error}
              submitButtonText="회원가입 완료"
              fields="all"
            />
          </>
        )}

        {/* 로그인 링크 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
