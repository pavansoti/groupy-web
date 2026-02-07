'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Post } from '@/lib/stores/feedStore'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  isLoading?: boolean
}

export function PostCard({ post, onLike, onComment, isLoading = false }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  return (
    <Card className="overflow-hidden">
      {/* Post Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href={`/profile/${post.id}`} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center font-semibold text-sm">
            {post.authorProfilePicture ? (
              <img src={post.authorProfilePicture || "/placeholder.svg"} alt={post.authorUsername} className="h-10 w-10 rounded-full object-cover" />
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
      {post.image && (
        <div className="relative w-full bg-muted aspect-square">
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLike(post.id)}
            disabled={isLoading}
            className={post.isLiked ? 'text-destructive' : ''}
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onComment(post.id)}
            disabled={isLoading}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Likes Count */}
        <div>
          <p className="text-sm font-semibold text-foreground">{post.likesCount} likes</p>
        </div>

        {/* Caption */}
        <div>
          <p className="text-sm text-foreground">
            <Link href={`/profile/${post.authorId}`} className="font-semibold hover:underline">
              {post.authorUsername}
            </Link>{' '}
            {post.caption}
          </p>
        </div>

        {/* Comments Count */}
        <Button
          variant="link"
          className="p-0 h-auto text-xs text-muted-foreground"
          onClick={() => setShowComments(!showComments)}
        >
          View {post.commentsCount} comments
        </Button>

        {/* Comments */}
        {showComments && post.comments.length > 0 && (
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
        )}
      </div>
    </Card>
  )
}
