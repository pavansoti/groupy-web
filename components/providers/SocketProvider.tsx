'use client'

import { useEffect } from 'react'
import { socketService } from '@/lib/services/socket'
import { useAuthStore } from '@/lib/stores/authStore'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    const connectSocket = async () => {
      try {
        await socketService.connect()
      } catch (err) {
        console.error('Socket connection failed', err)
      }
    }

    connectSocket()

    return () => {
      socketService.disconnect()
    }
  }, [isAuthenticated])

  return <>{children}</>
}
