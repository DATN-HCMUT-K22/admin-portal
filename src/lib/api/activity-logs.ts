import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type {
  ActivityLog,
  ActivityLogParams,
  Paginated,
} from "@/types/api";

const prefix = "/api/v1/activity-logs";

function buildPageParams(params: ActivityLogParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.action) q.set("action", params.action);
  // Spring Pageable: page 0-indexed
  if (params.page != null) q.set("page", String(Math.max(0, params.page - 1)));
  if (params.size != null) q.set("size", String(params.size));
  if (params.sort) q.set("sort", params.sort);
  return q;
}

/**
 * [SYSTEM_ADMIN] GET /api/v1/activity-logs
 * Lấy tất cả activity logs trong hệ thống. Lọc tuỳ chọn theo action.
 */
export async function listActivityLogs(params: ActivityLogParams = {}) {
  const q = buildPageParams(params);
  const qs = q.toString();
  const raw = await apiFetch<unknown>(`${prefix}${qs ? `?${qs}` : ""}`);
  return unwrapData<Paginated<ActivityLog>>(raw);
}

/**
 * [Authenticated] GET /api/v1/activity-logs/me
 * Lấy activity log của user đang đăng nhập.
 */
export async function listMyActivityLogs(params: ActivityLogParams = {}) {
  const q = buildPageParams(params);
  const qs = q.toString();
  const raw = await apiFetch<unknown>(`${prefix}/me${qs ? `?${qs}` : ""}`);
  return unwrapData<Paginated<ActivityLog>>(raw);
}

/**
 * [SYSTEM_ADMIN] GET /api/v1/activity-logs/users/{userId}
 * Lấy activity log của một user cụ thể.
 */
export async function getUserActivityLogs(
  userId: string,
  params: ActivityLogParams = {}
) {
  const q = buildPageParams(params);
  const qs = q.toString();
  const raw = await apiFetch<unknown>(
    `${prefix}/users/${userId}${qs ? `?${qs}` : ""}`
  );
  return unwrapData<Paginated<ActivityLog>>(raw);
}

/**
 * [SYSTEM_ADMIN] GET /api/v1/activity-logs/entities/{entityType}/{entityId}
 * Lấy toàn bộ audit trail của một entity cụ thể (không phân trang).
 */
export async function getEntityAuditTrail(
  entityType: string,
  entityId: string
) {
  const raw = await apiFetch<unknown>(
    `${prefix}/entities/${entityType}/${entityId}`
  );
  return unwrapData<ActivityLog[]>(raw);
}
