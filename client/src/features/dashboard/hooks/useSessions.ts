import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSessions, createSession } from "@/api/sessions";
import type { SessionDto, SessionCreateInput } from "@/types/api";
import { toast } from "sonner";

export function useSessions(): {
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

export function useActiveSessions(): {
  activeSession: SessionDto | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    select: (sessions) => sessions.find((session) => session.isActive) ?? null,
  });

  return { activeSession: data, isLoading, isError, error, refetch };
}

export function useCreateSession(): {
  mutateAsync: (data: SessionCreateInput) => Promise<SessionDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: SessionCreateInput) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create session");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
