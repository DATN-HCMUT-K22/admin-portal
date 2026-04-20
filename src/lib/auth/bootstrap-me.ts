import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { useAdminStore } from "@/stores/admin-store";
import type { UserMe } from "@/types/api";

/** GET /me, tự refresh token khi 401 (theo authentication.md) */
export async function fetchMeWithOptionalRefresh(): Promise<UserMe> {
  const { bearerToken, refreshToken, setSession, logout } =
    useAdminStore.getState();

  if (!bearerToken?.trim()) {
    throw new Error("Chưa có access token.");
  }

  const load = (token: string) => usersApi.getMe(token);

  try {
    return await load(bearerToken);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401) {
      throw e;
    }

    try {
      const data = await authApi.refreshSession({
        refreshToken: refreshToken || undefined,
        accessToken: bearerToken,
      });
      setSession({
        accessToken: data.token,
        refreshToken: data.refreshToken ?? refreshToken,
      });
      return await load(useAdminStore.getState().bearerToken);
    } catch {
      logout();
      throw e;
    }
  }
}
