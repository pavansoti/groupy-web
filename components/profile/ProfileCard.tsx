'use client'

import { User } from '@/app/(main)/profile/[id]/page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserProfile } from '@/lib/stores/userStore'
import { Users } from 'lucide-react'

interface ProfileCardProps {
  user: User
  onFollowChange?: () => void
  isCurrentUser?: boolean
  isLoading?: boolean
}

export function ProfileCard({ user, onFollowChange, isCurrentUser = false, isLoading = false }: ProfileCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-3xl font-bold text-primary-foreground">
          {/* {user.profilePicture ? (
            <img src={user.profilePicture || "/placeholder.svg"} alt={user.username} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            user.username.charAt(0).toUpperCase()
          )} */}
          <img src="/placeholder.svg" alt={user.username} className="h-24 w-24 rounded-full object-cover" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
          <p className="text-sm text-muted-foreground">{user.bio || 'No bio yet'}</p>
        </div>

        <div className="flex gap-6 w-full justify-center">
          {/* <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{user.postsCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div> */}
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{user.followers.length}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{user.following.length}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {!isCurrentUser && (
          <Button className="w-full" disabled={isLoading}>
            <Users className="h-4 w-4 mr-2" />
            Follow
            {/* {user.isFollowing ? 'Following' : 'Follow'} */}
          </Button>
        )}
      </div>
    </Card>
  )
}
