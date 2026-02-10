import { create } from 'zustand'

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
  updatePost: (postId: number, post: Partial<Post>) => void
  toggleLike: (postId: number) => void
  addComment: (postId: number, comment: Comment) => void
  removeComment: (postId: number, commentId: number) => void
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
    set((state) => ({
      posts: [...state.posts, ...posts],
    })),

  updatePost: (postId, updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updatedPost } : post
      ),
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

  addComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              // comments: [...post.comments, comment],
              commentsCount: post.commentCount + 1,
            }
          : post
      ),
    })),

  removeComment: (postId, commentId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              // comments: post.comments.filter((c) => c.id !== commentId),
              commentsCount: post.commentCount - 1,
            }
          : post
      ),
    })),

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
      offset: state.offset + 10,
    })),

  resetFeed: () =>
    set({
      posts: [],
      offset: 0,
      hasMore: true,
    }),
}))
