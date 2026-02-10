import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Image */}
      <Skeleton className="w-full h-80" />

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>

        {/* Likes */}
        <Skeleton className="h-4 w-20" />

        {/* Caption */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Comments link */}
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  )
}
