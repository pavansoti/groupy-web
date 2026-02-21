'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Post } from '@/lib/stores/feedStore'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getImageUrl } from '@/lib/utils'
import { get } from 'http'
import { toast } from 'sonner'
import { encryptId } from '@/lib/services/cryptoService'

interface PostCardProps {
  post: Post
  onLike: (postId: number, likedByCurrentUser: boolean) => void
  onComment: (postId: number) => void
  isLoading?: boolean
}

export function PostCard({ post, onLike, onComment, isLoading = false }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  const hasImage = !!post.imageUrl

  const handleShare = async (postId: string | number) => {
    const encryptedPostId = encryptId(postId.toString())

    if (!encryptedPostId) return

    const shareUrl = `${window.location.origin}/post/${encodeURIComponent(encryptedPostId)}`
  
    try {
      // Native share (mobile browsers)
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post!',
          url: shareUrl,
        })
      } else {
        // Fallback → copy link
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  return (
    <Card className="overflow-hidden py-0 gap-0">
      {/* Post Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href={`/profile/${post.authorId}`} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center font-semibold text-sm">
            {post.authorProfilePicture ? (
              <img src={getImageUrl(post.authorProfilePicture) || "/placeholder.svg"} alt={post.authorUsername} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              post.authorUsername.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{post.authorUsername}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
          </div>
        </Link>
      </div>

      {/* Post Image */}
      {hasImage && (
        <div className="relative w-full h-[340px] bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={getImageUrl(post.imageUrl) || "/placeholder.svg"}
            alt={post.caption}
            className="h-full w-auto object-contain"
          />
        </div>
      )}

      {/* Caption (no image → show above actions) */}
      {!hasImage && (
        <div className="px-4 pt-3">
          <p className="text-sm text-foreground">
            <Link
              href={`/profile/${post.authorId}`}
              className="font-semibold hover:underline"
            >
              {post.authorUsername}
            </Link>{' '}
            {post.caption}
          </p>
        </div>
      )}

      {/* Post Actions */}
      <div className="py-4 px-2 space-y-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLike(post.id, post.likedByCurrentUser)}
            disabled={isLoading}
            className={post.likedByCurrentUser ? 'text-destructive' : ''}
          >
            <Heart className={`h-5 w-5 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onComment(post.id)}
            disabled={isLoading}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={() => handleShare(post.id)}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Likes Count */}
        <div>
          <p className="px-2 text-sm font-semibold text-foreground">{post.likeCount} likes</p>
        </div>

        {/* Caption (image → show below actions) */}
        {hasImage && (
          <div>
            <p className="px-2 text-sm text-foreground">
              <Link
                href={`/profile/${post.authorId}`}
                className="font-semibold hover:underline"
              >
                {post.authorUsername}
              </Link>{' '}
              {post.caption}
            </p>
          </div>
        )}

        {/* Comments Count */}
        {post.commentCount > 0 && (
          <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground">
            View {post.commentCount} comments
          </Button>
        )}

        {/* Comments */}
        {/* {showComments && post.comments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            {post.comments.slice(-3).map((comment) => {
              try {
                return (
                  <div key={comment.id}>
                    <p className="text-xs">
                      <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline">
                        {comment.authorUsername}
                      </Link>{' '}
                      {comment.content}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'MMM d')}</p>
                  </div>
                )
              } catch {
                return null
              }
            })}
          </div>
        )} */}
      </div>
    </Card>
  )
}
