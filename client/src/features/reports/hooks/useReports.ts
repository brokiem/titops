import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSessions, fetchSession, fetchEnrichedAttendance, deleteSession } from "@/api/sessions";
import type { SessionDto, EnrichedAttendanceDto } from "@/types/api";
import { toast } from "sonner";

export function useAllSessions(): {
  sessions: SessionDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  return { sessions: data, isLoading, isError, error, refetch };
}

export function useReportDetail(id: string): {
  session: SessionDto | undefined;
  attendance: EnrichedAttendanceDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const sessionQuery = useQuery({
    queryKey: ["session", id],
    queryFn: () => fetchSession(id),
  });

  const attendanceQuery = useQuery({
    queryKey: ["session", id, "enriched-attendance"],
    queryFn: () => fetchEnrichedAttendance(id),
    enabled: !!sessionQuery.data,
  });

  return {
    session: sessionQuery.data,
    attendance: attendanceQuery.data,
    isLoading: sessionQuery.isLoading || attendanceQuery.isLoading,
    isError: sessionQuery.isError || attendanceQuery.isError,
    error: sessionQuery.error || attendanceQuery.error,
  };
}

export function useDeleteSession(): {
  mutateAsync: (id: string) => Promise<SessionDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete session");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
