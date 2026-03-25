'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { PlayerCard } from '@/components/shared/PlayerCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { userService } from '@/lib/services'
import type { User, Position, PlayStyle } from '@/types'
import {
  Bell,
  ChevronRight,
  Edit,
  FileText,
  Info,
  LogOut,
  Shield,
  Trash2,
  User as UserIcon,
} from 'lucide-react'

export default function MyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const userData = await userService.getMe()
        const converted: User = {
          id: userData.id,
          name: userData.nickname,
          email: userData.email,
          gender: userData.gender,
          address: userData.address,
          height: userData.height,
          position: userData.mainPosition as Position,
          subPosition: userData.subPosition as Position | undefined,
          playStyle: userData.playStyle as PlayStyle | undefined,
          statusMsg: userData.statusMsg,
        }
        setUser(converted)
      } catch (err) {
        console.error(err)
        toast.error('데이터를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const handleLogout = () => {
    router.push('/')
  }

  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true)
  }

  const confirmDeleteAccount = () => {
    setShowDeleteAccountModal(false)
    toast.success('회원탈퇴가 완료되었습니다.')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pb-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pb-20">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.jpg"
              alt="TeamUp Logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain"
            />
            <h1 className="text-2xl font-bold tracking-tight">마이</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">내 프로필</p>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  수정
                </Button>
              </Link>
            </div>
            <PlayerCard user={user} currentTeam={null} showExtendedInfo={false} className="mx-auto" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
          <CardContent className="p-5 space-y-3">
            <p className="font-semibold">나의 활동</p>
            <Link href="/matches">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <UserIcon className="h-4 w-4" />
                매치 보기
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
          <CardContent className="p-5 space-y-3">
            <p className="font-semibold">계정 설정</p>
            <div className="space-y-2">
              <Link href="/profile/basic">
                <button className="flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">기본 정보 수정</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
              <div className="flex items-center justify-between rounded-md p-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">알림 설정</span>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
            <Separator />
            <p className="font-semibold">기타</p>
            <div className="space-y-2">
              <Link href="/terms">
                <button className="flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">이용약관</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
              <Link href="/privacy">
                <button className="flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">개인정보 처리방침</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </Link>
              <Link href="/about">
                <button className="flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">앱 정보</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">v1.0.0</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              </Link>
            </div>
            <Separator />
            <p className="font-semibold">계정</p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                로그아웃
              </Button>
              <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleDeleteAccount}>
                <Trash2 className="h-5 w-5" />
                회원탈퇴
              </Button>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              기본 프로필과 매치 신청/운영 플로우를 제공합니다.
            </p>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">회원탈퇴</DialogTitle>
            <DialogDescription className="text-center">
              정말로 탈퇴하시겠습니까?
              <br />
              <span className="font-semibold text-destructive">이 작업은 되돌릴 수 없습니다.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button variant="destructive" className="w-full" onClick={confirmDeleteAccount}>
              탈퇴하기
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDeleteAccountModal(false)}
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}

