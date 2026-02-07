'use client'

import { Message } from '@/lib/stores/chatStore'
import { format } from 'date-fns'
import Link from 'next/link'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex gap-2 max-w-xs ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="h-8 w-8 rounded-full bg-primary/50 flex-shrink-0 flex items-center justify-center text-xs font-semibold">
          {message.senderProfilePicture ? (
            <img
              src={message.senderProfilePicture || "/placeholder.svg"}
              alt={message.senderUsername}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            message.senderUsername.charAt(0).toUpperCase()
          )}
        </div>

        <div className={`${isOwn ? 'text-right' : 'text-left'}`}>
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Link href={`/profile/${message.senderId}`} className="text-xs font-semibold hover:underline">
              {message.senderUsername}
            </Link>
            <p className="text-sm mt-1">{message.content}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(message.createdAt), 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  )
}
