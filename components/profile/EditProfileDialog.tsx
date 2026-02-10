'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { User } from '@/app/(main)/profile/[[...id]]/page'
import { apiService } from '@/lib/services/api'
import { useAuthStore } from '@/lib/stores/authStore'

const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say', '']).optional(),
  isPrivate: z.boolean(),
})

type EditProfileFormData = z.infer<typeof editProfileSchema>

interface EditProfileDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdate: (user: User) => void
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onUserUpdate,
}: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { setUser: setAuthUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      gender: (user as any).gender || '',
      isPrivate: user.Private || false,
    },
  })

  useEffect(() => {
    reset({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      gender: (user as any).gender || '',
      isPrivate: user.Private || false,
    })
  }, [user, open, reset])

  const isPrivateWatch = watch('isPrivate')

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true)

      const payload = {
        username: data.username,
        email: data.email,
        bio: data.bio || '',
        gender: data.gender || '',
        Private: data.isPrivate,
      }

      const response = await apiService.updateProfile(user.id, payload)

      if (response.data?.success) {
        const updatedUser = response.data.data
        
        // Update local user state
        onUserUpdate({
          ...user,
          ...updatedUser,
        })

        // Update auth store
        setAuthUser(updatedUser)

        toast.success('Profile updated successfully')
        onOpenChange(false)
      } else {
        toast.error(response.data?.message || 'Failed to update profile')
      }
    } catch (err: any) {
      console.error('Profile update failed:', err)
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Update your profile information
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register('username')}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself (max 500 characters)"
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              {...register('gender')}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender.message}</p>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input
              id="isPrivate"
              type="checkbox"
              className="h-4 w-4 rounded border-border cursor-pointer"
              disabled={isLoading}
              {...register('isPrivate')}
            />
            <div className="flex-1">
              <Label htmlFor="isPrivate" className="cursor-pointer font-medium">
                Private Account
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                {isPrivateWatch
                  ? 'Only approved followers can see your posts'
                  : 'Anyone can see your posts'}
              </p>
            </div>
          </div>

          <AlertDialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
