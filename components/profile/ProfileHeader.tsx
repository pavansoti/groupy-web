'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Settings,
  MessageCircle,
  UserPlus,
  UserCheck,
  Camera,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { useAuthStore } from '@/lib/stores/authStore'
import { apiService } from '@/lib/services/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface ProfileHeaderProps {
  user: User
  isCurrentUser: boolean
  onUserUpdate: (user: User) => void
}

export function ProfileHeader({ user, isCurrentUser, onUserUpdate }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  // 🆕 Bio states
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioValue, setBioValue] = useState(user.bio || '')

  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(
    getImageUrl(user.profilePicUrl)
  )

  const { setUser: setAuthUser } = useAuthStore()

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  // Keep bio in sync if user changes
  useEffect(() => {
    setBioValue(user.bio || '')
  }, [user.bio])

  /* ---------------- PROFILE PIC ---------------- */

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const res = await apiService.updateProfileImage(user.id, file)

      if (res.data?.success) {
        const updatedUser = res.data.data
        setAuthUser(updatedUser)
        setProfilePicUrl(getImageUrl(updatedUser.profilePicUrl))
      }
    } catch (err) {
      console.error('Profile pic upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  /* ---------------- BIO ---------------- */

  const handleSaveBio = async () => {
    try {

      const payload = {
        bio: bioValue,
        username: user.username,
        email: user.email,
      }

      const res = await apiService.updateProfile(user.id, payload)

      if (res.data?.success) {
        const updatedUser = res.data.data
        // Update parent (ProfilePage)
        onUserUpdate(updatedUser)

        // Sync auth store ONLY if current user
        setAuthUser(updatedUser)

        setIsEditingBio(false)
      }
    } catch (err) {
      console.error('Bio update failed')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 items-start">
        {/* Avatar */}
        <div className="relative">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt={user.username}
              className="h-32 w-32 rounded-full object-cover border"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}

          {isCurrentUser && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-background border rounded-full p-2 hover:bg-muted"
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{user.username}</h1>

            {isCurrentUser && (
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* 🆕 BIO SECTION */}
          <div className="space-y-2">
            {isEditingBio ? (
              <>
                <textarea
                  value={bioValue}
                  onChange={(e) => setBioValue(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background p-2 text-sm"
                  placeholder="Write something about yourself..."
                />

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveBio}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setBioValue(user.bio || '')
                      setIsEditingBio(false)
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-sm text-muted-foreground">
                  {user.bio || 'No bio yet.'}
                </p>

                {isCurrentUser && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isCurrentUser ? (
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="gap-2"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>

                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Joined {joinDate}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 border-t pt-4">
        <Stat label="Posts" value={user.posts?.length || 0} />
        <Stat label="Followers" value={user.followers?.length || 0} />
        <Stat label="Following" value={user.following?.length || 0} />
      </div>
    </div>
  )
}

/* ---------------- HELPERS ---------------- */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

const getImageUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}
