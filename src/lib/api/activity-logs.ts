import { apiFetch } from "./client";
import type { ActivityLog, ActivityLogParams, Paginated } from "@/types/api";

export async function listActivityLogs(
  token: string,
  params: ActivityLogParams = {}
): Promise<Paginated<ActivityLog>> {
  const query = new URLSearchParams();

  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  return apiFetch<Paginated<ActivityLog>>(
    `/api/v1/admin/activity-logs?${query}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      token,
    }
  );
}

export async function exportActivityLogs(
  token: string,
  params: ActivityLogParams = {}
): Promise<Blob> {
  const query = new URLSearchParams();

  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/activity-logs/export?${query}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error("Export failed");
  }

  return response.blob();
}
