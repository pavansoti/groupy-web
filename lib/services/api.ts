import axios, { AxiosError, AxiosInstance } from 'axios'
import { LIMIT } from '@/lib/constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // if (typeof document !== 'undefined') {
          //   document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          // }
          this.clearToken()

          if (typeof window !== 'undefined') {
            const pathname = window.location.pathname
            if (pathname !== '/auth/signin') {
              window.history.replaceState(null, '', '/auth/signin')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }
          }
          
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(TOKEN_KEY)
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(TOKEN_KEY)
  }

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token)
  }

  setUser(user: any): void {
    sessionStorage.setItem('user', JSON.stringify(user))
  }


  // Auth endpoints
  async signup(data: any) {
    return this.api.post('/api/auth/signup', data)
  }

  async signin(email: string, password: string) {
    return this.api.post('/api/auth/login', { email, password })
  }

  async changePassword(data: any) {
    return this.api.post('/api/auth/change-password', data)
  }

  async forgotPassword(email: string) {
    return this.api.get('/api/auth/forgot-password?email=' + email)
  }

  /**
   * Reset password endpoint
   * @param data - Can be either:
   *   - { token } - Validates if the reset token is valid
   *   - { token, password } - Performs the password reset with the new password
   */
  async resetPassword(data: any) {
    return this.api.post('/api/auth/reset-password', data)
  }

  async refreshToken() {
    return this.api.post('/auth/refresh')
  }

  // User endpoints
  async getUser(userId: number | string) {
    return this.api.get(`/api/users/${userId}`)
  }

  async updateUserData(userId: string | number, data: any) {
    return this.api.put(`/api/users/${userId}`, data)
  }

  async updateUserBio(userId: string | number, data: any) {
    return this.api.patch(`/api/users/${userId}`, data)
  }

  // Profile
  async updateProfileImage(userId: string | number, file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.api.put(`/api/users/${userId}/profile-pic`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async searchUsers(query: string) {
    return this.api.get('/api/users/search', { params: { q: query } })
  }

  // Follow endpoints
  /**
   * Follow a user
   * @param targetUserId - The ID of the user to follow
   * 
   * Implementation note:
   * - The current/source user (who is following) is determined from the JWT auth token
   * - The target user (who is being followed) is passed as the URL parameter
   * 
   * Example: If user A wants to follow user B:
   * - Auth token contains user A's ID
   * - targetUserId parameter is user B's ID
   * - Endpoint: POST /api/users/{B}/follow
   */
  async followUser(targetUserId: string) {
    return this.api.post(`/api/users/${targetUserId}/follow`)
  }

  /**
   * Unfollow a user
   * @param targetUserId - The ID of the user to unfollow
   * 
   * Implementation note:
   * - The current/source user (who is unfollowing) is determined from the JWT auth token
   * - The target user (who is being unfollowed) is passed as the URL parameter
   */
  async unfollowUser(targetUserId: string) {
    return this.api.delete(`/api/users/${targetUserId}/unfollow`)
  }

  /**
   * Get followers of a user
   * @param userId - The user whose followers to fetch
   */
  async getFollowers(userId: string) {
    return this.api.get(`/api/users/${userId}/followers`)
  }

  /**
   * Get users that a user is following
   * @param userId - The user whose following list to fetch
   */
  async getFollowing(userId: string) {
    return this.api.get(`/api/users/${userId}/following`)
  }

  // Feed endpoints
  async getFeedFollowing(onlyLiked: boolean = false, page: number = 0,  limit: number = LIMIT) {
    return this.api.get('/api/posts/feed/following', { params: { onlyLiked, limit, page } })
  }

  async getFeeds(userId: string | number, limit: number = LIMIT, page: number = 0) {
    return this.api.get(`/api/posts/feeds/${userId}`, { params: { limit, page } })
  }

  async getLikedPosts(limit: number = LIMIT, page: number = 0) {
    return this.api.get('/api/posts/feeds/liked', { params: { limit, page } })
  }

  //---------
  async createPost(data: FormData) {
    return this.api.post('/api/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  async deletePost(postId: string | number) {
    return this.api.delete(`/api/posts/${postId}`)
  }

  async getPost(postId: string) {
    return this.api.get(`/posts/${postId}`)
  }

  // Like endpoints
  async likePost(postId: string | number) {
    return this.api.post(`/api/posts/${postId}/like`)
  }

  async unlikePost(postId: string | number) {
    return this.api.delete(`/api/posts/${postId}/like`)
  }

  // Comment endpoints
  async createComment(postId: string, content: string) {
    return this.api.post(`/posts/${postId}/comments`, { content })
  }

  async deleteComment(commentId: string) {
    return this.api.delete(`/comments/${commentId}`)
  }

  // Chat endpoints
  async getConversations() {
    return this.api.get('/api/conversations')
  }

  async getConversation(conversationId: string) {
    return this.api.get(`/conversations/${conversationId}`)
  }

  async createConversation(userId: string) {
    return this.api.post(`api/conversations/${userId}`, { userId })
  }
}

export const apiService = new ApiService()
