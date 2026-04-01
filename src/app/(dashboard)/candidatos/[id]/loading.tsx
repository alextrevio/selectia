import { Skeleton } from '@/components/ui/skeleton'

export default function CandidatoDetailLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    </div>
  )
}
