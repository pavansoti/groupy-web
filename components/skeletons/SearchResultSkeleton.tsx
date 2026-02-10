import { Skeleton } from '@/components/ui/skeleton'

export function SearchResultSkeleton() {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            {/* Avatar + Info */}
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            {/* Follow Button */}
            <Skeleton className="h-8 w-20 rounded ml-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
