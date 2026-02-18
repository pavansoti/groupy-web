'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, LogOut, User, Lock } from 'lucide-react'
import Link from 'next/link'
import { ThemePicker } from '../providers/ThemePicker'
import { ChangePasswordDialog } from '../auth/ChangePasswordDialog'

function NavbarContent() {
  const { theme, setTheme } = useTheme()
  const { user, logout, mounted } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  const handleLogout = () => {
    sessionStorage.clear()
    localStorage.clear()
    logout()
  }

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/feed" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-full bg-primary"></div>
            <span className="hidden sm:inline">GroupyChat</span>
          </Link>
          <div className="h-10 w-10 bg-muted rounded-full"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/feed" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-full bg-primary"></div>
          <span className="hidden sm:inline">GroupyChat</span>
        </Link>

        <div className="flex items-center gap-2">

          <ThemePicker />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary/50 flex items-center justify-center text-xs font-semibold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'G'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground shadow-md border">
                <div className="px-2 py-1.5 text-sm font-medium">{user?.username || 'Guest'}</div>
                <div className="px-2 text-xs text-muted-foreground">{user?.email || 'Guest'}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile`} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)} className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </nav>
  )
}

export function Navbar() {
  return <NavbarContent />
}
