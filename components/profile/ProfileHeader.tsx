'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, MessageCircle, LogOut, UserPlus, UserCheck } from 'lucide-react'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { useAuthStore } from '@/lib/stores/authStore'

interface ProfileHeaderProps {
  user: User
  isCurrentUser: boolean
}

export function ProfileHeader({ user, isCurrentUser }: ProfileHeaderProps) {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(user.bio || '')
  const [isFollowing, setIsFollowing] = useState(false)
  const { logout } = useAuthStore()

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  const postCount = 0 // TODO: Get from API

  const handleSaveBio = () => {
    // TODO: Call API to update bio
    setIsEditingBio(false)
  }

  const handleFollowClick = () => {
    // TODO: Call API to follow/unfollow
    setIsFollowing(!isFollowing)
  }

  return (
    <div className="w-full">
      {/* Profile Header Container */}
      <div className="flex flex-col gap-6 md:gap-8">
        {/* Top Row: Avatar and Info */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-2 ring-border bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl sm:text-4xl font-semibold text-primary">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 w-full space-y-4">
            {/* Username and Action Icons */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {user.username}
                </h1>
              </div>
              {isCurrentUser && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
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

            {/* Primary Action Button */}
            <div className="flex gap-2 flex-wrap">
              {isCurrentUser ? (
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollowClick}
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
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Bio Section */}
            {isEditingBio && isCurrentUser ? (
              <div className="space-y-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add a bio..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveBio}>
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
                className="text-foreground text-sm leading-relaxed cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => isCurrentUser && setIsEditingBio(true)}
                role={isCurrentUser ? 'button' : undefined}
                tabIndex={isCurrentUser ? 0 : undefined}
              >
                {bio || (isCurrentUser ? 'Click to add a bio...' : 'No bio')}
              </p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 sm:gap-8 border-t border-border pt-4">
          <div className="flex flex-col items-start">
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {postCount}
            </p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {user.followers?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {user.following?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-xs text-foreground font-medium">{joinDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
