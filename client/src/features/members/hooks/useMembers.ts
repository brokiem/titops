import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMembers, createMember, updateMember, deleteMember, assignCard } from "@/api/members";
import type { MemberDto, MemberCreateInput, MemberUpdateInput, CardAssignInput } from "@/types/api";
import { toast } from "sonner";

export function useMembers(): {
  members: MemberDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  return { members: data, isLoading, isError, error, refetch };
}

export function useCreateMember(): {
  mutate: (data: MemberCreateInput) => void;
  mutateAsync: (data: MemberCreateInput) => Promise<MemberDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: MemberCreateInput) => createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create member");
    },
  });

  return { mutate: mutation.mutate, mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useUpdateMember(): {
  mutateAsync: (args: { id: string; data: MemberUpdateInput }) => Promise<MemberDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberUpdateInput }) => updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useDeleteMember(): {
  mutateAsync: (id: string) => Promise<MemberDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete member");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useAssignCard(): {
  mutateAsync: (args: { memberId: string; data: CardAssignInput }) => Promise<unknown>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: CardAssignInput }) => assignCard(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Card assigned successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign card");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
