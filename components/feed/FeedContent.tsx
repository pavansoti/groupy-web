'use client'

import { useEffect, useState, useCallback } from 'react'
import { useFeedStore } from '@/lib/stores/feedStore'
import { PostCard } from './PostCard'
import { CreatePostForm } from './CreatePostForm'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/lib/services/api'

const MOCK_POSTS = [
  {
    id: '1',
    authorId: 'user1',
    authorUsername: 'John Doe',
    authorProfilePicture: undefined,
    image: undefined,
    caption: 'Just launched my new project 🚀',
    likesCount: 234,
    commentsCount: 12,
    createdAt: new Date().toISOString(),
    isLiked: false,
    comments: [],
  },
  { id: '2', authorId: 'user2', authorUsername: 'Jane Smith', authorProfilePicture: undefined, image: undefined, caption: 'Beautiful sunset today at the beach 🌅', likesCount: 456, commentsCount: 28, createdAt: new Date(Date.now() - 3600000).toISOString(), isLiked: false, comments: [], }, { id: '3', authorId: 'user3', authorUsername: 'Tech Enthusiast', authorProfilePicture: undefined, image: undefined, caption: 'Learning TypeScript has been a game changer for my development workflow!', likesCount: 189, commentsCount: 45, createdAt: new Date(Date.now() - 7200000).toISOString(), isLiked: false, comments: [], },
]

export function FeedContent() {
  const { posts, isLoading, hasMore, incrementOffset, setPosts, toggleLike } =
    useFeedStore()

  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (posts.length === 0) {
      const fetchPosts = async () => {
        try {
          const response = await apiService.getFeed();
          console.log('Fetched posts:', response.data.data)
          // setPosts(response.data.data)
          setPosts(MOCK_POSTS)
        } catch (error) {
          console.error('Error fetching posts:', error)
        }
      }
      fetchPosts()
    } else {
      setPosts(MOCK_POSTS)
    }
  }, [])

  const handleCreatePost = useCallback(async (formData: FormData) => {
    setIsCreating(true)
    try {
      await apiService.createPost(formData)
      // Optional: refetch feed or optimistic update
      console.log('Post created')
    } finally {
      setIsCreating(false)
    }
  }, [])

  const handleLike = useCallback(
    (postId: string) => {
      toggleLike(postId)
    },
    [toggleLike]
  )

  const handleComment = useCallback((postId: string) => {
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