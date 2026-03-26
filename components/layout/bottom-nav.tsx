'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { matchService } from '@/lib/services'

export function BottomNav() {
  const pathname = usePathname()
  const [hostedCount, setHostedCount] = useState(0)

  const refreshHostedCount = useCallback(async () => {
    try {
      const hosted = await matchService.listHostedMatches()
      setHostedCount(hosted.length)
    } catch {
      setHostedCount(0)
    }
  }, [])

  useEffect(() => {
    void refreshHostedCount()
    const onFocus = () => void refreshHostedCount()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refreshHostedCount])

  const navItems = [
    { href: '/home', icon: Home, label: '홈' },
    { href: '/matches', icon: Search, label: '매치' },
    { href: '/host/matches', icon: Settings, label: '주최' },
    { href: '/mypage', icon: User, label: '마이' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/host/matches' && pathname.startsWith('/host/matches'))
          const Icon = item.icon
          const shouldEmphasizeHost = item.href === '/host/matches' && hostedCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                shouldEmphasizeHost && !isActive && "text-primary/90"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              {shouldEmphasizeHost && (
                <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-primary" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
