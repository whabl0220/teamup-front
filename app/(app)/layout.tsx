import { BottomNav } from '@/components/layout/bottom-nav'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

