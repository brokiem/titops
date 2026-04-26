import { get, post, patch, del } from "./client";
import type { MemberDto, CardAssignmentDto, MemberCreateInput, MemberUpdateInput, CardAssignInput } from "@/types/api";

export function fetchMembers(): Promise<MemberDto[]> {
  return get<MemberDto[]>("/api/members");
}

export function fetchMember(id: string): Promise<MemberDto> {
  return get<MemberDto>(`/api/members/${id}`);
}

export function createMember(data: MemberCreateInput): Promise<MemberDto> {
  return post<MemberDto>("/api/members", data);
}

export function updateMember(id: string, data: MemberUpdateInput): Promise<MemberDto> {
  return patch<MemberDto>(`/api/members/${id}`, data);
}

export function deleteMember(id: string): Promise<MemberDto> {
  return del<MemberDto>(`/api/members/${id}`);
}

export function fetchMemberCard(memberId: string): Promise<CardAssignmentDto | null> {
  return get<CardAssignmentDto | null>(`/api/members/${memberId}/card`);
}

export function assignCard(memberId: string, data: CardAssignInput): Promise<CardAssignmentDto> {
  return post<CardAssignmentDto>(`/api/members/${memberId}/cards`, data);
}
