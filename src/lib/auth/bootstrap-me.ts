import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { useAdminStore } from "@/stores/admin-store";
import type { UserMe } from "@/types/api";

/** GET /me, tự refresh token khi 401 (theo authentication.md) */
export async function fetchMeWithOptionalRefresh(): Promise<UserMe> {
  const { bearerToken } = useAdminStore.getState();

  if (!bearerToken?.trim()) {
    throw new Error("Chưa có access token.");
  }

  return await usersApi.getMe();
}
