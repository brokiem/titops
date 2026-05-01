import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import type { EnrichedAttendanceDto } from "@/types/api";
import { formatTime } from "@/lib/date";
import { ClipboardList, Clock3, CreditCard, UserRound, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceTableProps {
    attendance: EnrichedAttendanceDto[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    onDelete?: (record: EnrichedAttendanceDto) => void;
}

export function AttendanceTable({ attendance, isLoading, isError, error, refetch, onDelete }: AttendanceTableProps) {
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (isLoading && !attendance) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }
    if (!attendance || (attendance.length === 0 && !isLoading)) {
        return <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="No attendance records" description="Scans will appear here when members check in." />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Member</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                    {onDelete && <TableHead className="pr-6 text-right"></TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {attendance.map((record) => (
                    <TableRow key={record.id} className="group">
                        <TableCell className="pl-6 py-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                    <UserRound className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 space-y-1">
                                    <div className="truncate font-semibold text-foreground">{record.memberName}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span className="font-mono">{record.cardUid}</span>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            <div className="space-y-1">
                                <div className="font-medium text-foreground">{formatTime(record.checkInAt)}</div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    <span>Checked in</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="py-4">
                            <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                    {record.checkOutAt ? formatTime(record.checkOutAt) : "—"}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    <span>{record.checkOutAt ? "Checked out" : "Still active"}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                            <Badge variant={record.checkOutAt ? "secondary" : "default"}>
                                {record.checkOutAt ? "Completed" : "Present"}
                            </Badge>
                        </TableCell>
                        {onDelete && (
                            <TableCell className="pr-6 py-4 text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => onDelete(record)}
                                    aria-label="Remove attendance record"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
