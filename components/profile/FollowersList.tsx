'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FollowersListSkeleton } from '@/components/skeletons'
import { SearchResult } from '@/lib/hooks/useSearch'
import { User } from '@/lib/stores/authStore'

interface FollowersListProps {
  user: User,
  followers: SearchResult[]
  isLoading?: boolean
  onFollowChange?: (userId: string, isFollowing: boolean) => void
}

export function FollowersList({ user, followers, isLoading = false, onFollowChange }: FollowersListProps) {
  if (isLoading) {
    return <FollowersListSkeleton />
  }

  if (followers.length === 0) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <Card className="p-8 text-center">
          <p className="text-muted-foreground">No followers yet</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {followers.map((follower) => (
          <Card
          key={follower.id}
          className="p-4 flex flex-row items-center justify-between"
        >
          <Link
            href={`/profile/${follower.id}`}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {follower.imageUrl ? (
                <img
                  src={follower.imageUrl}
                  alt={follower.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                follower.username.charAt(0).toUpperCase()
              )}
            </div>
        
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {follower.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {follower.followerCount} followers
              </p>
            </div>
          </Link>
        
          {follower.id !== user.id && <Button
            size="sm"
            variant={follower.following ? "secondary" : "default"}
            onClick={() => onFollowChange?.(follower.id, follower.following)}
            disabled={isLoading}
            className="ml-3 flex-shrink-0"
            >
            {follower.following ? "Following" : "Follow"}
          </Button>}
        </Card>
        ))}
      </div>
    </div>
  )
}
