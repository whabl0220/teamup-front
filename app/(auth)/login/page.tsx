'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: 실제 API 연동
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password, rememberMe })
    //   })
    //   if (response.ok) {
    //     router.push('/home')
    //   }
    // } catch (error) {
    //   console.error('Login failed:', error)
    // }

    // Mock: 임시로 2초 후 홈으로 이동
    setTimeout(() => {
      setIsLoading(false)
      router.push('/home')
    }, 2000)
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>
          TeamUp에 로그인하여 함께 팀을 찾아보세요!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">비밀번호</Label>
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* 로그인 유지 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              로그인 상태 유지
            </Label>
          </div>

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
