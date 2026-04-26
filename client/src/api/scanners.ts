import { get, post, patch, del } from "./client";
import type { MachineDto, CreatedMachineDto, ScannerCreateInput, ScannerUpdateInput } from "@/types/api";

export function fetchScanners(): Promise<MachineDto[]> {
  return get<MachineDto[]>("/api/machines");
}

export function fetchScanner(id: string): Promise<MachineDto> {
  return get<MachineDto>(`/api/machines/${id}`);
}

export function createScanner(data: ScannerCreateInput): Promise<CreatedMachineDto> {
  return post<CreatedMachineDto>("/api/machines", data);
}

export function updateScanner(id: string, data: ScannerUpdateInput): Promise<MachineDto> {
  return patch<MachineDto>(`/api/machines/${id}`, data);
}

export function deleteScanner(id: string): Promise<MachineDto> {
  return del<MachineDto>(`/api/machines/${id}`);
}
