'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { authService, userService } from '@/lib/services'
import type { Team } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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
      const response = await authService.login({ email, password })

      // 사용자의 팀 목록 조회
      let userTeams: Team[] = [];
      try {
        const teamsResponse = await userService.getUserTeams(response.id)

        // API 응답을 프론트엔드 Team 타입으로 변환
        userTeams = teamsResponse.map(team => ({
          id: team.id.toString(),
          name: team.name,
          shortName: team.name.substring(0, 2).toUpperCase(),
          memberCount: team.memberCount,
          maxMembers: 10, // 기본값 (API에 없음)
          level: 'B' as const, // 기본값 (API에 없음)
          region: '', // 기본값 (API에 없음)
          totalGames: 0,
          aiReports: 0,
          activeDays: 0,
          isOfficial: team.memberCount >= 5,
          captainId: team.leaderId.toString(),
          description: '',
          matchScore: 0,
          teamDna: team.teamDna,
          teamLevel: team.teamLevel,
          teamExp: team.teamExp,
        }))
      } catch (teamErr) {
        console.error('팀 목록 조회 실패:', teamErr)
        // 팀 목록 조회 실패해도 로그인은 성공으로 처리
      }

      // 로그인 성공 - 사용자 정보는 API로 조회하므로 localStorage에 저장 불필요
      // 인증 토큰은 이미 client.ts에서 localStorage에 저장됨

      toast.success('로그인 성공!', {
        description: `환영합니다, ${response.nickname}님!`,
      })

      router.push('/home')
    } catch (err) {
      console.error('로그인 실패:', err)
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setIsLoading(false)
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
