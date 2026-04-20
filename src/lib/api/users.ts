import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type {
  Paginated,
  UserAdminView,
  UserMe,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest,
} from "@/types/api";

const prefix = "/api/v1/users";

export async function getMe(token: string) {
  const raw = await apiFetch<unknown>(`${prefix}/me`, { token });
  return unwrapData<UserMe>(raw);
}

export async function listUsers(
  token: string,
  params?: { page?: number; pageSize?: number }
) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.pageSize != null) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiFetch<Paginated<UserAdminView> | UserAdminView[]>(
    `${prefix}${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export async function getUser(token: string, userId: string) {
  return apiFetch<UserAdminView>(`${prefix}/${userId}`, { token });
}

export async function updateUserStatus(
  token: string,
  userId: string,
  body: UserStatusUpdateRequest
) {
  return apiFetch<unknown>(`${prefix}/${userId}/status`, {
    method: "POST",
    body,
    token,
  });
}

export async function updateUserRoles(
  token: string,
  userId: string,
  body: UserRoleUpdateRequest
) {
  return apiFetch<unknown>(`${prefix}/${userId}/roles`, {
    method: "POST",
    body,
    token,
  });
}
