import { create } from 'zustand'

export interface UserProfile {
  id: string
  username: string
  email: string
  bio: string | null
  role: string
  profilePicture?: string
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean
}

interface UserState {
  users: Map<string, UserProfile>
  currentUserProfile: UserProfile | null
  isLoading: boolean

  // Actions
  setUser: (userId: string, user: UserProfile) => void
  getUser: (userId: string) => UserProfile | undefined
  updateUser: (userId: string, user: Partial<UserProfile>) => void
  setCurrentUserProfile: (user: UserProfile | null) => void
  toggleFollow: (userId: string) => void
  setIsLoading: (loading: boolean) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  users: new Map(),
  currentUserProfile: null,
  isLoading: false,

  setUser: (userId, user) =>
    set((state) => {
      const newUsers = new Map(state.users)
      newUsers.set(userId, user)
      return { users: newUsers }
    }),

  getUser: (userId) => {
    const state = get()
    return state.users.get(userId)
  },

  updateUser: (userId, partialUser) =>
    set((state) => {
      const existingUser = state.users.get(userId)
      if (!existingUser) return state
      const newUsers = new Map(state.users)
      newUsers.set(userId, { ...existingUser, ...partialUser })
      return { users: newUsers }
    }),

  setCurrentUserProfile: (user) =>
    set({
      currentUserProfile: user,
    }),

  toggleFollow: (userId) =>
    set((state) => {
      const existingUser = state.users.get(userId)
      if (!existingUser) return state
      const newUsers = new Map(state.users)
      newUsers.set(userId, {
        ...existingUser,
        isFollowing: !existingUser.isFollowing,
        followersCount: existingUser.isFollowing
          ? existingUser.followersCount - 1
          : existingUser.followersCount + 1,
      })
      return { users: newUsers }
    }),

  setIsLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}))
