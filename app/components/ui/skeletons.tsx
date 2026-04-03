import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface PageHeaderSkeletonProps {
  className?: string;
}

export function PageHeaderSkeleton({ className }: PageHeaderSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="border-b px-4 py-3 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3 flex gap-4 border-b last:border-b-0">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 flex-1"
                style={{ maxWidth: colIndex === 0 ? "40%" : undefined }}
              />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface CardGridSkeletonProps {
  cards?: number;
  columns?: number;
  className?: string;
}

export function CardGridSkeleton({ cards = 4, columns = 4, className }: CardGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full rounded" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export function FormSkeleton({ fields = 3, className }: FormSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-9 w-28 rounded-md" />
      </CardContent>
    </Card>
  );
}

interface StatCardsSkeletonProps {
  className?: string;
}

export function StatCardsSkeleton({ className }: StatCardsSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
