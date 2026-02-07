'use client'

import { useState, useEffect } from 'react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/userStore'
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

export default function ProfilePage() {
  const params = useParams()
  // params.id will be an array for optional catch-all, or undefined if not provided
  const idArray = params.id as string[] | undefined
  const userId = idArray ? idArray[0] : undefined

  const { user: currentUser } = useAuthStore()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine which user ID to fetch
  const userIdToFetch = userId || currentUser?.id

  useEffect(() => {
    if (!userIdToFetch) {
      setError('User not found')
      return
    }

    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getUser(userIdToFetch)

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
    fetchUser()
  }, [userIdToFetch])

  // Check if this is the current user's profile
  const isCurrentUser = currentUser && user && String(currentUser.id) === String(user.id)

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
        <h1 className="text-3xl font-bold text-foreground">
          {isCurrentUser ? 'My Profile' : `${user.username}'s Profile`}
        </h1>
        <p className="text-muted-foreground">
          {isCurrentUser ? 'View and manage your profile' : 'View user profile'}
        </p>
      </div>

      <ProfileCard user={user} isCurrentUser={isCurrentUser} isLoading={isLoading} />
    </div>
  )
}
