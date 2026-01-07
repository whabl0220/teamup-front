'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  User as UserIcon,
  Lock,
  Bell,
  FileText,
  Shield,
  Info,
  LogOut,
  Trash2,
  ChevronRight,
  Edit,
  Megaphone,
} from 'lucide-react'
import { userService, teamService } from '@/lib/services'
import { PlayerCard } from '@/components/shared/PlayerCard'
import { toast } from 'sonner'
import type { User, Team, Post, Position, PlayStyle } from '@/types'

export default function MyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [myPosts, setMyPosts] = useState<Post[]>([])

  // 클라이언트에서만 데이터 로드 (hydration 오류 방지)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // 현재 사용자 정보 조회
        const userData = await userService.getMe()
        // API 응답을 프론트엔드 User 타입으로 변환
        const user: User = {
          id: userData.id,
          name: userData.nickname, // nickname → name 변환
          email: userData.email,
          gender: userData.gender,
          address: userData.address,
          height: userData.height,
          position: userData.mainPosition as Position,
          subPosition: userData.subPosition as Position | undefined,
          playStyle: userData.playStyle as PlayStyle | undefined,
          statusMsg: userData.statusMsg,
        }
        setUser(user)

        // 내 팀 목록 조회
        const teams = await teamService.getMyTeams()
        const team = teams.length > 0 ? teams[0] : null
        setCurrentTeam(team)

        // 내가 올린 모집 글 불러오기 (향후 API 추가 필요)
        if (team) {
          const posts = JSON.parse(localStorage.getItem('teamup_posts') || '[]') as Post[]
          const filteredPosts = posts.filter(post => post.teamId === team.id)
          setMyPosts(filteredPosts)
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        toast.error('데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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
        {/* 플레이어 카드 */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              나의 플레이어 카드
            </h2>
            <Link href="/profile/edit">
              <Button variant="ghost" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                수정
              </Button>
            </Link>
          </div>
          <PlayerCard
            user={user}
            currentTeam={currentTeam}
            showExtendedInfo={true}
            className="mx-auto max-w-sm"
          />
        </div>

        {/* 내 활동 */}
        {currentTeam && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              내 활동
            </h3>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-0">
                <Link href="/mypage/posts">
                  <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Megaphone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-foreground">내가 올린 용병 모집 글</span>
                        {myPosts.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {myPosts.length}개의 모집 글
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 계정 설정 */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            계정 설정
          </h3>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-0">
              <Link href="/profile/basic">
                <button className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">기본 정보 수정</span>
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
