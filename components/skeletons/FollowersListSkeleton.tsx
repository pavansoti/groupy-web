import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FollowersListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 flex flex-row items-center justify-between">
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
    </div>
  )
}
