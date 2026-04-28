import { get, post, patch, del } from "./client";
import type {
  SessionDto,
  EnrichedAttendanceDto,
  ScanRequestDto,
  SessionCreateInput,
  SessionUpdateInput,
  ScanOutcome,
} from "@/types/api";
const API_URL = import.meta.env.VITE_API_URL;

export function fetchSessions(): Promise<SessionDto[]> {
  return get<SessionDto[]>(`${API_URL}/api/sessions`);
}

export function fetchSession(id: string): Promise<SessionDto> {
  return get<SessionDto>(`${API_URL}/api/sessions/${id}`);
}

export function createSession(data: SessionCreateInput): Promise<SessionDto> {
  return post<SessionDto>(`${API_URL}/api/sessions`, data);
}

export function updateSession(id: string, data: SessionUpdateInput): Promise<SessionDto> {
  return patch<SessionDto>(`${API_URL}/api/sessions/${id}`, data);
}

export function updateSessionMode(id: string, mode: string): Promise<SessionDto> {
  return patch<SessionDto>(`${API_URL}/api/sessions/${id}/mode`, { mode });
}

export function closeSession(id: string): Promise<SessionDto> {
  return post<SessionDto>(`${API_URL}/api/sessions/${id}/close`);
}

export function deleteSession(id: string): Promise<SessionDto> {
  return del<SessionDto>(`${API_URL}/api/sessions/${id}`);
}

export function fetchEnrichedAttendance(sessionId: string): Promise<EnrichedAttendanceDto[]> {
  return get<EnrichedAttendanceDto[]>(`${API_URL}/api/sessions/${sessionId}/enriched-attendance`);
}

export function fetchScanRequests(sessionId: string, outcome?: ScanOutcome): Promise<ScanRequestDto[]> {
  const params = outcome ? `?outcome=${outcome}` : "";
  return get<ScanRequestDto[]>(`${API_URL}/api/sessions/${sessionId}/scans${params}`);
}

export function deleteAttendance(sessionId: string, attendanceId: string): Promise<unknown> {
  return del(`${API_URL}/api/sessions/${sessionId}/attendance/${attendanceId}`);
}
