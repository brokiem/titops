import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSession, fetchEnrichedAttendance, fetchScanRequests, updateSessionMode, closeSession, deleteAttendance } from "@/api/sessions";
import type { SessionDto, EnrichedAttendanceDto, ScanRequestDto, SessionMode } from "@/types/api";
import { toast } from "sonner";

export function useSession(id: string): {
  session: SessionDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["session", id],
    queryFn: () => fetchSession(id),
    refetchInterval: 3000,
  });

  return { session: data, isLoading, isError, error, refetch };
}

export function useEnrichedAttendance(sessionId: string): {
  attendance: EnrichedAttendanceDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["session", sessionId, "enriched-attendance"],
    queryFn: () => fetchEnrichedAttendance(sessionId),
    refetchInterval: 3000,
  });

  return { attendance: data, isLoading, isError, error, refetch };
}

export function useUnknownScans(sessionId: string): {
  scans: ScanRequestDto[] | undefined;
  isLoading: boolean;
  refetch: () => void;
} {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["session", sessionId, "scans", "UNKNOWN_CARD"],
    queryFn: () => fetchScanRequests(sessionId, "UNKNOWN_CARD"),
    refetchInterval: 5000,
  });

  return { scans: data, isLoading, refetch };
}

export function useUpdateSessionMode(): {
  mutateAsync: (args: { id: string; mode: SessionMode }) => Promise<SessionDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: SessionMode }) => updateSessionMode(id, mode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session", variables.id] });
      toast.success(`Mode changed to ${variables.mode}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update mode");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useCloseSession(): {
  mutateAsync: (id: string) => Promise<SessionDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => closeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session closed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close session");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useDeleteAttendance(): {
  mutateAsync: (args: { sessionId: string; attendanceId: string }) => Promise<unknown>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ sessionId, attendanceId }: { sessionId: string; attendanceId: string }) => deleteAttendance(sessionId, attendanceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session", variables.sessionId, "enriched-attendance"] });
      toast.success("Attendance record removed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove attendance record");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
