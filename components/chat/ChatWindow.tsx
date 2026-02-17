'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message, Conversation, useChatStore } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { socketService as ws } from '@/lib/services/socket'
import './chat.css';
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
    <Card className="flex flex-col h-full w-full min-h-0 gap-0 py-0">
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
              {conversation.isOnline ? "🟢 Online" : "⚪ Offline"}
            </p>
          </div>
        </div>
      </div>
  
      {/* Messages */}
<div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar flex flex-col">
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
            isOwn={message.senderId === user?.id}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </>
  )}
</div>

  
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
