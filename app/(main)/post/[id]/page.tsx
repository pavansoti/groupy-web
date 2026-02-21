'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/lib/services/api'
import { getImageUrl } from '@/lib/utils'
import { format } from 'date-fns'
import { decryptId } from '@/lib/services/cryptoService'
import { PostCardSkeleton } from '@/components/skeletons'

interface Post {
  id: string
  caption: string
  imageUrl?: string
  createdAt: string
  likeCount: number
  commentCount: number
  likedByCurrentUser: boolean
  user: {
    id: string
    username: string
    imageUrl?: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params?.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  /* ---------------- FETCH POST ---------------- */

  useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      try {
        setIsLoading(true)

        const decryptedId = decryptId(decodeURIComponent(postId))

        const res = await apiService.getPostById(decryptedId)

        if (res.data?.success) {
          setPost(res.data.data)
        } else {
          toast.error('Post not found')
        }
      } catch (err) {
        toast.error('Failed to fetch post')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  /* ---------------- LIKE ---------------- */

  const handleLike = async () => {
    if (!post) return

    const previousLiked = post.likedByCurrentUser

    // Optimistic update
    setPost({
      ...post,
      likedByCurrentUser: !previousLiked,
      likeCount: previousLiked
        ? post.likeCount - 1
        : post.likeCount + 1,
    })

    try {
      setIsLikeLoading(true)

      if (previousLiked) {
        await apiService.unlikePost(post.id)
      } else {
        await apiService.likePost(post.id)
      }
    } catch (err) {
      // rollback
      setPost({
        ...post,
        likedByCurrentUser: previousLiked,
        likeCount: previousLiked
          ? post.likeCount + 1
          : post.likeCount - 1,
      })

      toast.error('Failed to update like')
    } finally {
      setIsLikeLoading(false)
    }
  }

  /* ---------------- SHARE ---------------- */

  const handleShare = async () => {
    if (!post) return

    const shareUrl = `${window.location.origin}/post/${post.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.user.username}'s post`,
          text: post.caption,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Share failed', err)
    }
  }

  /* ---------------- STATES ---------------- */

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <PostCardSkeleton />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p>Post not found.</p>
      </div>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* User Info */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => router.push(`/profile/${post.user.id}`)}
      >
        <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center font-semibold text-sm">
            {post.user.imageUrl ? (
              <img src={getImageUrl(post.user.imageUrl) || "/placeholder.svg"} alt={post.user.username} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              post.user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{post.user.username}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className="text-base">{post.caption}</p>
        {post.imageUrl && (
          <img
            src={getImageUrl(post.imageUrl)}
            alt="Post"
            className="rounded-xl w-full object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center border-t pt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          disabled={isLikeLoading}
          className={post.likedByCurrentUser ? 'text-destructive' : ''}
        >
          <Heart
            className={`h-5 w-5 ${
              post.likedByCurrentUser ? 'fill-current' : ''
            }`}
          />
        </Button>

        <span className="text-sm">{post.likeCount}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/post/${post.id}#comments`)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        <span className="text-sm">{post.commentCount}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}