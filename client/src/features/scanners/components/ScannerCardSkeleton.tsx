import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ScannerCardSkeleton() {
  return (
    <Card className="overflow-hidden gap-3!">
      <CardHeader className="pb-0!">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Skeleton className="h-6 w-20 rounded-md" />
          <div className="flex items-center text-xs gap-1.5 ml-auto">
            <Skeleton className="h-3.5 w-3.5 rounded-sm" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

