import { create } from 'zustand'
import { LIMIT } from '@/lib/constants'

export interface Comment {
  id: string
  authorId: string
  authorUsername: string
  authorProfilePicture?: string
  content: string
  createdAt: string
}

export interface Post {
  id: number
  authorId: string
  authorUsername: string
  authorProfilePicture?: string
  imageUrl: string
  caption: string
  // likes: any []
  likeCount: number
  commentCount: number
  createdAt: string
  likedByCurrentUser: boolean
  // comments: Comment[]
}

interface FeedState {
  posts: Post[]
  isLoading: boolean
  hasMore: boolean
  offset: number

  // Actions
  setPosts: (posts: Post[]) => void
  addPosts: (posts: Post[]) => void
  removePost: (postId: number) => void
  // updatePost: (postId: number, post: Partial<Post>) => void
  toggleLike: (postId: number) => void
  // addComment: (postId: number, comment: Comment) => void
  // removeComment: (postId: number, commentId: number) => void
  setIsLoading: (loading: boolean) => void
  setHasMore: (hasMore: boolean) => void
  incrementOffset: () => void
  resetFeed: () => void
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  offset: 0,

  setPosts: (posts) =>
    set({
      posts,
    }),

  addPosts: (posts) =>
    set((state) => {
      const existingIds = new Set(state.posts.map(p => p.id))

      const filteredPosts = posts.filter(
        post => !existingIds.has(post.id)
      )

      return {
        posts: [...state.posts, ...filteredPosts]
      }
    }),

  // updatePost: (postId, updatedPost) =>
  //   set((state) => ({
  //     posts: state.posts.map((post) =>
  //       post.id === postId ? { ...post, ...updatedPost } : post
  //     ),
  //   })),
  
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),

  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByCurrentUser: !post.likedByCurrentUser,
              likeCount: post.likedByCurrentUser ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      ),
    })),

  // addComment: (postId, comment) =>
  //   set((state) => ({
  //     posts: state.posts.map((post) =>
  //       post.id === postId
  //         ? {
  //             ...post,
  //             // comments: [...post.comments, comment],
  //             commentsCount: post.commentCount + 1,
  //           }
  //         : post
  //     ),
  //   })),

  // removeComment: (postId, commentId) =>
  //   set((state) => ({
  //     posts: state.posts.map((post) =>
  //       post.id === postId
  //         ? {
  //             ...post,
  //             // comments: post.comments.filter((c) => c.id !== commentId),
  //             commentsCount: post.commentCount - 1,
  //           }
  //         : post
  //     ),
  //   })),

  setIsLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setHasMore: (hasMore) =>
    set({
      hasMore,
    }),

  incrementOffset: () =>
    set((state) => ({
      offset: state.offset + LIMIT,
    })),

  resetFeed: () =>
    set({
      posts: [],
      offset: 0,
      hasMore: true,
    }),
}))
