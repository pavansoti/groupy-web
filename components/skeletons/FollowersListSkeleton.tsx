import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FollowersListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="min-w-0 space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded ml-2 flex-shrink-0" />
        </Card>
      ))}
    </div>
  )
}
