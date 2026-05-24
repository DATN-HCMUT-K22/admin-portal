import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type {
  CreateUserWithRolesRequest,
  Paginated,
  UserResponse,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest,
} from "@/types/api";

const prefix = "/api/v1/users";

/** GET /api/v1/users/me — trả về UserResponse đầy đủ */
export async function getMe() {
  const raw = await apiFetch<unknown>(`${prefix}/me`);
  return unwrapData<UserResponse>(raw);
}

/** [SYSTEM_ADMIN] GET /api/v1/users — danh sách users với search */
export async function listUsers(params?: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const q = new URLSearchParams();
  if (params?.q) q.set("q", params.q);
  if (params?.page != null) q.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) q.set("size", String(params.pageSize));
  const qs = q.toString();
  const raw = await apiFetch<unknown>(`${prefix}${qs ? `?${qs}` : ""}`);
  return unwrapData<Paginated<UserResponse>>(raw);
}

/** [SYSTEM_ADMIN] GET /api/v1/users/{userId}/admin-view — chi tiết đầy đủ */
export async function getUser(userId: string) {
  const raw = await apiFetch<unknown>(`${prefix}/${userId}/admin-view`);
  return unwrapData<UserResponse>(raw);
}

/** [SYSTEM_ADMIN] PATCH /api/v1/users/{userId}/status — khóa / mở khóa */
export async function updateUserStatus(
  userId: string,
  body: UserStatusUpdateRequest
) {
  const raw = await apiFetch<unknown>(`${prefix}/${userId}/status`, {
    method: "PATCH",
    body,
  });
  return unwrapData<UserResponse>(raw);
}

/** [SYSTEM_ADMIN] PUT /api/v1/users/{userId}/roles — gán roles */
export async function updateUserRoles(
  userId: string,
  body: UserRoleUpdateRequest
) {
  const raw = await apiFetch<unknown>(`${prefix}/${userId}/roles`, {
    method: "PUT",
    body,
  });
  return unwrapData<UserResponse>(raw);
}

/** [SYSTEM_ADMIN] POST /api/v1/users/with-roles — tạo user kèm roles */
export async function createUserWithRoles(body: CreateUserWithRolesRequest) {
  const raw = await apiFetch<unknown>(`${prefix}/with-roles`, {
    method: "POST",
    body,
  });
  return unwrapData<UserResponse>(raw);
}

/** [SYSTEM_ADMIN] DELETE /api/v1/users/{userId} — xóa user */
export async function deleteUser(userId: string) {
  return apiFetch<unknown>(`${prefix}/${userId}`, {
    method: "DELETE",
  });
}
