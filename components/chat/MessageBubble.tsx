'use client'

import { Message } from '@/lib/stores/chatStore'
import { format } from 'date-fns'
import Link from 'next/link'
import { File, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MessageBubbleProps {
  message: Message & { type?: 'text' | 'file' | 'audio' }
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isFile = message.content.startsWith('[File:')
  const isAudio = message.content.startsWith('[Audio:')
  
  const extractContent = (content: string) => {
    if (isFile || isAudio) {
      const match = content.match(/\]\s*(.+)/)
      return match ? match[1] : content
    }
    return content
  }

  const extractLabel = (content: string) => {
    const match = content.match(/\[(.*?)\]/)
    return match ? match[1] : 'File'
  }

  const handleDownload = (base64: string, label: string) => {
    try {
      const link = document.createElement('a')
      link.href = base64
      link.download = label.replace(/[File:|Audio:]/g, '').trim() || 'download'
      link.click()
      console.log("[v0] File download initiated:", label)
    } catch (error) {
      console.error("[v0] Download error:", error)
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-1 sm:px-0`}>
      <div
        className={`flex gap-2 max-w-xs sm:max-w-sm md:max-w-md ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="h-8 w-8 rounded-full bg-primary/50 flex-shrink-0 flex items-center justify-center text-xs font-semibold hidden sm:flex">
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
          <Link 
            href={`/profile/${message.senderId}`} 
            className="text-xs font-semibold hover:underline inline-block px-3 pt-2 text-muted-foreground"
          >
            {message.senderUsername}
          </Link>
          
          <div
            className={`rounded-lg px-3 sm:px-4 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {isFile ? (
              <div className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span className="text-sm break-words">{extractLabel(message.content)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(extractContent(message.content), extractLabel(message.content))}
                  className="p-0 h-auto w-auto hover:bg-transparent"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ) : isAudio ? (
              <div className="flex items-center gap-2">
                <audio
                  controls
                  src={extractContent(message.content)}
                  className="h-6 w-40 sm:w-48"
                  onError={() => console.error("[v0] Audio playback error")}
                />
              </div>
            ) : (
              <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-muted-foreground' : 'text-muted-foreground'
          }`}>
            {format(new Date(message.createdAt), 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  )
}
