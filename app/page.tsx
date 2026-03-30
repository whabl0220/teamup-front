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
            TeamUp과 함께
            <br />
            농구 팀 매칭을 시작해보세요
          </p>

          {/* 버튼 */}
          <div className="space-y-3">
            <Button
              asChild
              size="lg"
              className="h-12 w-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/95"
            >
              <Link href="/login">로그인</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full text-lg font-semibold"
            >
              <Link href="/signup">회원가입</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 w-full text-lg font-semibold"
            >
              <Link href="/home">체험하기</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-lg px-4 text-center text-sm text-muted-foreground">
          <p>2025 TeamUp. Basketball Team Matching</p>
        </div>
      </footer>
    </div>
  )
}
