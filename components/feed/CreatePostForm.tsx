'use client'

import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { createPostSchema, CreatePostFormData } from '@/lib/schemas/post'
import { ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'

interface CreatePostFormProps {
  onSubmit: (formData: FormData) => Promise<boolean>
  isLoading?: boolean
}

export function CreatePostForm({
  onSubmit,
  isLoading = false,
}: CreatePostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const clearPreview = () => {
    setPreview(null)
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmitForm = async (data: CreatePostFormData) => {
    const formData = new FormData()
    formData.append('caption', data.caption)

    if (file) {
      formData.append('file', file)
    }

    const success = await onSubmit(formData)
  
    if (success) {
      reset()
      clearPreview()
    }
  }

  return (
    <Card className="p-6 space-y-4 gap-0">
      <h3 className="font-semibold text-foreground">Create a Post</h3>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div>
          <Textarea
            placeholder="What's on your mind?"
            {...register('caption')}
            disabled={isLoading}
            className="resize-none"
          />
          {errors.caption && (
            <p className="text-sm text-destructive mt-1">
              {errors.caption.message}
            </p>
          )}
        </div>

        {preview && (
          <div className="relative w-full h-[340px] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-auto object-contain"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={clearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
