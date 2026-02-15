import { Skeleton } from '@/components/ui/skeleton'

export function PostGridSkeleton({ length = 9, className = ''}) {
  return (
    <div className={`grid grid-cols-3 gap-1 sm:gap-2 ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded" />
      ))}
    </div>
  )
}
