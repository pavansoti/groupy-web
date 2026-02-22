"use client"

import { Heart, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/services/api"
import { Post } from "@/lib/stores/feedStore"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"
import { encryptId } from "@/lib/services/cryptoService"

interface PostItemProps {
  activeTab: string
  post: Post
  isCurrentUserProfile: boolean
  onDelete: (postId: string | number) => void
  onUnlike?: (postId: string | number) => void
  onUnsaved?: (postId: string | number) => void  
}

export function PostItem({
  activeTab,
  post,
  isCurrentUserProfile,
  onDelete,
  onUnlike,
  onUnsaved,
}: PostItemProps) {
  const router = useRouter()
  const imageSrc = getImageUrl(post.imageUrl)

  const [liked, setLiked] = useState(post.likedByCurrentUser ?? false)
  const [likesCount, setLikesCount] = useState(post.likeCount ?? 0)

  /* ---------------- NAVIGATE ---------------- */

  const handleNavigate = () => {

    const encryptedPostId = encryptId(post.id.toString())

    if (!encryptedPostId) return

    router.push(`/post/${encodeURIComponent(encryptedPostId)}`)
  }

  /* ---------------- LIKE ---------------- */

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const wasLiked = liked

    // optimistic update
    setLiked(!liked)
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    try {
      if (!wasLiked) {
        await apiService.likePost(post.id)
      } else {
        await apiService.unlikePost(post.id)
        // Call onUnlike callback if provided (for removing from liked posts grid)
        if (activeTab === 'liked') {
          onUnlike(post.id)
        } else if (activeTab === 'saved') {
          onUnsaved(post.id)
        }
      }
    } catch {
      // rollback
      setLiked(wasLiked)
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1))
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
    <div
      onClick={handleNavigate}
      className="relative aspect-square overflow-hidden bg-muted group cursor-pointer"
    >
      <img
        src={imageSrc}
        alt={post.caption}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Overlay */}
      <div
        className="
          absolute inset-0 bg-black/40
          opacity-100 md:opacity-0
          md:group-hover:opacity-100
          transition-opacity
        "
      >
        {/* LIKE */}
        <button
          onClick={handleLike}
          className="
            absolute bottom-2 left-2
            flex items-center gap-1
            text-white bg-black/60
            px-2 py-1 rounded-full

            md:bg-transparent
            md:px-0 md:py-0
            md:rounded-none
            md:flex md:items-center md:justify-center
            md:gap-2
          "
        >
          <Heart
            className={`
              h-4 w-4
              sm:h-5 sm:w-5
              md:h-6 md:w-6
              transition-transform
              ${liked ? "fill-red-500 text-red-500 scale-110" : "text-white"}
            `}
          />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        {/* DELETE */}
        {isCurrentUserProfile && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500" />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent
              className="max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
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
