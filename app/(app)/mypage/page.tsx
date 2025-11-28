'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Lock,
  Bell,
  FileText,
  Shield,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
} from 'lucide-react'

export default function MyPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)

  // Mock 사용자 데이터
  const user = {
    name: '유혁상',
    email: 'yhs@teamup.com',
    avatar: null, // 실제로는 이미지 URL
    team: '세종 born',
    teamId: '1', // 실제 팀 id로 교체 필요
    joinDate: '2025년 1월',
  }

  const handleLogout = () => {
    // TODO: 실제 로그아웃 로직
    // localStorage.removeItem('token')
    router.push('/')
  }

  const handleDeleteAccount = () => {
    // TODO: 회원탈퇴 확인 다이얼로그
    if (confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Image
            src="/images/logo.jpg"
            alt="TeamUp Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <h1 className="text-2xl font-bold tracking-tight">마이페이지</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {/* 프로필 카드 */}
        <Card className="mb-6 border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-bold text-foreground">{user.name}</h2>
                <p className="mb-2 text-sm text-muted-foreground">{user.email}</p>
                {user.team && (
                  <Link href={`/team/${user.teamId}`}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer text-xs transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {user.team}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Badge>
                  </Link>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">가입일</span>
              <span className="font-medium text-foreground">{user.joinDate}</span>
            </div>
            {user.team && (
              <>
                <Separator className="my-4" />
                <Link href={`/team/${user.teamId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    내 팀 보기
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* 계정 설정 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            계정 설정
          </h3>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-0">
              <Link href="/mypage/profile">
                <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">프로필 수정</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </Link>
              <Separator />
              <Link href="/mypage/password">
                <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">비밀번호 변경</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </Link>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">알림 설정</span>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 기타 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            기타
          </h3>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-0">
              <Link href="/terms">
                <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">이용약관</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </Link>
              <Separator />
              <Link href="/privacy">
                <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">개인정보 처리방침</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </Link>
              <Separator />
              <Link href="/about">
                <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Info className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">앱 정보</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">v1.0.0</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 주의 영역 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-destructive">
            주의 영역
          </h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3 border-border/50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">로그아웃</span>
            </Button>
            <Button
              variant="destructive"
              className="h-12 w-full justify-start gap-3"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">회원탈퇴</span>
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
