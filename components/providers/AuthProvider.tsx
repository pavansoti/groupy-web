'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY)

    const isAuthPage = pathname.startsWith('/auth')

    const isPublicAsset =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.')

    // ADD PUBLIC ROUTES HERE
    const isPublicRoute =
      pathname.startsWith('/post')

    // If user is on auth page and already logged in
    if (isAuthPage && token) {
      router.replace('/feed')
      return
    }

    // If route is NOT public and no token → redirect
    if (!isAuthPage && !isPublicAsset && !isPublicRoute && !token) {
      router.replace('/auth/signin')
      return
    }
  }, [pathname, router])

  return <>{children}</>
}