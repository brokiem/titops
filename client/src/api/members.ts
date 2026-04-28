import { get, post, patch, del } from "./client";
import type { MemberDto, CardAssignmentDto, MemberCreateInput, MemberUpdateInput, CardAssignInput } from "@/types/api";
const API_URL = import.meta.env.VITE_API_URL;

export function fetchMembers(): Promise<MemberDto[]> {
  return get<MemberDto[]>(`${API_URL}/api/members`);
}

export function fetchMember(id: string): Promise<MemberDto> {
  return get<MemberDto>(`${API_URL}/api/members/${id}`);
}

export function createMember(data: MemberCreateInput): Promise<MemberDto> {
  return post<MemberDto>(`${API_URL}/api/members`, data);
}

export function updateMember(id: string, data: MemberUpdateInput): Promise<MemberDto> {
  return patch<MemberDto>(`${API_URL}/api/members/${id}`, data);
}

export function deleteMember(id: string): Promise<MemberDto> {
  return del<MemberDto>(`${API_URL}/api/members/${id}`);
}

export function fetchMemberCard(memberId: string): Promise<CardAssignmentDto | null> {
  return get<CardAssignmentDto | null>(`${API_URL}/api/members/${memberId}/card`);
}

export function assignCard(memberId: string, data: CardAssignInput): Promise<CardAssignmentDto> {
  return post<CardAssignmentDto>(`${API_URL}/api/members/${memberId}/cards`, data);
}
