'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Check, X } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  // 비밀번호 강도 체크
  const passwordStrength = () => {
    const { password } = formData
    if (!password) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++

    if (strength <= 1) return { strength, label: '약함', color: 'text-red-500' }
    if (strength === 2) return { strength, label: '보통', color: 'text-yellow-500' }
    if (strength === 3) return { strength, label: '강함', color: 'text-green-500' }
    return { strength, label: '매우 강함', color: 'text-primary' }
  }

  const strength = passwordStrength()

  // 비밀번호 일치 확인
  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword

  const passwordsDontMatch =
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword

  // 필수 약관 동의 확인
  const canSubmit =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    passwordsMatch &&
    agreements.terms &&
    agreements.privacy

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)

    // TODO: 실제 API 연동
    // try {
    //   const response = await fetch('/api/auth/signup', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       name: formData.name,
    //       email: formData.email,
    //       password: formData.password,
    //       marketing: agreements.marketing
    //     })
    //   })
    //   if (response.ok) {
    //     router.push('/login')
    //   }
    // } catch (error) {
    //   console.error('Signup failed:', error)
    // }

    // Mock: 임시로 2초 후 로그인 페이지로 이동
    setTimeout(() => {
      setIsLoading(false)
      router.push('/login')
    }, 2000)
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription>
          TeamUp과 함께 완벽한 팀을 만나보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="8자 이상 입력"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={isLoading}
              className="h-11"
            />
            {formData.password && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(strength.strength / 4) * 100}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호 재입력"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                className="h-11"
              />
              {passwordsMatch && (
                <Check className="absolute right-3 top-3 h-5 w-5 text-green-500" />
              )}
              {passwordsDontMatch && (
                <X className="absolute right-3 top-3 h-5 w-5 text-red-500" />
              )}
            </div>
            {passwordsDontMatch && (
              <p className="text-xs text-red-500">
                비밀번호가 일치하지 않습니다
              </p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreements.terms}
                onCheckedChange={(checked) =>
                  setAgreements({ ...agreements, terms: checked as boolean })
                }
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <span>이용약관 동의</span>
                  <Badge variant="destructive" className="h-5 text-xs">
                    필수
                  </Badge>
                </Label>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  약관 보기
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={agreements.privacy}
                onCheckedChange={(checked) =>
                  setAgreements({ ...agreements, privacy: checked as boolean })
                }
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="privacy"
                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <span>개인정보 처리방침 동의</span>
                  <Badge variant="destructive" className="h-5 text-xs">
                    필수
                  </Badge>
                </Label>
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  약관 보기
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={agreements.marketing}
                onCheckedChange={(checked) =>
                  setAgreements({
                    ...agreements,
                    marketing: checked as boolean,
                  })
                }
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="marketing"
                  className="flex items-center gap-2 text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <span>마케팅 정보 수신 동의</span>
                  <Badge variant="secondary" className="h-5 text-xs">
                    선택
                  </Badge>
                </Label>
              </div>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <Button
            type="submit"
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                가입 중...
              </div>
            ) : (
              '회원가입'
            )}
          </Button>
        </form>

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
