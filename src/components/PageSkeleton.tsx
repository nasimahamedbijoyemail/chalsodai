import { Skeleton } from '@/components/ui/skeleton';

const PageSkeleton = () => (
  <div className="container py-8 sm:py-10 space-y-6 animate-fade-in">
    {/* Header skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>

    {/* Content area */}
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 py-3 border-t first:border-t-0">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4 p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
    <div className="rounded-xl border overflow-hidden">
      {/* Table header */}
      <div className="flex gap-4 p-3 bg-muted/50">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border-t">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1 hidden sm:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default PageSkeleton;
