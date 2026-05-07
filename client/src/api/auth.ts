import { get, post } from "@/api/client";
import type { AdminAccountDto, LoginResultDto } from "@/types/api";

const API_URL = import.meta.env.VITE_API_URL;

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateAdminInput {
  email: string;
  name: string;
  password: string;
}

export function login(data: LoginInput) {
  return post<LoginResultDto>(`${API_URL}/api/auth/login`, data);
}

export function fetchCurrentAdmin() {
  return get<AdminAccountDto>(`${API_URL}/api/auth/me`);
}

export function createAdmin(data: CreateAdminInput) {
  return post<AdminAccountDto>(`${API_URL}/api/auth/admins`, data);
}
