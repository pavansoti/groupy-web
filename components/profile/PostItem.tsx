"use client"

import { Heart, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { apiService } from '@/lib/services/api'
import { Post } from '@/lib/stores/feedStore'
import { getImageUrl } from '@/lib/utils'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface PostItemProps {
  post: Post
  isCurrentUserProfile: boolean
  onDelete: (postId: string | number) => void
}

export function PostItem({ post, isCurrentUserProfile, onDelete }: PostItemProps) {
  const imageSrc = getImageUrl(post.imageUrl)

  const [liked, setLiked] = useState(post.likedByCurrentUser ?? false)
  const [likesCount, setLikesCount] = useState(post.likeCount ?? 0)

  /* ---------------- LIKE ---------------- */

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

    // optimistic update
    setLiked((prev) => !prev)
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1))

    try {
      if (!liked) {
        await apiService.likePost(post.id)
      } else {
        await apiService.unlikePost(post.id)
      }
    } catch {
      // rollback on error
      setLiked((prev) => !prev)
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1))
    }
  }

  /* ---------------- DELETE ---------------- */

  const handleDeletePost = async (postId: string | number) => {

    try {
      const res = await apiService.deletePost(postId)
      if(res.data?.success){ 
        onDelete(post.id);
        toast('Post deleted')
      } else {
        toast('Failed to delete post')
      }
    } catch {
      toast('Failed to delete post')
    }
  }

  return (
    <div className="relative aspect-square overflow-hidden bg-muted group">
      <img
        src={imageSrc}
        alt={post.caption}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">

        {/* LIKE */}
        <button
          onClick={handleLike}
          className="absolute inset-0 flex items-center justify-center gap-2 text-white"
        >
          <Heart
            className={`h-6 w-6 ${
              liked ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        {/* DELETE (self profile only) */}
        {isCurrentUserProfile && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </AlertDialogTrigger>
          
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your post will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
          
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
          
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}