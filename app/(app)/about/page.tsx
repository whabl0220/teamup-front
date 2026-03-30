import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/mypage" aria-label="뒤로가기">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">앱 정보</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-24">
        <Card className="teamup-card-soft">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">앱 이름</span>
              <span className="font-medium">TeamUp</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">버전</span>
              <span className="font-medium">v0.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">서비스 목적</span>
              <span className="font-medium">농구 매치 참가/주최 관리</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">문의</span>
              <span className="text-right font-medium">support@teamup.example</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
