import { apiFetch } from "./client";
import type { UserStatistics } from "@/types/api";

export async function getUserStatistics(
  token: string,
  userId: string
): Promise<UserStatistics> {
  return apiFetch<UserStatistics>(
    `/api/v1/admin/user-statistics/${userId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      token,
    }
  );
}

export async function searchUsers(
  token: string,
  query: string
): Promise<Array<{ id: string; username: string; fullName: string }>> {
  return apiFetch(`/api/v1/admin/users/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    token,
  });
}
