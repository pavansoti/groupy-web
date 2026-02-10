'use client'

import { useEffect, useState } from 'react'
import {
  Home,
  Heart,
  MessageCircle,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: Home, label: 'Feed', href: '/feed' },
  { icon: Heart, label: 'Likes', href: '/likes' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: MessageCircle, label: 'Messages', href: '/chat' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Standard Next.js hydration fix: only render after the component is mounted in the browser
  useEffect(() => {
    setMounted(true)
    
    const updateStatus = () => setIsOnline(navigator.onLine)

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (!mounted) return null

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-64px)] border-r border-border bg-background transition-all duration-300 ease-in-out hidden md:flex flex-col',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      {/* Toggle */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Button
              key={item.href}
              asChild
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 transition-all',
                  collapsed && 'px-0',
                  isActive && 'bg-primary'
                )}
              >
              <Link href={item.href}>
                <Icon className="h-5 w-5 shrink-0" />

                {/* Label */}
                <span
                  className={cn(
                    'whitespace-nowrap transition-all duration-200',
                    collapsed
                      ? 'opacity-0 w-0 overflow-hidden'
                      : 'opacity-100 w-auto'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Network Status */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'mt-auto border-t border-border px-3 py-3 flex items-center gap-3 text-sm cursor-default',
                collapsed && 'justify-center px-0'
              )}
            >
              {/* Status Dot */}
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                )}
              />

              {/* Text only when expanded */}
              {!collapsed && (
                <span className="text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              )}
            </div>
          </TooltipTrigger>

          {/* Tooltip ONLY useful when collapsed */}
          {collapsed && (
            <TooltipContent side="right">
              <p className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnline
                  ? 'Connected to the internet'
                  : 'No internet connection'}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </aside>
  )
}
