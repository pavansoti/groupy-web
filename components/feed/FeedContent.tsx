'use client'

import { useEffect, useState, useCallback } from 'react'
import { useFeedStore } from '@/lib/stores/feedStore'
import { PostCard } from './PostCard'
import { CreatePostForm } from './CreatePostForm'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/lib/services/api'
import { toast } from 'sonner'

export function FeedContent() {
  const { posts, isLoading, hasMore, incrementOffset, setPosts, toggleLike } =
    useFeedStore()

  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiService.getFeedFollowing();
        setPosts(response.data.data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }
    fetchPosts()
  }, [])

  const handleCreatePost = useCallback(async (formData: FormData) => {
    setIsCreating(true)
    try {
      const res = await apiService.createPost(formData)
  
      if (res.data.success) {
        toast.success('Post created successfully')
  
        const response = await apiService.getFeedFollowing()
        setPosts(response.data.data)
        return true
      } else {
        toast.error('Failed to create post')
        return false
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Something went wrong')
      return false
    } finally {
      setIsCreating(false)
    }
  }, [])

  const handleLike = useCallback(
    async (postId: number, likedByCurrentUser: boolean) => {
      const callFunc = likedByCurrentUser ? 'unlikePost' : 'likePost';
      const response = await apiService[callFunc](postId);
      toggleLike(postId)
    },
    [toggleLike]
  )

  const handleComment = useCallback((postId: number) => {
    console.log('Comment on post:', postId)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      incrementOffset()
    }
  }, [hasMore, isLoading, incrementOffset])

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <CreatePostForm
        onSubmit={handleCreatePost}
        isLoading={isCreating}
      />

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No posts yet. Start following users!
          </p>
          <Button asChild>
            <a href="/search">Find users</a>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
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
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Feed() {
  return <FeedContent />
}