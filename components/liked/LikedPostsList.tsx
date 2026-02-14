'use client'

import { useEffect, useState, useCallback } from 'react'
import { Post } from '@/lib/stores/feedStore'
import { PostItem } from '@/components/profile/PostItem'
import { apiService } from '@/lib/services/api'
import { PostGridSkeleton } from '@/components/skeletons'
import { Heart, RefreshCw } from 'lucide-react'

interface LikedPostsListProps {
  limit?: number
  showPagination?: boolean
}

export function LikedPostsList({ limit = 100, showPagination = true }: LikedPostsListProps) {
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchLikedPosts = useCallback(async (newOffset: number = 0) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await apiService.getLikedPosts(limit, newOffset)

      if (res.data?.success && res.data?.data) {
        if (newOffset === 0) {
          setLikedPosts(res.data.data)
        } else {
          setLikedPosts((prev) => [...prev, ...res.data.data])
        }

        setHasMore(res.data.data.length === limit)
      }
    } catch (err) {
      console.error('Failed to fetch liked posts:', err)
      setError('Failed to load liked posts')
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchLikedPosts(0)
  }, [fetchLikedPosts])

  const handleLoadMore = () => {
    const newOffset = offset + limit
    setOffset(newOffset)
    fetchLikedPosts(newOffset)
  }

  const handleUnlike = useCallback((postId: string | number) => {
    setLikedPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [])

  const handleDelete = useCallback((postId: string | number) => {
    setLikedPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [])

  const handleRetry = () => {
    setOffset(0)
    fetchLikedPosts(0)
  }

  if (isLoading && likedPosts.length === 0) {
    return <PostGridSkeleton />
  }

  if (error && likedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-destructive text-sm mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (likedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-16">
        <div className="text-center max-w-sm">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Liked Posts Yet</h3>
          <p className="text-muted-foreground text-sm">
            When you like posts, they will appear here. Explore and find content you love!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 py-6">
        {likedPosts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            isCurrentUserProfile={false}
            onDelete={handleDelete}
            onUnlike={handleUnlike}
          />
        ))}
      </div>

      {showPagination && hasMore && !isLoading && (
        <div className="flex justify-center py-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {isLoading && likedPosts.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="animate-spin">
            <Heart className="h-5 w-5 text-primary" />
          </div>
        </div>
      )}
    </div>
  )
}
