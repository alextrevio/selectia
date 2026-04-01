import { Skeleton } from '@/components/ui/skeleton'

export default function OfertaDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  )
}
