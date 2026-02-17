'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Message, useChatStore } from '@/lib/stores/chatStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { ConversationItem } from './ConversationItem'
import { ChatWindow } from './ChatWindow'
import { socketService } from '@/lib/services/socket'
import { apiService } from '@/lib/services/api'
import { toast } from 'sonner'

export function ChatContent() {
  const { user } = useAuth()

  const {
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    loadingMessages,
    setConversations,
    updateConversationLastMessage,
    updateConversationUnreadCount,
    setActiveConversation,
    addMessage,
    addMessages,
    setTyping,
    setLoadingConversations,
    setLoadingMessages,
  } = useChatStore()
  
  const [connected, setConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  
    const initSocket = async () => {
      try {
        await socketService.connect()
        setConnected(true)
        console.log("WebSocket Connected")
        fetchConversations() // fetch after socket connects
      } catch (error) {
        console.error("WebSocket connection failed:", error)
        toast.error("Failed to connect to chat service")
      }
    }
  
    initSocket()
  
    return () => {
      socketService.disconnect()
      setConnected(false)
      console.log("WebSocket Disconnected")
    }
  }, [])

  const fetchConversations = async () => {
    setLoadingConversations(true)
  
    try {
      const res = await apiService.getConversations()
  
      if (res?.data?.success) {
        setConversations(res.data.data)
      }
    } catch (err) {
      console.error("Fetch conversations failed:", err)
      toast.error("Failed to load conversations")
    } finally {
      setLoadingConversations(false)
    }
  }
  
  const [showConversationList, setShowConversationList] = useState(true)
  const subscriptionsRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    if (!activeConversationId || !connected) return
  
    const conversationId = activeConversationId
  
    console.log("Subscribing to:", conversationId)
  
    setLoadingMessages(conversationId, true)
  
    // MUST JOIN CONVERSATION (THIS WAS MISSING)
    socketService.joinConversation(conversationId)
  
    // Mark as read
    socketService.markAsRead(conversationId)
  
    // History subscription
    const historySub = socketService.subscribeToUserMessages((data: any) => {
      if (
        data?.type === "HISTORY" &&
        data?.conversationId === conversationId &&
        Array.isArray(data?.messages)
      ) {
        console.log("---------data.messages-----------:", data.messages)
        addMessages(conversationId, data.messages)
        updateConversationUnreadCount(conversationId, 0)
        setLoadingMessages(conversationId, false)
      }
    })
  
    // New messages
    const messageSub = socketService.subscribeToConversationMessages(
      conversationId,
      (messageData: Message) => {
        addMessage(messageData)
        console.log("--------------------:", messageData)
        updateConversationLastMessage(
          conversationId,
          messageData.content,
          messageData.createdAt
        )
      }
    )
  
    // Typing
    const typingSub = socketService.subscribeToConversationTyping(
      conversationId,
      ({ userName, typing }) => {
        setTyping(conversationId, userName, typing)
      }
    )
  
    // Read receipts
    const readSub = socketService.subscribeToConversationRead(
      conversationId,
      (readData: any) => {
        // console.log("Read receipt:", readData)
      }
    )
  
    return () => {
      console.log("Unsubscribing from:", conversationId)
  
      historySub?.unsubscribe?.()
      messageSub?.unsubscribe?.()
      typingSub?.unsubscribe?.()
      readSub?.unsubscribe?.()
    }
  }, [activeConversationId, connected])

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  )

  const activeMessages = activeConversationId
    ? messages.get(activeConversationId) || []
    : []

  if (!mounted) {
    return null
  }

  // console.log("[v0] Active conversation:", activeConversation)
  // console.log("[v0] Active messages:", activeMessages)

  return (
    <div
      className="
        h-[calc(100vh-120px)] md:h-[calc(100vh-70px)]
        flex flex-col md:grid md:grid-cols-3
        overflow-hidden
        gap-0 md:gap-4
        p-2 sm:p-4 md:p-6 lg:p-8
        md:pb-1 lg:pb-2
      "
    >
      {/* Sidebar */}
      <div
        className={`
          ${showConversationList ? "flex" : "hidden"}
          md:flex md:col-span-1
          flex-col
          min-h-0
          overflow-y-auto
          md:border-r border-border
          pr-0 md:pr-2
        `}
      >
        {/* <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button
            onClick={() => setShowConversationList(false)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div> */}

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
                  setActiveConversation(conversation.id);
                  setShowConversationList(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Chat Column */}
      <div className={`flex flex-col md:col-span-2 min-h-0 min-w-0 ${!showConversationList ? "h-full" : "" }`}>
        {activeConversation && (
          <div className={`
            ${!showConversationList ? "block" : "hidden"}
            md:block
            flex flex-col md:col-span-2 min-h-0 min-w-0 h-full
          `}>
            {/* Mobile Back Button */}
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
              isLoading={
                loadingConversations ||
                loadingMessages.get(activeConversationId)
              }
            />
          </div>
        )}
        {!activeConversation && (
          <Card className="hidden md:flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Select a conversation to start chatting
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
