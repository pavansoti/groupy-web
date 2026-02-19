'use client'

import SockJS from 'sockjs-client'
import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import { useChatStore } from '../stores/chatStore'
import { useSocketStore } from '../stores/socketStore'
import { MessageType } from '../schemas/chat'

const WS_URL =
  (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080') + '/ws'

const TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'auth_token'

class SocketService {
  private stompClient: Client | null = null
  private connected = false

  // ===============================
  // CONNECT
  // ===============================

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
        connectHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      this.stompClient.onConnect = () => {
        console.log('[Socket] Connected')
        this.connected = true
        useSocketStore.getState().setConnected(true)
        this.subscribeToPresence()
        resolve()
      }

      this.stompClient.onStompError = (frame) => {
        console.error('[Socket] STOMP error:', frame)
        reject(frame)
      }

      this.stompClient.onWebSocketClose = () => {
        console.log('[Socket] Disconnected')
        useSocketStore.getState().setConnected(false)
        this.connected = false
      }

      this.stompClient.activate()
    })
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.stompClient = null
      this.connected = false
      console.log('[Socket] Disconnected manually')
    }
  }

  // isConnected(): boolean {
  //   return this.connected
  // }

  // ===============================
  // SUBSCRIBE (NO CACHING)
  // ===============================

  subscribe(
    destination: string,
    callback: (data: any) => void
  ): StompSubscription | null {
    if (!this.stompClient || !this.connected) {
      console.warn('[Socket] Cannot subscribe - not connected')
      return null
    }

    console.log('[Socket] Subscribing to:', destination)

    const subscription = this.stompClient.subscribe(
      destination,
      (message: IMessage) => {
        try {
          console.log('[Socket] Received from:', destination)
          callback(JSON.parse(message.body))
        } catch (error) {
          console.error('[Socket] Error parsing message:', error)
        }
      }
    )

    return subscription
  }

  // ===============================
  // SEND
  // ===============================

  send(destination: string, body: any) {
    if (!this.stompClient || !this.connected) {
      console.warn('[Socket] Cannot send - not connected')
      return
    }

    console.log('[Socket] Sending message:', { destination, body })

    this.stompClient.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  // ===============================
  // CHAT HELPERS
  // ===============================

  joinConversation(conversationId: string) {
    this.send('/app/chat.join', { conversationId })
  }

  sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = 'text'
  ) {
    this.send('/app/chat.send', {
      conversationId,
      content,
      type,
    })
  }

  setTyping(conversationId: string, isTyping: boolean) {
    this.send('/app/chat.typing', {
      conversationId,
      typing: isTyping,
    })
  }

  markAsRead(conversationId: string) {
    this.send('/app/chat.read', {
      conversationId,
    })
  }

  // ===============================
  // SUBSCRIPTION HELPERS
  // ===============================

  subscribeToPresence() {
    if (!this.stompClient) return
  
    return this.stompClient.subscribe(
      "/user/queue/presence",
      (message) => {
        const data = JSON.parse(message.body)
        console.log('------------------>>>>>>>>>>>>>>>>>',data)
        useChatStore
          .getState()
          .updateUserStatus(data.username, data.online)
      }
    )
  }

  subscribeToUserMessages(callback: (data: any) => void) {
    return this.subscribe('/user/queue/conversation-history', callback)
  }

  subscribeToConversationMessages(
    conversationId: string,
    callback: (data: any) => void
  ) {
    return this.subscribe(`/topic/conversation/${conversationId}`, callback)
  }

  subscribeToConversationTyping(
    conversationId: string,
    callback: (data: any) => void
  ) {
    return this.subscribe(
      `/topic/conversation/${conversationId}/typing`,
      callback
    )
  }

  subscribeToConversationRead(
    conversationId: string,
    callback: (data: any) => void
  ) {
    return this.subscribe(
      `/topic/conversation/${conversationId}/read`,
      callback
    )
  }

  
}

export const socketService = new SocketService()