import { Skeleton } from '@/components/ui/skeleton'

export function PostGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 py-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded" />
      ))}
    </div>
  )
}
