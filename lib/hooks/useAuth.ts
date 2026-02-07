'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setToken, logout: storeLogout } = useAuthStore()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsReady(true)
    }
  }, [mounted])

  const logout = useCallback(() => {
    storeLogout()
    router.push('/auth/signin')
  }, [router, storeLogout])

  return {
    user,
    token,
    isAuthenticated,
    isReady,
    setUser,
    setToken,
    logout,
  }
}
