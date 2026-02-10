'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Home, Heart, MessageCircle, Search, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: Home, label: 'Feed', href: '/feed' },
  { icon: Heart, label: 'Likes', href: '/likes' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: MessageCircle, label: 'Chat', href: '/chat' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function MobileNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background flex md:hidden z-40">
      <div className="flex w-full gap-2 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Button
              key={item.href}
              asChild
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'w-full h-10 flex-col gap-1 text-xs',
                  isActive && 'bg-primary'
                )}
              >
              <Link href={item.href} className="flex-1">
                <Icon className="h-5 w-5" />
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
