import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message must be at most 10000 characters'),
})

export const messageTypeSchema = z.enum(['text', 'file', 'voice_audio', 'music_audio', 'image', 'video'])

export type SendMessageFormData = z.infer<typeof sendMessageSchema>
export type MessageType = z.infer<typeof messageTypeSchema>
