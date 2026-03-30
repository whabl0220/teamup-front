'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth, useSignIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, AlertCircle, Eye, EyeOff, Apple } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) router.replace('/home')
  }, [isAuthLoaded, isSignedIn, router])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setIsLoading(true)
    setError('')

    // 이메일 검증
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일 주소를 입력해주세요.')
      setIsLoading(false)
      return
    }

    // 비밀번호 검증
    if (!password || password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })
      if (signInAttempt.status !== 'complete') {
        throw new Error('로그인을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
      await setActive({ session: signInAttempt.createdSessionId })

      toast.success('로그인 성공!', {
        description: '환영합니다! TeamUp을 시작해볼까요?',
      })

      router.push('/home')
    } catch (err) {
      const message = getClerkErrorMessage(err, '이메일 또는 비밀번호가 올바르지 않습니다.')
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded || !signIn) return
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

  if (!isAuthLoaded || isSignedIn) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
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
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>
          이메일과 비밀번호로 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 이메일 */}
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

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
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

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-1.5 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/95"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                로그인 중...
              </div>
            ) : (
              '로그인'
            )}
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
            onClick={() => void handleSocialLogin('oauth_google')}
            disabled={isLoading}
          >
            Google로 계속하기
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2"
            onClick={() => void handleSocialLogin('oauth_apple')}
            disabled={isLoading}
          >
            <Apple className="h-4 w-4" />
            Apple로 계속하기
          </Button>
        </div>

        {/* 회원가입 링크 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">아직 계정이 없으신가요? </span>
          <Link href="/signup" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
