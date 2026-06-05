import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type {
  SystemConfigResponse,
  SystemConfigUpdateRequest,
} from "@/types/api";

const prefix = "/api/v1/admin/configs";

/** [SYSTEM_ADMIN] GET /api/v1/admin/configs — Lấy danh sách cấu hình hệ thống */
export async function getAllConfigs() {
  const raw = await apiFetch<unknown>(prefix);
  return unwrapData<SystemConfigResponse[]>(raw);
}

/** [SYSTEM_ADMIN] PATCH /api/v1/admin/configs/{key} — Cập nhật cấu hình */
export async function updateConfig(
  key: string,
  body: SystemConfigUpdateRequest
) {
  const raw = await apiFetch<unknown>(`${prefix}/${key}`, {
    method: "PATCH",
    body,
  });
  return unwrapData<SystemConfigResponse>(raw);
}
