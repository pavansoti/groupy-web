'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserProfile } from '@/lib/stores/userStore'
import Link from 'next/link'

interface FollowersListProps {
  followers: UserProfile[]
  isLoading?: boolean
  onFollowChange?: (userId: string) => void
}

export function FollowersList({ followers, isLoading = false, onFollowChange }: FollowersListProps) {
  if (followers.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No followers yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {followers.map((follower) => (
        <Card key={follower.id} className="p-4 flex items-center justify-between">
          <Link href={`/profile/${follower.id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/50 flex-shrink-0 flex items-center justify-center text-sm font-semibold">
              {follower.profilePicture ? (
                <img src={follower.profilePicture || "/placeholder.svg"} alt={follower.username} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                follower.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{follower.username}</p>
              <p className="text-xs text-muted-foreground truncate">{follower.followersCount} followers</p>
            </div>
          </Link>
          <Button
            size="sm"
            variant={follower.isFollowing ? 'secondary' : 'default'}
            onClick={() => onFollowChange?.(follower.id)}
            disabled={isLoading}
            className="ml-2 flex-shrink-0"
          >
            {follower.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </Card>
      ))}
    </div>
  )
}
