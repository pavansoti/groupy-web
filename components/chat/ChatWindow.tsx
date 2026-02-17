'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message, Conversation, useChatStore } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { socketService as ws } from '@/lib/services/socket'
import { toast } from 'sonner'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (message: string) => void
  onTyping?: (isTyping: boolean) => void
  isLoading?: boolean
}

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onTyping,
  isLoading = false,
}: ChatWindowProps) {
  const { user } = useAuth()
  const { typingUsers } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Join conversation and mark as read on mount
  useEffect(() => {
    if (!conversation?.id || !ws.isConnected()) {
      return
    }
      console.log("[v0] ChatWindow: Joining conversation", conversation.id)
      ws.joinConversation(conversation.id)
      ws.markAsRead(conversation.id)
  }, [conversation?.id])

  return (
    <Card className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="border-b border-border p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-primary/50 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
              {conversation.participantProfilePicture ? (
                <img
                  src={conversation.participantProfilePicture || "/placeholder.svg"}
                  alt={conversation.participantUsername}
                  className="h-8 sm:h-10 w-8 sm:w-10 rounded-full object-cover"
                />
              ) : (
                conversation.participantUsername.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">{conversation.participantUsername}</p>
              <p className="text-xs text-muted-foreground">
                {conversation.isOnline ? '🟢 Online' : '⚪ Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-xs sm:text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-xs sm:text-sm text-center">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
              />
            ))}
            {/* Typing indicators */}
            {Array.from(typingUsers.keys()).some(
              key => key.startsWith(`${conversation.id}:`) && !key.includes(user?.username || '')
            ) && (
              <div className="flex gap-2 items-center">
                <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-muted-foreground">typing</span>
                  <span className="flex gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 sm:p-4 flex-shrink-0">
        <MessageInput
          onSend={onSendMessage}
          onTyping={onTyping}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}
