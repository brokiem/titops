import { createContext } from "react";
import type { LoginInput } from "@/api/auth";
import type { AdminAccountDto } from "@/types/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  admin: AdminAccountDto | null;
  token: string | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
