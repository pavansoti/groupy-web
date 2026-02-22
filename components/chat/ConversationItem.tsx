'use client'

import { Conversation, useChatStore } from '@/lib/stores/chatStore'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface ConversationItemProps {
  conversation: Conversation
  isActive?: boolean
  onSelect?: () => void
}

export function ConversationItem({ conversation, isActive = false, onSelect }: ConversationItemProps) {
  
  const { typingUsers } = useChatStore()
  // console.log('typingUsers',typingUsers)
  // Check if user is typing in this conversation
  const isTyping = Array.from(typingUsers.keys()).some(
    key => key.startsWith(`${conversation.id}:`) && key === `${conversation.id}:${conversation.participantUsername}`
  )

  // console.log("[v0] ConversationItem:", conversation)
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 text-left rounded-lg transition-colors flex items-center justify-between gap-2 mb-4 md:mb-3',
        isActive ? 'bg-primary/10 border border-primary' : 'bg-primary/5 hover:bg-muted'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
        <div className="h-10 w-10 rounded-full bg-primary/50 flex-shrink-0 flex items-center justify-center text-xs sm:text-sm font-semibold relative">
          {conversation.participantProfilePicture ? (
            <img
              src={conversation.participantProfilePicture || "/placeholder.svg"}
              alt={conversation.participantUsername}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            conversation.participantUsername.charAt(0).toUpperCase()
          )}
          {conversation.online && (
            <div className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500 rounded-full border border-background"></div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-0">
          <p className="font-semibold text-foreground truncate text-lg">
            {conversation.participantUsername}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isTyping ? (
              <span className="text-blue-500">typing...</span>
            ) : (() => {
                if (!conversation.lastMessage) return "No messages yet"
                try {
                  const parsed = JSON.parse(conversation.lastMessage)

                  const fileName = parsed?.fileName || "File"
                  const type = parsed?.type || ""

                  if (type === 'music_audio') {
                    return <>🎵 <span className="truncate">{fileName}</span></>
                  }

                  if (type === 'voice_audio') {
                    return <>🎤 <span className="truncate">{fileName}</span></>
                  }

                  if (type === 'image') {
                    return <>📷 <span className="truncate">{fileName}</span></>
                  }

                  if (type === 'video') {
                    return <>🎥 <span className="truncate">{fileName}</span></>
                  }

                  return <>📎 <span className="truncate">{fileName}</span></>
                } catch {
                  return conversation.lastMessage || "No messages yet"
                }
              })()}
          </p>
        </div>
      </div>

      {conversation.unreadCount > 0 && (
        <Badge className="ml-1 flex-shrink-0 text-xs">{conversation.unreadCount}</Badge>
      )}
    </button>
  )
}
