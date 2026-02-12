import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    // .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    // .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(150, 'Bio must be at most 150 characters').optional(),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type SigninFormData = z.infer<typeof signinSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
