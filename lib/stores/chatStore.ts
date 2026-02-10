import { create } from 'zustand'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderUsername: string
  senderProfilePicture?: string
  content: string
  type?: 'text' | 'file' | 'audio'
  createdAt: string
  isRead: boolean
}

export interface Conversation {
  id: string
  participantId: string
  participantUsername: string
  participantProfilePicture?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline: boolean
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Map<string, Message[]>
  typingUsers: Map<string, boolean>
  onlineUsers: Set<string>

  // Actions
  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (conversationId: string | null) => void
  addMessage: (message: Message) => void
  addMessages: (conversationId: string, messages: Message[]) => void
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void
  setUserOnline: (userId: string, isOnline: boolean) => void
  updateConversationLastMessage: (conversationId: string, message: string, timestamp: string) => void
  clearMessages: (conversationId: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: new Map(),
  typingUsers: new Map(),
  onlineUsers: new Set(),

  setConversations: (conversations) =>
    set({
      conversations,
    }),

  setActiveConversation: (conversationId) =>
    set({
      activeConversationId: conversationId,
    }),

  addMessage: (message) =>
    set((state) => {
      const conversationMessages = state.messages.get(message.conversationId) || []
      const newMessages = [...conversationMessages, message]
      const newMap = new Map(state.messages)
      newMap.set(message.conversationId, newMessages)
      return {
        messages: newMap,
      }
    }),

  addMessages: (conversationId, messages) =>
    set((state) => {
      const newMap = new Map(state.messages)
      newMap.set(conversationId, messages)
      return {
        messages: newMap,
      }
    }),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const key = `${conversationId}:${userId}`
      const newMap = new Map(state.typingUsers)
      if (isTyping) {
        newMap.set(key, true)
      } else {
        newMap.delete(key)
      }
      return {
        typingUsers: newMap,
      }
    }),

  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      if (isOnline) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return {
        onlineUsers: newSet,
      }
    }),

  updateConversationLastMessage: (conversationId, message, timestamp) =>
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, lastMessage: message, lastMessageTime: timestamp } : conv
      )
      return {
        conversations: updatedConversations,
      }
    }),

  clearMessages: (conversationId) =>
    set((state) => {
      const newMap = new Map(state.messages)
      newMap.delete(conversationId)
      return {
        messages: newMap,
      }
    }),
}))
