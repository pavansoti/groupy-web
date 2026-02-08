import { Heart, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { apiService } from '@/lib/services/api'
import { Post } from '@/lib/stores/feedStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface PostItemProps {
  post: Post
  isCurrentUserProfile: boolean
  onDelete: (postId: number) => void
}

export function PostItem({ post, isCurrentUserProfile, onDelete }: PostItemProps) {
  const imageSrc = getImageUrl(post.imageUrl)

  const [liked, setLiked] = useState(post.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(post.likes?.length ?? 0)

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Delete this post?')) return

    try {
    //   await apiService.deletePost(post.id)
    //   onDelete(post.id);
    } catch {
      alert('Failed to delete post')
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
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  )
}


const getImageUrl = (url?: string | null) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${API_URL}${url}`
}