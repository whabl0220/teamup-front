'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, Settings, UserPen } from 'lucide-react'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function HomePage() {
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
            <h1 className="text-2xl font-bold tracking-tight">TeamUp</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">오늘/이번 주 매치 찾기</h2>
          <p className="text-sm text-muted-foreground">
            입금 후 승인 대기, 확정/환불까지 운영자가 관리해요.
          </p>
        </div>

        <div className="grid gap-3">
          <Link href="/matches">
            <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-foreground">매치 찾기</h3>
                    <p className="text-xs text-muted-foreground">
                      시간/장소/정원을 확인하고 바로 신청하세요.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/basic">
            <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <UserPen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-foreground">프로필</h3>
                    <p className="text-xs text-muted-foreground">
                      닉네임/포지션/플레이 스타일을 최소로 설정합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/host/matches"
            onClick={() => {
              // 주최자 화면은 매치 운영을 위한 공간입니다.
              toast.info('주최자 화면은 매치 운영(확정/환불)을 위한 공간입니다.')
            }}
          >
            <Card className="cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent transition-all hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-foreground">주최자 관리</h3>
                    <p className="text-xs text-muted-foreground">
                      신청자 확인, 참가 확정, 환불을 처리합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="rounded-lg border border-border/50 bg-secondary/10 p-4 text-sm text-muted-foreground">
          현재는 임시 구현으로 동작합니다. (Clerk/이메일 연동은 추후 적용 예정)
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

