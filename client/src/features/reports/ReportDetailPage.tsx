import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AttendanceTable } from "@/features/session/components/AttendanceTable";
import { useReportDetail } from "./hooks/useReports";
import { useDeleteAttendance } from "@/features/session/hooks/useSession";
import { exportCsv, exportPdf } from "./lib/export";
import { formatDate } from "@/lib/date";
import type { EnrichedAttendanceDto } from "@/types/api";

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { session, attendance, isLoading, isError, error } = useReportDetail(id!);
  const deleteAttendance = useDeleteAttendance();

  const [recordToDelete, setRecordToDelete] = useState<EnrichedAttendanceDto | null>(null);

  useEffect(() => {
    const exportType = searchParams.get("export");
    if (exportType && session && attendance) {
      if (exportType === "csv") exportCsv(session, attendance);
      if (exportType === "pdf") exportPdf(session, attendance);
    }
  }, [searchParams, session, attendance]);

  if (isError || (!session && !isLoading)) return <ErrorState message={error?.message} />;

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    await deleteAttendance.mutateAsync({
      sessionId: recordToDelete.sessionId,
      attendanceId: recordToDelete.id,
    });
    setRecordToDelete(null);
  };

  return (
    <>
      <div className="mb-6">
        <Link to="/dashboard/reports" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>
        {session && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{session.mode}</Badge>
                <span>{formatDate(session.startedAt ?? session.createdAt)}</span>
                <span>·</span>
                <span>{attendance?.length ?? 0} records</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => attendance && exportCsv(session, attendance)} disabled={!attendance?.length}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => attendance && exportPdf(session, attendance)} disabled={!attendance?.length}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0">
        <CardContent className="px-0">
          <AttendanceTable
            attendance={attendance}
            isLoading={!attendance && isLoading}
            isError={isError}
            error={error}
            refetch={() => {}}
            onDelete={session?.isActive ? setRecordToDelete : undefined}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!recordToDelete}
        onOpenChange={(open) => !open && setRecordToDelete(null)}
        title="Remove attendance record?"
        description={`Are you sure you want to remove the attendance record for ${recordToDelete?.memberName}? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        loading={deleteAttendance.isPending}
        onConfirm={handleDeleteRecord}
      />
    </>
  );
}
