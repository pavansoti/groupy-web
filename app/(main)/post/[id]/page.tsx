'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/lib/services/api'
import { getImageUrl } from '@/lib/utils'
import { format } from 'date-fns'
import { decryptId, encryptId } from '@/lib/services/cryptoService'
import { PostCardSkeleton } from '@/components/skeletons'
import { useAuth } from '@/lib/hooks/useAuth'
import { Textarea } from '@/components/ui/textarea'
import { COMMENTS_PAGE_SIZE } from '@/lib/constants'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import type { Comment } from '@/lib/stores/feedStore'

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
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsPage, setCommentsPage] = useState(0)
  const [totalComments, setTotalComments] = useState<number | null>(null)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentMessage, setEditingCommentMessage] = useState('')
  const [isUpdatingComment, setIsUpdatingComment] = useState(false)
  const { user } = useAuth()

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

  /* ---------------- COMMENTS ---------------- */

  const loadComments = useCallback(
    async (currentPostId: string, page: number = 0, append: boolean = false) => {
      const isLoadMore = append && page > 0
      try {
        if (isLoadMore) {
          setIsLoadingMoreComments(true)
        } else {
          setIsCommentsLoading(true)
        }

        const res = await apiService.getComments(
          currentPostId,
          page,
          COMMENTS_PAGE_SIZE
        )

        if (res.data?.success) {
          const data = res.data.data
          let commentsList: Comment[] = []

          if (data?.content && Array.isArray(data.content)) {
            commentsList = data.content
          }

          const hasMore = data?.hasMore ?? commentsList.length >= COMMENTS_PAGE_SIZE

          if (append) {
            setComments((prev) => [...prev, ...commentsList])
          } else {
            setComments(commentsList)
          }
          setTotalComments(data.totalCount)
          setCommentsPage(page)
          setHasMoreComments(hasMore)
        } else {
          if (!append) toast.error('Failed to load comments')
        }
      } catch {
        if (!append) toast.error('Failed to load comments')
      } finally {
        if (isLoadMore) {
          setIsLoadingMoreComments(false)
        } else {
          setIsCommentsLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!post?.id) return
    setComments([])
    setCommentsPage(0)
    setHasMoreComments(true)
    loadComments(post.id, 0)
  }, [post?.id, loadComments])

  const handleAddComment = async () => {
    if (!post) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    const trimmed = newComment.trim()
    if (!trimmed) return

    try {
      setIsSubmittingComment(true)

      const res = await apiService.createComment(post.id, trimmed)

      if (res.data?.success) {
        setNewComment('')
        await loadComments(post.id, 0)
      } else {
        toast.error('Failed to add comment')
      }
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return

    try {
      const res = await apiService.deleteComment(commentId)

      if (res.data?.success) {
        await loadComments(post.id, 0)
      } else {
        toast.error('Failed to delete comment')
      }
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(String(comment.id))
    setEditingCommentMessage(comment.message ?? '')
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentMessage('')
  }

  const handleUpdateComment = async () => {
    if (!editingCommentId) return

    const trimmed = editingCommentMessage.trim()
    if (!trimmed) return

    try {
      setIsUpdatingComment(true)

      const res = await apiService.updateComment(editingCommentId, trimmed)

      if (res.data?.success) {
        setComments((prev) =>
          prev.map((comment) =>
            String(comment.id) === editingCommentId
              ? { ...comment, message: trimmed }
              : comment
          )
        )
        setEditingCommentId(null)
        setEditingCommentMessage('')
      } else {
        toast.error('Failed to update comment')
      }
    } catch {
      toast.error('Failed to update comment')
    } finally {
      setIsUpdatingComment(false)
    }
  }

  const handleLoadMoreComments = () => {
    if (!post?.id || !hasMoreComments || isLoadingMoreComments) return
    loadComments(post.id, commentsPage + 1, true)
  }

  /* ---------------- LIKE ---------------- */

  const handleLike = async () => {
    if (!post) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

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

    const encryptedPostId = encryptId(post.id.toString())

    if (!encryptedPostId) return

    const shareUrl = `${window.location.origin}/post/${encodeURIComponent(encryptedPostId)}`

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
            className="rounded-xl w-full max-h-[400px] object-contain"
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
          onClick={() => {
            const el = document.getElementById('comments')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        <span className="text-sm">{totalComments}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Comments */}
      <div id="comments" className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-foreground text-sm">
          Comments ({totalComments})
        </h3>

        {isCommentsLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/50 flex items-center justify-center text-xs font-semibold">
                  {comment.imageUrl ? (
                    <img
                      src={getImageUrl(comment.imageUrl) || "/placeholder.svg"}
                      alt={comment.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    comment.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {comment.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>

                    {user && comment.userId == user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEditComment(comment)}>
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteComment(String(comment.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingCommentId === String(comment.id) ? (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        value={editingCommentMessage}
                        onChange={(e) => setEditingCommentMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEditComment}
                          disabled={isUpdatingComment}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUpdateComment}
                          disabled={isUpdatingComment || !editingCommentMessage.trim()}
                        >
                          {isUpdatingComment ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-line">
                      {comment.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isCommentsLoading && hasMoreComments && comments.length > 0 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMoreComments}
              disabled={isLoadingMoreComments}
            >
              {isLoadingMoreComments ? 'Loading...' : 'Load more comments'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? 'Add a comment...' : 'Sign in to add a comment'}
            disabled={isSubmittingComment || !user}
            className="resize-none"
            rows={2}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={
                isSubmittingComment ||
                !user ||
                !newComment.trim()
              }
            >
              {isSubmittingComment ? 'Posting...' : 'Post comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}