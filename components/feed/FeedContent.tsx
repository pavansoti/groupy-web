'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useFeedStore } from '@/lib/stores/feedStore'
import { PostCard } from './PostCard'
import { CreatePostForm } from './CreatePostForm'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/lib/services/api'
import { toast } from 'sonner'
import { PostCardSkeleton } from '@/components/skeletons'
import { LIMIT } from '@/lib/constants'
import { Heart } from 'lucide-react'

export function FeedContent({ feedsType = "all" }) {
  const {
    posts,
    isLoading,
    hasMore,
    // offset,
    setIsLoading,
    // incrementOffset,
    setPosts,
    addPosts,
    removePost,
    toggleLike,
    resetFeed,
    setHasMore
  } = useFeedStore()

  const pageRef = useRef(0)
  const [isCreating, setIsCreating] = useState(false)
  const observerRef = useRef<HTMLDivElement | null>(null)
  const fetchingRef = useRef(false) // prevents infinite calls

  // Production fetch
  const fetchPosts = useCallback(
    async (offSet: number, isLoadMore = false) => {
      if (fetchingRef.current) return
      fetchingRef.current = true

      try {
        setIsLoading(true)

        const response = await apiService.getFeedFollowing(
          feedsType === 'liked',
          offSet,
          LIMIT
        )

        if (response.data?.success) {
          const data = response.data.data
          setHasMore(data.hasMore)

          if (isLoadMore) {
            addPosts(data.content)
          } else {
            setPosts(data.content)
          }
        } else {
          toast.error('Failed to fetch posts')
        }
      } catch (error) {
        console.error('Feed fetch error:', error)
      } finally {
        setIsLoading(false)
        fetchingRef.current = false
      }
    },
    [feedsType, setIsLoading, setPosts, addPosts, setHasMore]
  )

  // Initial load
  useEffect(() => {
    pageRef.current = 0
    setPosts([])
    setHasMore(true)

    fetchPosts(0, false)
    return () => resetFeed()
  }, [fetchPosts, resetFeed])

  // Production Infinite Scroll
  useEffect(() => {
    if (!hasMore) return
  
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
  
        if (
          entry.isIntersecting &&
          !isLoading &&
          !fetchingRef.current &&
          hasMore
        ) {
          const nextPage = pageRef.current + 1
          pageRef.current = nextPage
          fetchPosts(nextPage, true)
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0,
      }
    )
  
    const current = observerRef.current
    if (current) observer.observe(current)
  
    return () => {
      if (current) observer.unobserve(current)
      observer.disconnect()
    }
  }, [hasMore, isLoading, fetchPosts])

  // Create Post
  const handleCreatePost = useCallback(async (formData: FormData) => {
    try {
      setIsCreating(true)

      const res = await apiService.createPost(formData)

      if (!res.data.success) {
        toast.error('Failed to create post')
        return false
      }

      toast.success('Post created successfully')
      resetFeed()
      fetchPosts(0, false)

      return true
    } catch {
      toast.error('Something went wrong')
      return false
    } finally {
      setIsCreating(false)
    }
  }, [fetchPosts, resetFeed])

  const handleLike = useCallback(
    async (postId: number, liked: boolean) => {
      const action = liked ? 'unlikePost' : 'likePost'
      await apiService[action](postId)
      if(feedsType === 'liked') {
        removePost(postId)
      } else {
        toggleLike(postId)
      }
    },
    [toggleLike]
  )

  const handleComment = useCallback((postId: number) => {
    console.log('Comment on post:', postId)
  }, [])

  return (
    // { feedsType === "all" ? 'space-y-6 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8' : ''
    <div className={feedsType === "all" 
      ? "space-y-6 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8" 
      : "space-y-6 max-w-2xl mx-auto"}>
      {feedsType === 'all' && (
        <CreatePostForm
          onSubmit={handleCreatePost}
          isLoading={isCreating}
        />
      )}

      {isLoading && posts.length === 0 ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          {feedsType === "liked" ? (
            <>
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">You haven't liked any posts yet</p>
              <p className="text-sm text-muted-foreground">
                Start liking posts from the feed to see them here
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                No posts yet. Start following users!
              </p>
              <Button asChild>
                <a href="/search">Find users</a>
              </Button>
            </>
          )}
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              isLoading={isLoading}
            />
          ))}

          {hasMore && (
            <div
              ref={observerRef}
            >
              {isLoading && <PostCardSkeleton />}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function Feed() {
  return <FeedContent />
}
