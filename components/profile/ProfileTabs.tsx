'use client'

import { useEffect, useState } from 'react'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { Heart, Bookmark, Image as ImageIcon } from 'lucide-react'
import { Post } from '@/lib/stores/feedStore'
import { PostItem } from './PostItem'
import { apiService } from '@/lib/services/api'
import { PostGridSkeleton } from '@/components/skeletons'

interface ProfileTabsProps {
  user: User
  isCurrentUser: boolean
}

type TabId = 'posts' | 'liked' | 'saved'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  show: boolean
}

export function ProfileTabs({ user: initialUser, isCurrentUser }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('posts')
  // const [user, setUser] = useState<User>(initialUser)
  const [posts, setPosts] = useState<Post[]>([])  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {

    const fetchUser = async () => {
      
      setIsLoading(true)
      setPosts([])

      try {
        const res = await apiService.getFeeds(initialUser.id)

        if (res.data?.success) {
          setPosts(res.data.data)
        }
      } catch (err) {
        console.error('Profile pic upload failed')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [activeTab])

  const tabs: Tab[] = [
    {
      id: 'posts',
      label: 'Posts',
      icon: <ImageIcon className="h-4 w-4" />,
      show: true,
    },
    {
      id: 'liked',
      label: 'Liked',
      icon: <Heart className="h-4 w-4" />,
      show: isCurrentUser,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <Bookmark className="h-4 w-4" />,
      show: isCurrentUser,
    },
  ]

  const visibleTabs = tabs.filter((tab) => tab.show)

  return (
    <div className="w-full border-t border-border">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {activeTab === 'posts' && (
          <PostsGrid
            posts={posts}
            isCurrentUserProfile={isCurrentUser}
            setPosts={setPosts}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'liked' && isCurrentUser && <LikedPostsGrid isLoading={isLoading}/>}

        {activeTab === 'saved' && isCurrentUser && <SavedPostsGrid isLoading={isLoading}/>}
      </div>
    </div>
  )
}

function PostsGrid({
  posts,
  isCurrentUserProfile,
  setPosts,
  isLoading,
}: {
  posts: Post[]
  isCurrentUserProfile: boolean
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  isLoading: boolean
}) {

  if (isLoading) {
    return <PostGridSkeleton />
  }

  if (!posts || posts.length === 0) {
    return <EmptyState message="No posts yet" />
  }

  const handleDeleteFromUI = (postId: number) => {
    console.log('Deleting post with ID:', postId)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          isCurrentUserProfile={isCurrentUserProfile}
          onDelete={handleDeleteFromUI}
        />
      ))}
    </div>
  )
}

function LikedPostsGrid({ isLoading }: { isLoading: boolean }){
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [gridLoading, setGridLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLikedPosts = async () => {
      setGridLoading(true)
      setError(null)
      
      try {
        const res = await apiService.getLikedPosts(100, 0)
        
        if (res.data?.success && res.data?.data) {
          setLikedPosts(res.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch liked posts:', err)
        setError('Failed to load liked posts')
      } finally {
        setGridLoading(false)
      }
    }

    fetchLikedPosts()
  }, [])

  if (isLoading || gridLoading) {
    return <PostGridSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (likedPosts.length === 0) {
    return <EmptyState message="No liked posts" />
  }

  const handleUnlike = (postId: string | number) => {
    // Remove post from liked posts when unliked
    setLikedPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {likedPosts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          isCurrentUserProfile={false}
          onDelete={() => {
            // Remove post from liked posts if deleted
            setLikedPosts((prev) => prev.filter((p) => p.id !== post.id))
          }}
          onUnlike={handleUnlike}
        />
      ))}
    </div>
  )
}

function SavedPostsGrid({ isLoading }: { isLoading: boolean }) {

  if (isLoading) {
    return <PostGridSkeleton />
  }

  const hasNoSavedPosts = true // TODO: Replace with actual data check

  if (hasNoSavedPosts) {
    return <EmptyState message="No saved posts" />
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {/* TODO: Fetch and display saved posts */}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
