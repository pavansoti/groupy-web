/*import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
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

  sendMessage(conversationId: string, content: string, type: 'text' | 'file' | 'audio' = 'text'): void {
    console.log('Sending message:', { conversationId, content, type })
    this.emit('send_message', { conversationId, content, type })
  }

  setTyping(conversationId: string, isTyping: boolean): void {
    this.emit('typing', { conversationId, isTyping })
  }

  markAsRead(conversationId: string): void {
    this.emit('mark_as_read', { conversationId })
  }

  sendTypingIndicator(conversationId: string): void {
    this.emit('user_typing', { conversationId })
  }
}

export const socketService = new SocketService()
*/
'use client'

import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'

const TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'

class SocketService {
  private stompClient: Client | null = null
  private connected = false
  private subscriptions: Map<string, any> = new Map()

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve()
        return
      }
      const authToken =
        token ||
        (typeof window !== 'undefined'
          ? sessionStorage.getItem(TOKEN_KEY)
          : null)

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        // debug: (str) => console.log('[STOMP]', str),
        connectHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      this.stompClient.onConnect = () => {
        console.log('[Socket] Connected')
        this.connected = true
        resolve()
      }

      this.stompClient.onStompError = (frame) => {
        console.error('[Socket] STOMP error:', frame)
        reject(frame)
      }

      this.stompClient.onWebSocketClose = () => {
        console.log('[Socket] Disconnected')
        this.connected = false
      }

      this.stompClient.activate()
    })
  }

  disconnect() {

    // Unsubscribe from all topics
    this.subscriptions.forEach((sub) => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe()
      }
    })

    this.subscriptions.clear()

    if (this.stompClient) {
      this.stompClient.deactivate()
      this.connected = false
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  private connectionListeners: (() => void)[] = []

  onConnect(callback: () => void) {
    this.connectionListeners.push(callback)
  }

  private notifyConnected() {
    this.connectionListeners.forEach(cb => cb())
  }

  // Subscribe to topic
  subscribe(destination: string, callback: (data: any) => void) {
    if (!this.stompClient || !this.connected) {
      console.warn('[Socket] Cannot subscribe - not connected')
      return null
    }

    console.log('[Socket] Subscribing to:', destination)
    // Check if already subscribed
    if (this.subscriptions.has(destination)) {
      console.log('[Socket] Already subscribed to:', destination)
      return this.subscriptions.get(destination)
    }

    const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
      try {
        console.log('[Socket] Received message:', message)
        callback(JSON.parse(message.body))
      } catch (error) {
        console.error('[Socket] Error parsing message:', error)
      }
    })

    // Store subscription for cleanup
    this.subscriptions.set(destination, subscription)
    return subscription
  }

  // Unsubscribe from a specific topic
  unsubscribe(destination: string) {
    const subscription = this.subscriptions.get(destination)
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
      console.log('[Socket] Unsubscribed from:', destination)
    }
  }

  // Send message to backend
  send(destination: string, body: any) {
    if (!this.stompClient || !this.connected) return

    console.log('[Socket] Sending message:', { destination, body })
    this.stompClient.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  // ===============================
  // Chat-specific helpers
  // ===============================

  joinConversation(conversationId: string) {
    console.log('joinConversation', { conversationId })
    this.send('/app/chat.join', { conversationId })
  }

  sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'file' | 'audio' = 'text'
  ) {
    console.log('sendMessage', { conversationId, content, type })
    this.send('/app/chat.send', {
      conversationId,
      content,
      type,
    })
  }

  setTyping(conversationId: string, isTyping: boolean) {
    console.log('setTyping', { conversationId, isTyping })
    this.send('/app/chat.typing', {
      conversationId,
      typing: isTyping,
    })
  }

  markAsRead(conversationId: string) {
    console.log('markAsRead', { conversationId })
    this.send('/app/chat.read', {
      conversationId,
    })
  }

  // ===============================
  // Subscription helpers
  // ===============================

  subscribeToUserMessages(callback: (data: any) => void) {
    return this.subscribe('/user/queue/conversation-history', callback)
  }

  subscribeToConversationMessages(conversationId: string, callback: (data: any) => void) {
    return this.subscribe(`/topic/conversation/${conversationId}`, callback)
  }

  subscribeToConversationTyping(conversationId: string, callback: (data: any) => void) {
    return this.subscribe(`/topic/conversation/${conversationId}/typing`, callback)
  }

  subscribeToConversationRead(conversationId: string, callback: (data: any) => void) {
    return this.subscribe(`/topic/conversation/${conversationId}/read`, callback)
  }

  // subscribeToUserMessages(){

  //   if(!this.stompClient) return;

  //   this.stompClient.subscribe(
  //     "/user/queue/conversation-history",
  //     (message) => {
  //       const data = JSON.parse(message.body);
  //       console.log(data);
        
  //       // if (data.type === "HISTORY") {
  //       //   setMessages(data.messages);
  //       // }
  //     }
  //   );
  // }

  unSubscribeToUserMessages() {
    this.unsubscribe('/user/queue/conversation-history')
  }

  unsubscribeFromConversation(conversationId: string) {
    this.unsubscribe(`/topic/conversation/${conversationId}`)
    this.unsubscribe(`/topic/conversation/${conversationId}/typing`)
    this.unsubscribe(`/topic/conversation/${conversationId}/read`)
  }
}

export const socketService = new SocketService()