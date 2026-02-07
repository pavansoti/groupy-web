'use client'

import { ProfileCard } from '@/components/profile/ProfileCard'
import { useEffect, useState } from 'react'
import { apiService } from '@/lib/services/api'
import { User } from './[id]/page'

export default function ProfilePage() {

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)

      try {

        const response = await apiService.getUser(user.id)

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
  }, [])

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">View and manage your profile</p>
      </div>

      <ProfileCard user={user} />
    </div>
  )
}
