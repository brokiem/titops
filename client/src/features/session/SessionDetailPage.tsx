import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SessionHeader } from "./components/SessionHeader";
import { SessionHeaderSkeleton } from "./components/SessionHeaderSkeleton";
import { AttendanceTable } from "./components/AttendanceTable";
import { UnknownCardAlert } from "./components/UnknownCardAlert";
import { useSession, useEnrichedAttendance, useUnknownScans, useUpdateSessionMode, useCloseSession, useDeleteAttendance } from "./hooks/useSession";
import type { EnrichedAttendanceDto } from "@/types/api";

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, isLoading, isError, error, refetch } = useSession(id!);
  const { attendance, isLoading: attendanceLoading, isError: attendanceError, error: attError, refetch: attRefetch } = useEnrichedAttendance(id!);
  const { scans } = useUnknownScans(id!);
  const updateMode = useUpdateSessionMode();
  const closeSession = useCloseSession();
  const deleteAttendance = useDeleteAttendance();

  const [closeOpen, setCloseOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<EnrichedAttendanceDto | null>(null);

  if (isError || (!session && !isLoading)) return <ErrorState message={error?.message} onRetry={refetch} />;

  const handleToggleMode = async () => {
    if (!session) return;
    const nextMode = session.mode === "CLOCK_IN" ? "CLOCK_OUT" : "CLOCK_IN";
    await updateMode.mutateAsync({ id: session.id, mode: nextMode });
  };

  const handleClose = async () => {
    if (!session) return;
    await closeSession.mutateAsync(session.id);
    setCloseOpen(false);
    navigate("/dashboard/reports");
  };

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
      {isLoading ? (
        <SessionHeaderSkeleton />
      ) : (
        session && (
          <SessionHeader
            session={session}
            attendanceCount={attendance?.length ?? 0}
            onToggleMode={handleToggleMode}
            onClose={() => setCloseOpen(true)}
            modeLoading={updateMode.isPending}
          />
        )
      )}

      {session?.isActive && <UnknownCardAlert scans={scans} />}

      <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0">
        <CardContent className="px-0">
          <AttendanceTable
            attendance={attendance}
            isLoading={attendanceLoading}
            isError={attendanceError}
            error={attError}
            refetch={attRefetch}
            onDelete={setRecordToDelete}
          />
        </CardContent>
      </Card>

      {session && (
        <ConfirmDialog
          open={closeOpen}
          onOpenChange={setCloseOpen}
          title="Close Session"
          description={`Are you sure you want to close "${session.name}"? This action cannot be undone. You will be redirected to reports.`}
          confirmLabel="Close Session"
          variant="destructive"
          loading={closeSession.isPending}
          onConfirm={handleClose}
        />
      )}

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
