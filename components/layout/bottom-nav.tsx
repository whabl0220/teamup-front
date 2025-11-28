'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Map, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getReceivedMatchRequests } from '@/lib/storage'

export function BottomNav() {
  const pathname = usePathname()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const updateNotificationCount = () => {
      const requests = getReceivedMatchRequests()
      setNotificationCount(requests.length)
    }

    updateNotificationCount()

    // Update notification count when returning to the app
    window.addEventListener('focus', updateNotificationCount)

    // Update notification count when localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamup_app_data') {
        updateNotificationCount()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Also update when navigating between pages
    // This catches same-window localStorage changes
    const intervalId = setInterval(updateNotificationCount, 1000)

    return () => {
      window.removeEventListener('focus', updateNotificationCount)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(intervalId)
    }
  }, [])

  const navItems = [
    { href: '/home', icon: Home, label: '홈' },
    { href: '/matching', icon: Search, label: '매칭' },
    { href: '/notifications', icon: Bell, label: '알림', badge: notificationCount },
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
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
