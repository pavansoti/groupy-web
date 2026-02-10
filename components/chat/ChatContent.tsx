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

  const [showConversationList, setShowConversationList] = useState(true)

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:grid md:grid-cols-3 gap-0 md:gap-4 p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Conversations Sidebar */}
      <div 
        className={`${
          showConversationList ? 'flex' : 'hidden'
        } md:flex flex-col md:col-span-1 space-y-3 overflow-y-auto border-r md:border-r border-border`}
      >
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-semibold text-foreground">
            Messages
          </h2>
          <button
            onClick={() => setShowConversationList(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Close conversations"
          >
            ✕
          </button>
        </div>

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
                onSelect={() => {
                  setActiveConversation(conversation.id)
                  setShowConversationList(false)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 md:col-span-2 flex flex-col min-w-0">
        {activeConversation ? (
          <>
            <div className="md:hidden mb-2">
              <button
                onClick={() => setShowConversationList(true)}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                ← Back to conversations
              </button>
            </div>
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
          </>
        ) : (
          <Card className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <p className="text-muted-foreground text-sm">
                {showConversationList ? 'Select a conversation' : 'Select a conversation to start chatting'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
