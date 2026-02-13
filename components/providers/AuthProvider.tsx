'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCookie } from '@/lib/utils/cookie'

/**
 * AuthProvider - Handles client-side authentication logic
 * 
 * Uses HTTP cookies (industry standard) for storing auth tokens because:
 * - Cookies are secure and can be HttpOnly (prevents XSS)
 * - Automatically sent with API requests
 * - Server can set and validate them
 * - Proper lifetime management
 * - Industry standard for JWT tokens
 * 
 * Why NOT SessionStorage?
 * - Lost on tab close (bad UX)
 * - Vulnerable to XSS (no HttpOnly)
 * - Requires manual request setup
 * - Not suitable for API auth
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Get token from cookies using utility function
    const token = getCookie('token')

    // Define public paths that don't require authentication
    const isAuthPage = pathname.startsWith('/auth')
    const isResetPasswordPage = pathname.startsWith('/auth/reset-password')
    const isPublicAsset = pathname.startsWith('/_next') || 
                         pathname.startsWith('/api') || 
                         pathname.includes('.')

    // Reset password page doesn't require authentication
    if (isResetPasswordPage) {
      setIsChecking(false)
      return
    }

    // If the user is on an auth page and has a token, redirect to feed
    if (isAuthPage && token) {
      router.push('/feed')
      return
    }

    // If the user is NOT on an auth page/public asset and has NO token, redirect to signin
    if (!isAuthPage && !isPublicAsset && !token) {
      router.push('/auth/signin')
      return
    }

    setIsChecking(false)
  }, [pathname, router])

  // Optionally show loading state while checking auth
  if (isChecking) {
    return null
  }

  return <>{children}</>
}
