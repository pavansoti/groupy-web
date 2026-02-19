'use client'

import { Message } from '@/lib/stores/chatStore'
import { format } from 'date-fns'
import Link from 'next/link'
import { File, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MessageType } from '@/lib/schemas/chat'
import { useMemo, useState } from 'react'

interface MessageBubbleProps {
  message: Message & { type?: MessageType }
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [downloadedUrl, setDownloadedUrl] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  /* -------------------- Parse Content -------------------- */

  const parsedContent = useMemo(() => {
    try {
      return JSON.parse(message.content)
    } catch {
      return null
    }
  }, [message.content])

  let isImage = false;
  let isVideo = false;
  let isMusicAudio = false;
  let isVoiceAudio = false;
  let isFile = false;
  
  if(parsedContent) {
    isImage = parsedContent?.type === 'image'
    isVideo = parsedContent?.type === 'video'
    isMusicAudio = parsedContent?.type === 'music_audio'
    isVoiceAudio = parsedContent?.type === 'voice_audio'
    isFile = parsedContent?.type === 'file'
  }

  const mediaUrl = parsedContent?.content
  const fileName = parsedContent?.fileName || 'File'

  /* -------------------- Download Handlers -------------------- */

  const downloadMediaToState = async () => {
    if (!mediaUrl) return

    try {
      setIsDownloading(true)

      const response = await fetch(mediaUrl)
      const blob = await response.blob()
      const localUrl = URL.createObjectURL(blob)

      setDownloadedUrl(localUrl)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadFileDirectly = async () => {
    if (!mediaUrl) return

    try {
      setIsDownloading(true)

      const response = await fetch(mediaUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setIsDownloading(false)
    }
  }

  /* -------------------- UI Helpers -------------------- */

  const MediaDownloadOverlay = ({
    width,
    height,
  }: {
    width: string
    height: string
  }) => (
    <div className={`relative ${width} ${height} rounded-md overflow-hidden`}>
      {!downloadedUrl ? (
        <>
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            {isDownloading ? 'Downloading...' : ''}
          </div>

          {!isDownloading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="icon"
                onClick={downloadMediaToState}
                className="rounded-full"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )

  /* -------------------- Render -------------------- */

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-1 sm:px-0`}>
      <div
        className={`flex gap-2 max-w-xs sm:max-w-sm md:max-w-md ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-primary/50 hidden sm:flex items-center justify-center text-xs font-semibold">
          {message.senderProfilePicture ? (
            <img
              src={message.senderProfilePicture}
              alt={message.senderUsername}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            message.senderUsername.charAt(0).toUpperCase()
          )}
        </div>

        <div className={isOwn ? 'text-right' : 'text-left'}>
          <Link
            href={`/profile/${message.senderId}`}
            className="text-xs font-semibold hover:underline inline-block px-3 pt-2 text-muted-foreground"
          >
            {message.senderUsername}
          </Link>

          <div
            className={`rounded-lg px-3 sm:px-4 py-2 ${
              isOwn
                ? isVoiceAudio || isMusicAudio|| isVideo || isImage ?'text-primary-foreground' : 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            {/* -------- File -------- */}
            {isFile && (
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 flex-shrink-0" />

                <span className="text-sm break-words max-w-[200px] truncate">
                  {fileName}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadFileDirectly}
                  className="p-0 hover:bg-transparent"
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* -------- Image -------- */}
            {isImage && (
              <>
                {!downloadedUrl ? (
                  <MediaDownloadOverlay width="w-40" height="h-40" />
                ) : (
                  <div className="relative w-40 h-40 rounded-md overflow-hidden">
                    <img
                      src={downloadedUrl}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </>
            )}

            {/* -------- Video -------- */}
            {isVideo && (
              <>
                {!downloadedUrl ? (
                  <MediaDownloadOverlay width="w-60" height="h-40" />
                ) : (
                  <div className="relative w-60 h-40 rounded-md overflow-hidden">
                    <video
                      controls
                      src={downloadedUrl}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </>
            )}

            {/* -------- Voice Audio -------- */}
            {isVoiceAudio && (
              <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full w-[18rem]">
                
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                  🎤
                </div>

                <audio
                  controls
                  src={mediaUrl}
                  className="flex-1 h-8"
                />
              </div>
            )}

            {/* -------- Music Audio -------- */}
            {isMusicAudio && (
              <div className="flex flex-col gap-2 bg-muted px-4 py-3 rounded-xl w-[18rem]">

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary">
                    🎵
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium truncate max-w-[220px]">
                      {fileName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Music file
                    </span>
                  </div>
                </div>

                {!downloadedUrl ? (
                  <Button
                    size="sm"
                    onClick={downloadMediaToState}
                    disabled={isDownloading}
                    className="w-full mt-2"
                  >
                    {isDownloading ? 'Downloading...' : 'Download & Play'}
                  </Button>
                ) : (
                  <audio
                    controls
                    src={downloadedUrl}
                    className="w-full"
                  />
                )}
              </div>
            )}

            {/* -------- Text -------- */}
            {!isImage && !isVideo && !isVoiceAudio && !isMusicAudio
             && !isFile && (
              <p className="text-sm break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>

          <p className="text-xs mt-1 text-muted-foreground">
            {format(new Date(message.createdAt), 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  )
}
