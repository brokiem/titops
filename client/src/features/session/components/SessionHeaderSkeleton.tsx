import { Skeleton } from "@/components/ui/skeleton";

export function SessionHeaderSkeleton() {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="space-y-1 flex-1">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </section>
  );
}

