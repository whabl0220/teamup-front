'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Sparkles, Map, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IS_MVP_V2 } from '@/lib/config/mvp'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/home', icon: Home, label: '홈' },
    ...(!IS_MVP_V2 ? [
      { href: '/matching', icon: Search, label: '팀 매칭' },
      { href: '/coaching', icon: Sparkles, label: 'AI 코치' },
    ] : []),
    { href: '/map', icon: Map, label: '지도' },
    { href: '/mypage', icon: User, label: '마이' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
