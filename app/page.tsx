import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 중앙 콘텐츠 */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* 로고 */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/images/logo.jpg"
                alt="TeamUp"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">
            TeamUp
          </h1>

          {/* 서브타이틀 */}
          <p className="mb-12 text-base leading-relaxed text-muted-foreground">
            AI 기반 팀 매칭으로
            <br />
            완벽한 팀을 만나보세요
          </p>

          {/* 버튼 */}
          <div className="space-y-3">
            <Link href="/login" className="block w-full">
              <Button
                size="lg"
                className="h-12 w-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
              >
                로그인
              </Button>
            </Link>
            <Link href="/signup" className="block w-full">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full text-lg font-semibold"
              >
                회원가입
              </Button>
            </Link>
            <Link href="/home" className="block w-full">
              <Button
                size="lg"
                variant="ghost"
                className="h-12 w-full text-lg font-semibold"
              >
                체험하기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-lg px-4 text-center text-sm text-muted-foreground">
          <p>2025 TeamUp. AI Powered Team Matching</p>
        </div>
      </footer>
    </div>
  )
}
