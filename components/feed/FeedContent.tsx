'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
import { encryptId } from '@/lib/services/cryptoService'

export function FeedContent({ feedsType = "all" }) {
  const {
    posts,
    isLoading,
    hasMore,
    scrollPosition,
    setIsLoading,
    setScrollPosition,
    setPosts,
    addPosts,
    removePost,
    toggleLike,
    setHasMore
  } = useFeedStore()
  const router = useRouter()
  const pageRef = useRef(0)
  const observerRef = useRef<HTMLDivElement | null>(null)
  const fetchingRef = useRef(false)

  const [isCreating, setIsCreating] = useState(false)

  const restoreScrollRef = useRef<number | null>(null)
  const scrollRestoredRef = useRef(false)

  // ---------------- FETCH POSTS ----------------

  const fetchPosts = useCallback(async (page: number, loadMore = false) => {

    if (fetchingRef.current) return
    fetchingRef.current = true

    try {

      setIsLoading(true)

      const res = await apiService.getFeedFollowing(
        feedsType === "liked",
        page,
        LIMIT
      )

      if (res.data?.success) {

        const data = res.data.data

        setHasMore(data.hasMore)

        if (loadMore) {
          addPosts(data.content)
        } else {
          setPosts(data.content)
        }

      } else {
        toast.error("Failed to fetch posts")
      }

    } catch (err) {
      console.error("Feed error:", err)
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }

  }, [feedsType])

  useEffect(() => {

    if (scrollRestoredRef.current) return
    if (posts.length === 0) return
    if (scrollPosition === 0) return

    const restoreScroll = () => {

      if (document.body.scrollHeight >= scrollPosition) {

        window.scrollTo({
          top: scrollPosition,
          behavior: "auto"
        })

        scrollRestoredRef.current = true

      } else {
        setTimeout(restoreScroll, 50)
      }

    }

    restoreScroll()

  }, [posts, scrollPosition])

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {

    // only fetch if store empty
    if (posts.length === 0) {
      fetchPosts(pageRef.current, false)
    }

  }, [])

  // ---------------- RESTORE SCROLL ----------------

  useEffect(() => {

    if (restoreScrollRef.current !== null && posts.length > 0) {

      requestAnimationFrame(() => {
        window.scrollTo(0, restoreScrollRef.current!)
      })

      restoreScrollRef.current = null
    }

  }, [posts])

  // ---------------- INFINITE SCROLL ----------------

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
        rootMargin: "100px",
        threshold: 0
      }
    )

    const el = observerRef.current

    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
      observer.disconnect()
    }

  }, [hasMore, isLoading])

  // ---------------- CREATE POST ----------------

  const handleCreatePost = useCallback(async (formData: FormData) => {
    try {
      setIsCreating(true)

      const res = await apiService.createPost(formData)

      if (!res.data.success) {
        toast.error("Failed to create post")
        return false
      }

      toast.success("Post created")

      fetchPosts(0, false)

      return true

    } catch {
      toast.error("Something went wrong")
      return false
    } finally {
      setIsCreating(false)
    }

  }, [])

  // ---------------- LIKE ----------------

  const handleLike = useCallback(async (postId: number, liked: boolean) => {

    const action = liked ? "unlikePost" : "likePost"

    await apiService[action](postId)

    if (feedsType === "liked") {
      removePost(postId)
    } else {
      toggleLike(postId)
    }

  }, [feedsType])

  // ---------------- COMMENT NAVIGATION ----------------

  const handleComment = useCallback((postId: number) => {
    const encryptedPostId = encryptId(postId.toString())

    if (!encryptedPostId) return

    const state = {
      scrollY: window.scrollY,
      page: pageRef.current
    }

    setScrollPosition(window.scrollY)

    router.push(`/post/${encodeURIComponent(encryptedPostId)}#comments`)

  }, [])

  // ---------------- UI ----------------

  return (

    <div className={
      feedsType === "all"
        ? "space-y-6 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8"
        : "space-y-6 max-w-2xl mx-auto"
    }>

      {feedsType === "all" && (
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
              <p className="text-muted-foreground mb-4">
                You haven't liked any posts yet
              </p>
              <p className="text-sm text-muted-foreground">
                Start liking posts from the feed
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
          {posts.map(post => (

            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              isLoading={isLoading}
            />
          ))}

          {hasMore && (
            <div ref={observerRef}>
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
