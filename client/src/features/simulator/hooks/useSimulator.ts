import { useMutation, useQuery } from "@tanstack/react-query";
import { getScanners, sendPing, sendScan } from "@/api/simulator";
import type {
  MachineDto,
  ScanRequestResultDto,
  ScanRequestInput,
  CreatedMachineDto,
} from "@/types/api";

export function useGetScanners() {
  return useQuery<CreatedMachineDto[]>({
    queryKey: ["scanners"],
    queryFn: getScanners,
  });
}

export function useSendPing(): {
  mutateAsync: (args: { machineId: string; machineKey: string }) => Promise<MachineDto>;
  isPending: boolean;
} {
  const mutation = useMutation({
    mutationFn: ({ machineId, machineKey }: { machineId: string; machineKey: string }) =>
      sendPing(machineId, machineKey),
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}

export function useSendScan(): {
  mutateAsync: (args: {
    machineId: string;
    machineKey: string;
    data: ScanRequestInput;
  }) => Promise<ScanRequestResultDto>;
  isPending: boolean;
} {
  const mutation = useMutation({
    mutationFn: ({
      machineId,
      machineKey,
      data,
    }: {
      machineId: string;
      machineKey: string;
      data: ScanRequestInput;
    }) => sendScan(machineId, machineKey, data),
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
