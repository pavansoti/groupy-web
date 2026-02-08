import axios, { AxiosError, AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
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
          this.clearToken()
          window.location.href = '/auth/signin'
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
  async signup(email: string, username: string, password: string) {
    return this.api.post('/api/auth/signup', { email, username, password })
  }

  async signin(email: string, password: string) {
    return this.api.post('/api/auth/login', { email, password })
  }

  async refreshToken() {
    return this.api.post('/auth/refresh')
  }

  // User endpoints
  async getUser(userId: number | string) {
    return this.api.get(`/api/users/${userId}`)
  }

  async updateProfile(userId: string | number, data: any) {
    return this.api.put(`/api/users/${userId}`, data)
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
    return this.api.get('/api/users/search', { params: { query: query } })
  }

  // Follow endpoints
  async followUser(userId: string) {
    return this.api.post(`/users/${userId}/follow`)
  }

  async unfollowUser(userId: string) {
    return this.api.delete(`/users/${userId}/follow`)
  }

  async getFollowers(userId: string) {
    return this.api.get(`/users/${userId}/followers`)
  }

  async getFollowing(userId: string) {
    return this.api.get(`/users/${userId}/following`)
  }

  // Feed endpoints
  async getFeed(limit: number = 10, offset: number = 0) {
    return this.api.get('/api/posts/feed', { params: { limit, offset } })
  }

  //---------
  async createPost(data: FormData) {
    return this.api.post('/api/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
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
    return this.api.get('/conversations')
  }

  async getConversation(conversationId: string) {
    return this.api.get(`/conversations/${conversationId}`)
  }

  async createConversation(userId: string) {
    return this.api.post('/conversations', { userId })
  }
}

export const apiService = new ApiService()
