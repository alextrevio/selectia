import { Skeleton } from '@/components/ui/skeleton'

export default function CandidatosLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded" />
        ))}
      </div>
    </div>
  )
}
