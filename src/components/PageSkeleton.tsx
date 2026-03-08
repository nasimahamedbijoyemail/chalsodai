import { Skeleton } from '@/components/ui/skeleton';

const PageSkeleton = () => (
  <div className="container py-10 space-y-8">
    <Skeleton className="h-8 w-48" />
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-64 rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

export default PageSkeleton;
