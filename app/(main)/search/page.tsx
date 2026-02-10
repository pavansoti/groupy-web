'use client'

import { useState } from 'react'
import { SearchInput } from '@/components/search/SearchInput'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
// import { useUserStore } from '@/lib/stores/userStore'
import { useSearch } from '@/lib/hooks/useSearch'
// import Link from 'next/link'

export default function SearchPage() {
  const router = useRouter()
  // const { getUser, toggleFollow } = useUserStore()
  const { query, results } = useSearch()

  const handleSelectResult = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Search Users</h1>
        <p className="text-muted-foreground">Find and follow users on InstaChat</p>
      </div>

      <SearchInput onResultSelect={handleSelectResult} />

      {/* {query && results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
          {results.map((user) => {
            const userProfile = getUser(user.id)
            return (
              <Card key={user.id} className="p-4 flex items-center justify-between">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-primary/50 flex-shrink-0 flex items-center justify-center font-semibold text-sm">
                    {user.profilePicture ? (
                      <img src={user.profilePicture || "/placeholder.svg"} alt={user.username} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.followersCount} followers</p>
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant={userProfile?.isFollowing ? 'secondary' : 'default'}
                  onClick={() => toggleFollow(user.id)}
                  className="ml-2 flex-shrink-0"
                >
                  {userProfile?.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </Card>
            )
          })}
        </div>
      )}

      {query && results.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No users found matching "{query}"</p>
        </Card>
      )} */}

      {!query && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Start typing to search for users</p>
        </Card>
      )}
    </div>
  )
}
