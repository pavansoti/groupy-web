import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  username: string
  profilePicture?: string
  bio?: string
  // followersCount: number
  // followingCount: number
  // postsCount: number
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({
          token,
        }),

      setIsLoading: (isLoading) =>
        set({
          isLoading,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
