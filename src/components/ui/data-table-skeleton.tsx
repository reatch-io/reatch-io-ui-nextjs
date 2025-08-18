import { Skeleton } from "@/components/ui/skeleton"

export function DataTableSkeleton({ columns = 5, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <div>
      {/* Table header skeleton */}
      <div className="flex gap-2 mb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
      {/* Table rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}