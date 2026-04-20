"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/stores/admin-store";
import { fetchMeWithOptionalRefresh } from "@/lib/auth/bootstrap-me";
import * as paths from "@/lib/auth/paths";
import type { UserMe } from "@/types/api";

export type AuthContextValue = {
  user: UserMe | undefined;
  hasAdmin: boolean;
  hasBa: boolean;
  /** Đã hydrate store + (không token hoặc đã có profile / lỗi tường minh) */
  isLoading: boolean;
  isAuthenticated: boolean;
  profileError: Error | null;
  refetchProfile: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const bearerToken = useAdminStore((s) => s.bearerToken);
  const logoutStore = useAdminStore((s) => s.logout);
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === "undefined") return false;
    return useAdminStore.persist?.hasHydrated() === true;
  });

  useEffect(() => {
    const p = useAdminStore.persist;
    if (!p) {
      setHydrated(true);
      return;
    }
    if (p.hasHydrated()) setHydrated(true);
    return p.onFinishHydration(() => setHydrated(true));
  }, []);

  const hasToken = !!bearerToken?.trim();

  const query = useQuery({
    queryKey: ["auth", "me", bearerToken],
    queryFn: fetchMeWithOptionalRefresh,
    enabled: hydrated && hasToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = useCallback(() => {
    logoutStore();
    qc.removeQueries({ queryKey: ["auth"] });
  }, [logoutStore, qc]);

  const user = query.data;
  const hasAdmin = paths.hasRole(user?.roles, paths.ROLE_ADMIN);
  const hasBa = paths.hasRole(user?.roles, paths.ROLE_BA);
  const isLoading = !hydrated || (hasToken && query.isPending);
  const isAuthenticated = hasToken && !!user && !query.isError;

  const value: AuthContextValue = {
    user,
    hasAdmin,
    hasBa,
    isLoading,
    isAuthenticated,
    profileError: query.error instanceof Error ? query.error : null,
    refetchProfile: () => {
      void query.refetch();
    },
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth chỉ dùng bên trong AuthProvider.");
  }
  return ctx;
}
