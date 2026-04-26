import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchScanners, createScanner, updateScanner, deleteScanner } from "@/api/scanners";
import type { MachineDto, CreatedMachineDto, ScannerCreateInput, ScannerUpdateInput } from "@/types/api";
import { toast } from "sonner";

export function useScanners(): {
  scanners: MachineDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["scanners"],
    queryFn: fetchScanners,
  });

  return { scanners: data, isLoading, isError, error, refetch };
}

export function useCreateScanner(): {
  mutateAsync: (data: ScannerCreateInput) => Promise<CreatedMachineDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: ScannerCreateInput) => createScanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
      toast.success("Scanner created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create scanner");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useDeleteScanner(): {
  mutateAsync: (id: string) => Promise<MachineDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => deleteScanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
      toast.success("Scanner deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete scanner");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useUpdateScanner(): {
  mutateAsync: (params: { id: string; data: ScannerUpdateInput }) => Promise<MachineDto>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScannerUpdateInput }) => updateScanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
      toast.success("Scanner updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update scanner");
    },
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
