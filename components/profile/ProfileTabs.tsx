'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { Heart, Bookmark, Image as ImageIcon } from 'lucide-react'
import { Post } from '@/lib/stores/feedStore'
import { PostItem } from './PostItem'
import { apiService } from '@/lib/services/api'
import { PostGridSkeleton } from '@/components/skeletons'
import { LIMIT } from '@/lib/constants'

interface ProfileTabsProps {
  userId: string | number
  isCurrentUser: boolean
  onPostDeleted: () => void
}

type TabId = 'posts' | 'liked' | 'saved'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  show: boolean
}

export function ProfileTabs({ userId, isCurrentUser, onPostDeleted }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('posts')
  const [posts, setPosts] = useState<Post[]>([])  
  const [isLoading, setIsLoading] = useState(true)

  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const observerRef = useRef<HTMLDivElement | null>(null)
  const pageRef = useRef(0)

  const requestIdRef = useRef(0)

  const fetchData = useCallback(
    async (tab: TabId, nextPage: number, isLoadMore = false) => {
      if (!userId) return

      const currentRequestId = ++requestIdRef.current

      try {
        if (isLoadMore) {
          setIsFetchingMore(true)
        } else {
          setIsLoading(true)
        }
  
        let res = null
  
        if (tab === 'posts') {
          res = await apiService.getFeeds(userId, LIMIT, nextPage)
        } else if (tab === 'liked') {
          res = await apiService.getLikedPosts(LIMIT, nextPage)
        }
  

        // Ignore old responses
        if (currentRequestId !== requestIdRef.current) return

        if (res?.data?.success) {
          const data = res.data.data
  
          setHasMore(data.hasMore)
  
          if (isLoadMore) {
            setPosts(prev => {
              const existingIds = new Set(prev.map(p => p.id))
              const filtered = data.content.filter(
                (p: Post) => !existingIds.has(p.id)
              )
              return [...prev, ...filtered]
            })
          } else {
            setPosts(data.content)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false)
          setIsFetchingMore(false)
        }
      }
    },
    [userId]
  )

  useEffect(() => {
    // invalidate old requests
    requestIdRef.current++

    setPosts([])
    pageRef.current = 0
    setHasMore(true)
  
    fetchData(activeTab, 0, false)
  }, [activeTab, fetchData])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
  
        if (
          entry.isIntersecting &&
          !isLoading &&
          !isFetchingMore &&
          hasMore
        ) {
          const nextPage = pageRef.current + 1
          pageRef.current = nextPage
          fetchData(activeTab, nextPage, true)
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
  }, [activeTab, hasMore, isLoading, isFetchingMore, fetchData])

  // useEffect(() => {

  //   const fetchUser = async () => {
      
  //     setIsLoading(true)
  //     setPosts([])

  //     try {
        
  //       let res = null;
  //       if(activeTab === 'posts') {
  //         res = await apiService.getFeeds(initialUser.id)
  //       } else if (activeTab === 'liked') {
  //         res = await apiService.getLikedPosts(100, 0)
  //       } else {
  //         // 
  //       }

  //       if (res?.data?.success) {
  //         setPosts(res.data.data)
  //       }

  //     } catch (err) {
  //       console.error('Profile pic upload failed')
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }
  //   fetchUser()
  // }, [activeTab])

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
      <div className="sticky top-0 backdrop-blur z-10 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center">

            {visibleTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-1/3 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            {/* Sliding underline */}
            <span
              className={`
                absolute bottom-0 left-0 h-[2px] w-1/3 bg-foreground
                transition-transform duration-300 ease-in-out
              `}
              style={{
                transform: `translateX(${
                  visibleTabs.findIndex(tab => tab.id === activeTab) * 100
                }%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-1">
        {/* {activeTab === 'posts' && ( */}
          <PostsGrid
            activeTab={activeTab}
            posts={posts}
            isCurrentUserProfile={isCurrentUser}
            setPosts={setPosts}
            isLoading={isLoading}
            isFetchingMore={isFetchingMore}
            hasMore={hasMore}
            observerRef={observerRef}
            onPostDeleted={onPostDeleted}
          />
        {/* )} */}

        {/* {activeTab === 'liked' && isCurrentUser && <LikedPostsGrid isLoading={isLoading}/>}

        {activeTab === 'saved' && isCurrentUser && <SavedPostsGrid isLoading={isLoading}/>} */}
      </div>
    </div>
  )
}

function PostsGrid({
  activeTab,
  posts,
  isCurrentUserProfile,
  setPosts,
  isLoading,
  isFetchingMore,
  hasMore,
  observerRef,
  onPostDeleted
}: {
  activeTab: string
  posts: Post[]
  isCurrentUserProfile: boolean
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  isLoading: boolean
  isFetchingMore: boolean
  hasMore: boolean
  observerRef: React.RefObject<HTMLDivElement>
  onPostDeleted: () => void
}) {

  if (isLoading) {
    return <PostGridSkeleton className='py-1'/>
  }

  if (!posts || posts.length === 0) {

    const msg = {
      posts: 'No posts yet',
      liked: 'No liked posts yet',
      saved: 'No saved posts yet'
    }

    return <EmptyState message={msg[activeTab]} />
  }

  const handleDeleteFromUI = (postId: number) => {

    onPostDeleted()
    removePost(postId)
  }

  const handleUnlike = (postId: string | number) => {
    // Remove post from liked posts when unliked
    removePost(postId)
  }

  const handleUnSaved = (postId: string | number) => {
    // Remove post from saved posts when unsaved
    removePost(postId)
  }

  const removePost = (postId: string | number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className='py-1'>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {posts.map((post) => (
          <PostItem
            key={post.id}
            activeTab={activeTab}
            isCurrentUserProfile={isCurrentUserProfile}
            post={post}
            onDelete={handleDeleteFromUI}
            onUnlike={handleUnlike}
            onUnsaved={handleUnSaved}
          />
        ))}
      </div>

      {hasMore && (
        <div
          ref={observerRef}
        >
          {isFetchingMore && <PostGridSkeleton length={3} className="py-2" />}
        </div>
      )}
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
