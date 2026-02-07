'use client'

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

      <Card className="p-12 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground mb-4">You haven't liked any posts yet</p>
        <p className="text-sm text-muted-foreground">
          Start liking posts from the feed to see them here
        </p>
      </Card>
    </div>
  )
}
