import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">Session</TableHead>
          <TableHead>Recorded</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-6 text-right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index} className="group">
            {/* Session column */}
            <TableCell className="pl-6 py-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="min-w-0 space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </TableCell>
            {/* Recorded column */}
            <TableCell className="py-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </TableCell>
            {/* Status column */}
            <TableCell className="py-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-3 w-36" />
              </div>
            </TableCell>
            {/* Actions column */}
            <TableCell className="pr-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

