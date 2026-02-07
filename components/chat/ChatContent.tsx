'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { ConversationItem } from './ConversationItem'
import { ChatWindow } from './ChatWindow'
import { socketService } from '@/lib/services/socket'

export function ChatContent() {
  const { user } = useAuth()
  const { conversations, activeConversationId, setActiveConversation, messages } = useChatStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const activeMessages = activeConversationId ? messages.get(activeConversationId) || [] : []

  if (!mounted) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
      {/* Conversations Sidebar */}
      <div className="md:col-span-1 space-y-3 overflow-y-auto">
        <h2 className="text-lg font-semibold text-foreground sticky top-0 pb-2">
          Messages
        </h2>

        {conversations.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet. Search for users to start chatting!
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onSelect={() => setActiveConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="md:col-span-2">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            onSendMessage={(message) => {
              socketService.sendMessage(activeConversation.id, message)
            }}
            onTyping={(isTyping) => {
              socketService.setTyping(activeConversation.id, isTyping)
            }}
          />
        ) : (
          <Card className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
