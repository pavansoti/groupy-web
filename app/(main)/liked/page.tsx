import { LikedPostsList } from '@/components/liked/LikedPostsList'
import { Heart } from 'lucide-react'

export const metadata = {
  title: 'Your Likes | Groupy',
  description: 'View all posts you liked',
}

export default function LikedPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Likes</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            All the posts you loved in one place
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <LikedPostsList limit={30} showPagination={true} />
      </div>
    </main>
  )
}
