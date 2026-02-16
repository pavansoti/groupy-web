'use client'

import { useCallback, useEffect, useState } from 'react'
import { useChatStore } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { ConversationItem } from './ConversationItem'
import { ChatWindow } from './ChatWindow'
import { socketService } from '@/lib/services/socket'
import { apiService } from '@/lib/services/api'

export function ChatContent() {
  const { user } = useAuth()
  const { conversations, activeConversationId, setConversations, setActiveConversation, messages } = useChatStore()
  const [mounted, setMounted] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)

  useEffect(() => {
    setMounted(true)
    socketService.connect().then(() =>{
      console.log("WebSocket Connected")
    })

    return () => {
      socketService.disconnect()
      console.log("WebSocket Disconnected")
    }
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      if (conversations.length === 0) {
        try {
          const res = await apiService.getConversations()
  
          if (res?.data?.success) {
            const data = res.data.data
            setConversations(data)
          }
        } catch (err) {
          console.error('Fetch conversations failed', err)
        }
      }
    }
  
    fetchConversations()
  }, [conversations.length])  

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  )

  const activeMessages = activeConversationId
    ? messages.get(activeConversationId) || []
    : []

  if (!mounted) {
    return null
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:grid md:grid-cols-3 gap-0 md:gap-4 p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Conversations Sidebar */}
      <div 
        className={`${
          showConversationList ? 'flex' : 'hidden'
        } md:flex flex-col md:col-span-1 space-y-3 overflow-y-auto border-r border-border`}
      >
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button
            onClick={() => setShowConversationList(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {conversations.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground text-sm mr-2">
            No conversations yet. Search for users to start chatting!
          </Card>
        ) : (
          <div className="space-y-2 mr-2">
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
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                ← Back to conversations
              </button>
            </div>
            <ChatWindow
              conversation={activeConversation}
              messages={activeMessages}
              onSendMessage={(message) =>
                socketService.sendMessage(activeConversation.id, message)
              }
              onTyping={(isTyping) =>
                socketService.setTyping(activeConversation.id, isTyping)
              }
            />
          </>
        ) : (
          <Card className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Select a conversation to start chatting
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
