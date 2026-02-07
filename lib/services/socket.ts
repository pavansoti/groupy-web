import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const authToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null)

        this.socket = io(WS_URL, {
          auth: {
            token: authToken,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })

        this.socket.on('connect', () => {
          console.log('[Socket] Connected to server')
          resolve()
        })

        this.socket.on('connect_error', (error) => {
          console.error('[Socket] Connection error:', error)
          reject(error)
        })

        this.socket.on('disconnect', () => {
          console.log('[Socket] Disconnected from server')
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
    if (this.socket) {
      this.socket.off(event, callback as any)
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Chat-specific events
  joinConversation(conversationId: string): void {
    this.emit('join_conversation', { conversationId })
  }

  leaveConversation(conversationId: string): void {
    this.emit('leave_conversation', { conversationId })
  }

  sendMessage(conversationId: string, content: string): void {
    this.emit('send_message', { conversationId, content })
  }

  setTyping(conversationId: string, isTyping: boolean): void {
    this.emit('typing', { conversationId, isTyping })
  }

  markAsRead(conversationId: string): void {
    this.emit('mark_as_read', { conversationId })
  }
}

export const socketService = new SocketService()
