'use client'

import { useState, useEffect } from 'react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/authStore'
import { useParams } from 'next/navigation'
import { apiService } from '@/lib/services/api'

export interface User {
  id: string | number
  username: string
  email: string
  bio: string | null
  role: string
  gender: string | null
  posts: any[]
  // followers: any[]
  // following: any[]
  followerCount: number
  followingCount: number
  postCount: number
  createdAt: string
  privateAccount: boolean
  imageUrl: string | null
  following: boolean
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

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const handlePostDeleted = () => {
    setUser((prev) =>
      prev
        ? { ...prev, postCount: prev.postCount - 1 }
        : prev
    )
  }

  // Check if this is the current user's profile
  const isCurrentUser = currentUser && user && String(currentUser.id) === String(user.id)

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Card className="p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">User not found</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      {/* Profile Header Section */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <ProfileHeader user={user} isCurrentUser={isCurrentUser} onUserUpdate={handleUserUpdate}/>
        </div>
      </div>

      {/* Tabs and Posts Section */}
      <div className="max-w-4xl mx-auto">
        <ProfileTabs user={user} isCurrentUser={isCurrentUser} onPostDeleted={handlePostDeleted}/>
      </div>
    </div>
  )
}
