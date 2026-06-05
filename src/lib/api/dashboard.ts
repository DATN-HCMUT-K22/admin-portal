import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type { AdminDashboardOverviewResponse } from "@/types/api";

/**
 * GET /api/v1/admin/dashboard/overview
 * Retrieves aggregated high-level business metrics for the admin dashboard.
 */
export async function getAdminDashboardOverview(): Promise<AdminDashboardOverviewResponse> {
  const raw = await apiFetch<unknown>(
    `/api/v1/admin/dashboard/overview`,
    { method: "GET" }
  );
  return unwrapData<AdminDashboardOverviewResponse>(raw);
}
