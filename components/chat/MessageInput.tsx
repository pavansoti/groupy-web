'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Paperclip, Mic, Smile, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, SendMessageFormData, MessageType } from '@/lib/schemas/chat'
import { toast } from 'sonner'
import EmojiPicker from '@emoji-mart/react'
import emojiData from '@emoji-mart/data'
import { apiService } from '@/lib/services/api'

interface MessageInputProps {
  onSend: (message: string, type: MessageType ) => void
  onTyping?: (isTyping: boolean) => void
  isLoading?: boolean
}

export function MessageInput({ onSend, onTyping, isLoading = false }: MessageInputProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
    },
  })
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<MediaRecorder | null>(null)
  const contentValue = watch('content')
  const [showMobileActions, setShowMobileActions] = useState(false)
  const emojiRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showEmojiPicker) return
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false)
      }
    }
  
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
  
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])  

  const onSubmit = async (data: SendMessageFormData) => {
    if (!data.content.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    try {
      onSend(data.content, 'text')
      reset()
      setShowEmojiPicker(false)
      // Clear typing status
      onTyping?.(false)
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      let messageType: MessageType = "file"
  
      if (file.type.startsWith("image/")) {
        messageType = "image"
      } else if (file.type.startsWith("video/")) {
        messageType = "video"
      } else if (file.type.startsWith("audio/")) {
        messageType = "music_audio"
      }
  
      const uploadResponse = await apiService.uploadFile(file)
  
      const data = uploadResponse.data

      const messagePayload = JSON.stringify({
        content: data.url,
        fileName: file.name,
        publicId: data.publicId,
        type: messageType,
      })
  
      onSend(messagePayload, messageType)
  
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.error('Failed to send file')
    }
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
  
      audioRef.current = recorder
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" })
  
          // Convert Blob → File
          const audioFile = new File(
            [blob],
            `voice-groupy-${Date.now()}.webm`,
            { type: "audio/webm" }
          )
  
          // Upload to backend (Cloudinary)
          const uploadResponse = await apiService.uploadFile(audioFile)

          const data = uploadResponse.data
  
          const messagePayload = JSON.stringify({
            content: data.url,
            fileName: audioFile.name,
            publicId: data.publicId,
            type: "voice_audio",
          })
  
          onSend(messagePayload, "voice_audio")
  
          toast.success("Voice message sent")
  
        } catch (error) {
          console.error("Audio upload failed:", error)
          toast.error("Failed to send voice message")
        } finally {
          stream.getTracks().forEach(track => track.stop())
        }
      }

      recorder.start()
      setIsRecording(true)
      toast.success("Recording started...")
  
    } catch (error) {
      toast.error("Failed to access microphone")
    }
  }

  const handleStopRecording = () => {
    try {
      if (audioRef.current) {
        audioRef.current.stop()
        setIsRecording(false)
        toast.info('Processing audio...')
      }
    } catch (error) {
      console.error("[v0] Error stopping recording:", error)
      toast.error('Failed to stop recording')
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setValue('content', contentValue + emoji.native)
  }

  return (
    <div className="relative space-y-2">
      
      {/* Emoji Picker */}
      {showEmojiPicker && emojiData&& (
        <div ref={emojiRef} className="absolute bottom-full mb-2 w-[320px] sm:w-[350px]">
          <EmojiPicker data={emojiData} 
            onEmojiSelect={handleEmojiSelect}
            theme="auto"
            searchPosition="top"
            previewPosition="none"
            navPosition="bottom"
            emojiSize={22}
            perLine={8}
          />
        </div>
      )}

      {/* Mobile Action Sheet */}
      {showMobileActions && (
        <div className="sm:hidden absolute bottom-16 left-0 right-0 bg-background border border-border rounded-xl p-3 shadow-xl flex justify-around animate-in slide-in-from-bottom-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowEmojiPicker(true)
              setShowMobileActions(false)
            }}
          >
            <Smile className="h-6 w-6" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              fileInputRef.current?.click()
              setShowMobileActions(false)
            }}
          >
            <Paperclip className="h-6 w-6" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={isRecording ? 'bg-red-500/20 text-red-500' : ''}
          >
            <Mic className="h-6 w-6" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">

        {/* Mobile + Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileActions(!showMobileActions)}
          className="sm:hidden"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Desktop Actions */}
        <div className="hidden sm:flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isLoading}
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading}
            className={isRecording ? 'bg-red-500/20 text-red-500' : ''}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        {/* Message Input */}
        <Input
          type="text"
          placeholder={isRecording ? 'Recording... Tap mic to stop' : 'Type a message...'}
          {...register('content')}
          disabled={isLoading || isRecording}
          onFocus={() => onTyping?.(true)}
          onBlur={() => onTyping?.(false)}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || isRecording || !contentValue.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
