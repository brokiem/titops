import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentAdmin, login as loginRequest } from "@/api/auth";
import type { LoginInput } from "@/api/auth";
import type { AdminAccountDto } from "@/types/api";
import { clearStoredAuth, getStoredAdmin, getStoredToken, storeAuth } from "./auth-storage";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [admin, setAdmin] = useState<AdminAccountDto | null>(() => getStoredAdmin());
  const [status, setStatus] = useState<AuthStatus>(() => (getStoredToken() ? "loading" : "unauthenticated"));

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    fetchCurrentAdmin()
      .then((account) => {
        if (cancelled) {
          return;
        }

        storeAuth(token, account);
        setAdmin(account);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) {
          logout();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [logout, token]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginRequest(input);
    storeAuth(result.token, result.admin);
    setToken(result.token);
    setAdmin(result.admin);
    setStatus("authenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      status,
      login,
      logout,
    }),
    [admin, login, logout, status, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
