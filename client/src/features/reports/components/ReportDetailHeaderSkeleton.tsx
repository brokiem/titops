import { Skeleton } from "@/components/ui/skeleton";

export function ReportDetailHeaderSkeleton() {
  return (
    <div className="flex min-h-18 items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  );
}

