'use client'

import { useState, useEffect } from 'react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Card } from '@/components/ui/card'
import { useUserStore } from '@/lib/stores/userStore'
import { useParams } from 'next/navigation'
import { apiService } from '@/lib/services/api'

export interface User {
  id: number
  username: string
  email: string
  bio: string | null
  role: string
  followers: any[]
  following: any[]
  createdAt: string
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getUser(userId)

        // success key check
        if (response.data?.success) {
          setUser(response.data.data)
        } else {
          setError(response.data?.message || 'Failed to fetch user')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }
    debugger
    fetchUser()
  }, [userId])

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl">
        <Card className="p-6 text-center text-red-500">
          {error}
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 max-w-2xl">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">User not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-muted-foreground">View user profile</p>
      </div>

      <ProfileCard user={user} isLoading={isLoading} />
    </div>
  )
}
