'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setToken, logout: storeLogout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Standard Next.js hydration fix: only set mounted to true after the component is in the browser
  useEffect(() => {
    setMounted(true)
  }, [])

  const logout = useCallback(() => {
    // Clear the token cookie
    // document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    storeLogout()
    router.push('/auth/signin')
  }, [router, storeLogout])

  return {
    user,
    token,
    isAuthenticated,
    mounted,
    setUser,
    setToken,
    logout,
  }
}
