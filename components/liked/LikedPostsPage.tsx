'use client'

import { useEffect, useState, useCallback } from 'react'
import { Post } from '@/lib/stores/feedStore'
import { PostItem } from '@/components/profile/PostItem'
import { apiService } from '@/lib/services/api'
import { PostGridSkeleton } from '@/components/skeletons'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'

const ITEMS_PER_PAGE = 30

export function LikedPostsPage() {
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchLikedPosts = useCallback(async (currentOffset: number) => {
    try {
      setError(null)
      const res = await apiService.getLikedPosts(ITEMS_PER_PAGE, currentOffset)

      if (res.data?.success && res.data?.data) {
        const newPosts = res.data.data
        
        if (currentOffset === 0) {
          setLikedPosts(newPosts)
        } else {
          setLikedPosts((prev) => [...prev, ...newPosts])
        }

        // Check if there are more posts
        setHasMore(newPosts.length === ITEMS_PER_PAGE)
      } else {
        setError('Failed to load liked posts')
      }
    } catch (err) {
      console.error('Failed to fetch liked posts:', err)
      setError('Failed to load liked posts')
    } finally {
      if (currentOffset === 0) {
        setIsLoading(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchLikedPosts(0)
  }, [fetchLikedPosts])

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    const newOffset = offset + ITEMS_PER_PAGE
    setOffset(newOffset)
    fetchLikedPosts(newOffset)
  }

  const handleUnlike = useCallback((postId: string | number) => {
    // Remove post from liked posts when unliked
    setLikedPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [])

  const handleDeletePost = useCallback((postId: string | number) => {
    // Remove post from liked posts when deleted
    setLikedPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [])

  if (isLoading) {
    return <PostGridSkeleton />
  }

  if (error && likedPosts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive text-sm mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOffset(0)
              fetchLikedPosts(0)
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (likedPosts.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No liked posts yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start liking posts to see them here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
        {likedPosts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            isCurrentUserProfile={false}
            onDelete={handleDeletePost}
            onUnlike={handleUnlike}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {error && likedPosts.length > 0 && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}
    </div>
  )
}
