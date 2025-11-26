import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 로고 헤더 */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">TeamUp</h1>
          </div>
        </div>
      </header>

      {/* 중앙 정렬 콘텐츠 */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-lg px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 TeamUp. AI Powered Team Matching</p>
        </div>
      </footer>
    </div>
  )
}
