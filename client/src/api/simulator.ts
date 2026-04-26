import { get, post } from "./client";
import type {
  CreatedMachineDto,
  MachineDto,
  ScanRequestInput,
  ScanRequestResultDto,
} from "@/types/api";

export async function getScanners(): Promise<CreatedMachineDto[]> {
  return get<CreatedMachineDto[]>("/api/machines");
}

export async function sendPing(
  machineId: string,
  machineKey: string
): Promise<MachineDto> {
  return post<MachineDto>(`/api/machines/${machineId}/heartbeat`, undefined, {
    "x-machine-key": machineKey,
  });
}

export async function sendScan(
  machineId: string,
  machineKey: string,
  data: ScanRequestInput
): Promise<ScanRequestResultDto> {
  return post<ScanRequestResultDto>(
    `/api/machines/${machineId}/scan-requests`,
    data,
    { "x-machine-key": machineKey }
  );
}
