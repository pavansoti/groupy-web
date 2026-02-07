'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message, Conversation } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/50 flex items-center justify-center text-sm font-semibold">
              {conversation.participantProfilePicture ? (
                <img
                  src={conversation.participantProfilePicture || "/placeholder.svg"}
                  alt={conversation.participantUsername}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                conversation.participantUsername.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{conversation.participantUsername}</p>
              <p className="text-xs text-muted-foreground">
                {conversation.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No messages yet. Start a conversation!</p>
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <MessageInput
          onSend={onSendMessage}
          onTyping={onTyping}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}
