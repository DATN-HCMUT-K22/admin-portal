import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PortalMode = "system" | "business";

/** SSR: localStorage không tồn tại — dùng storage rỗng để persist middleware vẫn gắn `api.persist`. */
function getAdminStorage() {
  if (typeof window !== "undefined") return window.localStorage;
  const noop: Storage = {
    length: 0,
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    removeItem: () => undefined,
    setItem: () => undefined,
  };
  return noop;
}

type AdminState = {
  bearerToken: string;
  refreshToken: string;
  portalMode: PortalMode;
  setBearerToken: (token: string) => void;
  setSession: (payload: {
    accessToken: string;
    refreshToken?: string;
  }) => void;
  setPortalMode: (mode: PortalMode) => void;
  logout: () => void;
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      bearerToken: "",
      refreshToken: "",
      portalMode: "system",
      setBearerToken: (token) => set({ bearerToken: token }),
      setSession: ({ accessToken, refreshToken }) =>
        set({
          bearerToken: accessToken,
          refreshToken: refreshToken ?? "",
        }),
      setPortalMode: (mode) => set({ portalMode: mode }),
      logout: () =>
        set({
          bearerToken: "",
          refreshToken: "",
          portalMode: "system",
        }),
    }),
    {
      name: "admin-portal",
      storage: createJSONStorage(getAdminStorage),
      partialize: (s) => ({
        bearerToken: s.bearerToken,
        refreshToken: s.refreshToken,
        portalMode: s.portalMode,
      }),
    }
  )
);
