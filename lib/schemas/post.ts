import { z } from 'zod'

export const createPostSchema = z.object({
  caption: z
    .string()
    .min(1, 'Caption is required')
    .max(500, 'Caption must be at most 500 characters'),
  image: z.instanceof(File).optional(),
})

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(300, 'Comment must be at most 300 characters'),
})

export type CreatePostFormData = z.infer<typeof createPostSchema>
export type CreateCommentFormData = z.infer<typeof createCommentSchema>
