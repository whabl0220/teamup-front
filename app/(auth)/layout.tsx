export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
