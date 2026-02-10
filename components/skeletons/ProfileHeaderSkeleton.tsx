import { Skeleton } from '@/components/ui/skeleton'

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 items-start">
        {/* Avatar */}
        <Skeleton className="h-32 w-32 rounded-full" />

        {/* Info */}
        <div className="flex-1 space-y-3">
          {/* Username */}
          <Skeleton className="h-8 w-40" />

          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
          </div>

          {/* Join date */}
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 border-t pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
