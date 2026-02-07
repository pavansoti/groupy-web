import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be at most 1000 characters'),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>
