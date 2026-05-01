import { useState } from "react";
import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReportsTable } from "./components/ReportsTable";
import { ReportsTableSkeleton } from "./components/ReportsTableSkeleton";
import { MonthlyReportDialog } from "./components/MonthlyReportDialog";
import { useAllSessions, useDeleteSession } from "./hooks/useReports";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { SessionDto } from "@/types/api";

export function ReportsPage() {
  const { sessions, isLoading, isError, error, refetch } = useAllSessions();
  const deleteSession = useDeleteSession();

  const [sessionToDelete, setSessionToDelete] = useState<SessionDto | null>(null);
  const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false);

  const sortedSessions = [...(sessions ?? [])].sort((a, b) => {
    const dateA = new Date(a.startedAt ?? a.createdAt).getTime();
    const dateB = new Date(b.startedAt ?? b.createdAt).getTime();
    return dateB - dateA;
  });

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    await deleteSession.mutateAsync(sessionToDelete.id);
    setSessionToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Review session history and open detailed attendance exports."
        action={
          <Button onClick={() => setIsMonthlyDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Monthly Report
          </Button>
        }
      />

      {isError && <ErrorState message={error?.message} onRetry={refetch} />}

      {isLoading && (
        <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0">
          <CardContent className="px-0">
            <ReportsTableSkeleton />
          </CardContent>
        </Card>
      )}

      {!isLoading && sessions && sessions.length === 0 && (
        <EmptyState
          icon={<FileBarChart className="h-10 w-10" />}
          title="No sessions yet"
          description="Session reports will appear here after sessions are created."
        />
      )}
      {!isLoading && sessions && sessions.length > 0 && (
        <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0">
          <CardContent className="px-0">
            <ReportsTable sessions={sortedSessions} onDelete={setSessionToDelete} />
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        title="Are you absolutely sure?"
        description={`This will permanently delete the session "${sessionToDelete?.name}" and all of its attendance records. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteSession.isPending}
        onConfirm={handleDelete}
      />

      <MonthlyReportDialog
        open={isMonthlyDialogOpen}
        onOpenChange={setIsMonthlyDialogOpen}
        sessions={sessions}
      />
    </>
  );
}
