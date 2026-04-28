import { get, post } from "./client";
import type {
  CreatedMachineDto,
  MachineDto,
  ScanRequestInput,
  ScanRequestResultDto,
} from "@/types/api";
const API_URL = import.meta.env.VITE_API_URL;

export async function getScanners(): Promise<CreatedMachineDto[]> {
   return get<CreatedMachineDto[]>(`${API_URL}/api/machines`);}

export async function sendPing(
  machineId: string,
  machineKey: string
): Promise<MachineDto> {
  return post<MachineDto>(`${API_URL}/api/machines/${machineId}/heartbeat`, undefined, {
    "x-machine-key": machineKey,
  });
}

export async function sendScan(
  machineId: string,
  machineKey: string,
  data: ScanRequestInput
): Promise<ScanRequestResultDto> {
  return post<ScanRequestResultDto>(
    `${API_URL}/api/machines/${machineId}/scan-requests`,
    data,
    { "x-machine-key": machineKey }
  );
}
