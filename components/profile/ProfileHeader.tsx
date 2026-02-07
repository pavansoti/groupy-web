'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, MessageCircle, LogOut } from 'lucide-react'
import Image from 'next/image'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { useAuthStore } from '@/lib/stores/authStore'

interface ProfileHeaderProps {
  user: User
  isCurrentUser: boolean
}

export function ProfileHeader({ user, isCurrentUser }: ProfileHeaderProps) {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(user.bio || '')
  const { logout } = useAuthStore()

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  const handleSaveBio = () => {
    // TODO: Call API to update bio
    setIsEditingBio(false)
  }

  return (
    <div className="w-full bg-background">
      {/* Profile Content */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 gap-6">
        {/* Avatar Section */}
        <div className="flex justify-center md:justify-start">
          <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden ring-2 ring-border">
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl md:text-5xl font-semibold text-primary">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-4">
          {/* Username and Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {user.username}
              </h1>
              {isCurrentUser && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {isCurrentUser ? (
                <Button className="flex-1 md:flex-none" variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button className="flex-1 md:flex-none">
                    Follow
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            {isEditingBio && isCurrentUser ? (
              <div className="space-y-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add a bio..."
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveBio}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingBio(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="text-foreground text-sm leading-relaxed cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => isCurrentUser && setIsEditingBio(true)}
              >
                {bio || (isCurrentUser ? 'Click to add a bio' : 'No bio yet')}
              </p>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex gap-8 pt-2">
            <div className="text-center md:text-left">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {user.followers?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {user.following?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground">Joined {joinDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
