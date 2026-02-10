'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { useSearch } from '@/lib/hooks/useSearch'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/utils'
import { Card } from '../ui/card'
import { apiService } from '@/lib/services/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/authStore'

interface SearchInputProps {
  onResultSelect?: (userId: string) => void
}

export function SearchInput({ onResultSelect }: SearchInputProps) {
  const { query, setQuery, results, isLoading } = useSearch()
  const [displayResults, setDisplayResults] = useState(results)
  const inputRef = useRef<HTMLInputElement>(null)

  const { user: currentUser } = useAuthStore()

  useEffect(() => {
    setDisplayResults(results)
    inputRef.current?.focus()
  }, [results])

  const toggleFollow = async (userId: string) => {
    const index = displayResults.findIndex((u) => u.id === userId)
    if (index === -1) return

    const user = displayResults[index]
    const wasFollowing = user.following

    // Optimistic update
    const updatedUser = {
      ...user,
      following: !wasFollowing,
      followerCount: wasFollowing
        ? (user.followerCount || 0) - 1
        : (user.followerCount || 0) + 1,
    }

    const newResults = [...displayResults]
    newResults[index] = updatedUser
    setDisplayResults(newResults)

    try {
      if (wasFollowing) {
        await apiService.unfollowUser(userId)
      } else {
        await apiService.followUser(userId)
      }
    } catch (error) {
      console.error('Follow toggle failed:', error)
      toast.error('Failed to update follow status')
      // Revert
      const revertedResults = [...displayResults]
      revertedResults[index] = user
      setDisplayResults(revertedResults)
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          ref={inputRef}
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="pr-8"
        />
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : displayResults.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No users found</div>
          ) : (
            <div className="divide-y divide-border">
              {displayResults.map((user) => {
                if (!user) {
                  return null
                }
                return (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <button
                      key={user.id}
                      onClick={() => {
                        onResultSelect?.(user.id)
                        setQuery('')
                      }}
                      className="w-full p-4 flex items-center gap-3 cursor-pointer transition-colors text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {user.profilePicUrl ? (
                          <img src={getImageUrl(user.profilePicUrl) || "/placeholder.svg"} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.followerCount} followers</p>
                      </div>
                    </button>
                    {
                      currentUser?.id !== user.id && <Button
                        size="sm"
                        variant={user?.following ? 'secondary' : 'default'}
                        onClick={() => toggleFollow(user.id)}
                        className="ml-2 flex-shrink-0 cursor-pointer"
                      >
                        {user?.following ? 'Following' : 'Follow'}
                      </Button>
                    }
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
