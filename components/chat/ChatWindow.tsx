'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message, Conversation, useChatStore } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowDown } from 'lucide-react'
import { socketService as ws } from '@/lib/services/socket'
import './chat.css';
import { toast } from 'sonner'
import { MessageType } from '@/lib/schemas/chat'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (message: string, type: MessageType) => void
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Only auto-scroll if the user is not scrolled up
    if (!showScrollToBottom) {
      scrollToBottom()
    }
  }, [messages, showScrollToBottom])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200
      setShowScrollToBottom(isScrolledUp)
    }
  }
  // console.log(conversation)
  // Join conversation and mark as read on mount
  // useEffect(() => {
  //   if (!conversation?.id || !ws.isConnected()) {
  //     return
  //   }
  //     console.log("[v0] ChatWindow: Joining conversation", conversation.id)
  //     ws.joinConversation(conversation.id)
  //     ws.markAsRead(conversation.id)
  // }, [conversation?.id])

  return (
    <Card className="relative flex flex-col h-full w-full min-h-0 gap-0 py-0">
      {/* Header */}
      <div className="border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {conversation.participantProfilePicture ? (
              <img
                src={conversation.participantProfilePicture}
                alt={conversation.participantUsername}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              conversation.participantUsername
                .charAt(0)
                .toUpperCase()
            )}
          </div>
  
          <div className="min-w-0">
            <p className="font-semibold truncate">
              {conversation.participantUsername}
            </p>
            <p className="text-xs text-muted-foreground">
              {conversation.online ? "🟢 Online" : "⚪ Offline"}
            </p>
          </div>
        </div>
      </div>
  
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar flex flex-col"
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Loading messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No messages yet.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId == user?.id}
                />
              ))}
            </div>

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
  
      {showScrollToBottom && (
        <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto bg-primary text-primary-foreground rounded-full p-4 shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}
  
      {/* Input */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <MessageInput
          onSend={onSendMessage}
          onTyping={onTyping}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
  
}
