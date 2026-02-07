'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendMessageSchema, SendMessageFormData } from '@/lib/schemas/chat'

interface MessageInputProps {
  onSend: (message: string) => void
  onTyping?: (isTyping: boolean) => void
  isLoading?: boolean
}

export function MessageInput({ onSend, onTyping, isLoading = false }: MessageInputProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
  })

  const onSubmit = async (data: SendMessageFormData) => {
    onSend(data.content)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Input
        type="text"
        placeholder="Type a message..."
        {...register('content')}
        disabled={isLoading}
        onFocus={() => onTyping?.(true)}
        onBlur={() => onTyping?.(false)}
      />
      <Button type="submit" size="icon" disabled={isLoading}>
        <Send className="h-5 w-5" />
      </Button>
    </form>
  )
}
