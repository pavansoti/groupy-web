'use client'

import { FeedContent } from '@/components/feed/FeedContent'
import { Card } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export default function LikesPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-8 w-8 text-destructive" />
          Your Likes
        </h1>
        <p className="text-muted-foreground">Posts you've liked</p>
      </div>
      
      <FeedContent feedsType="liked" />
    </div>
  )
}
