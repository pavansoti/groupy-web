'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Paperclip, Mic, Smile } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, SendMessageFormData } from '@/lib/schemas/chat'
import { toast } from 'sonner'
import EmojiPicker from '@emoji-mart/react'
import data from '@emoji-mart/data'

interface MessageInputProps {
  onSend: (message: string, type?: 'text' | 'file' | 'audio') => void
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        onSend(`[File: ${file.name}] ${base64}`, 'file')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast.success('File sent successfully')
      }
      reader.onerror = () => {
        toast.error('Failed to read file')
      }
      reader.readAsDataURL(file)
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
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            onSend(`[Audio: voice message] ${base64}`, 'audio')
            toast.success('Audio message sent')
          }
          reader.onerror = () => {
            toast.error('Failed to read audio file')
          }
          reader.readAsDataURL(blob)
        } catch (error) {
          console.error("[v0] Error processing audio:", error)
          toast.error('Failed to process audio')
        } finally {
          stream.getTracks().forEach(track => track.stop())
        }
      }

      recorder.start()
      setIsRecording(true)
      toast.success('Recording started...')
    } catch (error) {
      toast.error('Failed to access microphone')
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
    <div className="space-y-2">
      {showEmojiPicker && (
        <div className="bg-background border border-border rounded-lg p-2 absolute bottom-full mb-2 z-50">
          <EmojiPicker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" />
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 flex-wrap sm:flex-nowrap">
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
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />

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

        <Input
          type="text"
          placeholder={isRecording ? 'Recording... Press mic to stop' : 'Type a message...'}
          {...register('content')}
          disabled={isLoading || isRecording}
          onFocus={() => onTyping?.(true)}
          onBlur={() => onTyping?.(false)}
          className="flex-1"
        />
        
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || isRecording || !contentValue.trim()}
          className="flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
