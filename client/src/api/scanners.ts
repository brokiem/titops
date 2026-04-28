import { get, post, patch, del } from "./client";
import type { MachineDto, CreatedMachineDto, ScannerCreateInput, ScannerUpdateInput } from "@/types/api";
const API_URL = import.meta.env.VITE_API_URL;

export function fetchScanners(): Promise<MachineDto[]> {
  return get<MachineDto[]>(`${API_URL}/api/machines`);
}

export function fetchScanner(id: string): Promise<MachineDto> {
  return get<MachineDto>(`${API_URL}/api/machines/${id}`);
}

export function createScanner(data: ScannerCreateInput): Promise<CreatedMachineDto> {
  return post<CreatedMachineDto>(`${API_URL}/api/machines`, data);
}

export function updateScanner(id: string, data: ScannerUpdateInput): Promise<MachineDto> {
  return patch<MachineDto>(`${API_URL}/api/machines/${id}`, data);
}

export function deleteScanner(id: string): Promise<MachineDto> {
  return del<MachineDto>(`${API_URL}/api/machines/${id}`);
}
