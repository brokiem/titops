import type { AdminAccountDto } from "@/types/api";

const TOKEN_KEY = "auth-token";
const ADMIN_KEY = "auth-admin";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredAdmin = (): AdminAccountDto | null => {
  const value = localStorage.getItem(ADMIN_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AdminAccountDto;
  } catch {
    localStorage.removeItem(ADMIN_KEY);
    return null;
  }
};

export const storeAuth = (token: string, admin: AdminAccountDto) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};
