import { apiFetch } from "./client";
import type {
  UserStatistics,
  ReportStatisticsResponse,
  AggregateUserStatisticsResponse,
  ContentStatisticsResponse,
  SystemHealthResponse,
} from "@/types/api";

// ============= Individual User Statistics =============

export async function getUserStatistics(
  userId: string
): Promise<UserStatistics> {
  return apiFetch<UserStatistics>(
    `/api/v1/admin/user-statistics/${userId}`,
    {
      method: "GET",
    }
  );
}



// ============= Aggregate Analytics APIs (từ comprehensive guide) =============

/**
 * GET /api/v1/admin/stats/reports
 * Lấy aggregate report statistics với trends
 */
export async function getReportStatistics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ReportStatisticsResponse> {
  const q = new URLSearchParams();
  if (params?.startDate) q.set("startDate", params.startDate);
  if (params?.endDate) q.set("endDate", params.endDate);
  const qs = q.toString();

  return apiFetch<ReportStatisticsResponse>(
    `/api/v1/admin/stats/reports${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

/**
 * GET /api/v1/admin/stats/users
 * Lấy aggregate user statistics (khác với getUserStatistics cá nhân)
 */
export async function getAggregateUserStatistics(): Promise<AggregateUserStatisticsResponse> {
  return apiFetch<AggregateUserStatisticsResponse>(
    `/api/v1/admin/stats/users`,
    { method: "GET" }
  );
}

/**
 * GET /api/v1/admin/stats/content
 * Lấy aggregate content statistics
 */
export async function getContentStatistics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ContentStatisticsResponse> {
  const q = new URLSearchParams();
  if (params?.startDate) q.set("startDate", params.startDate);
  if (params?.endDate) q.set("endDate", params.endDate);
  const qs = q.toString();

  return apiFetch<ContentStatisticsResponse>(
    `/api/v1/admin/stats/content${qs ? `?${qs}` : ""}`,
    { method: "GET" }
  );
}

/**
 * GET /api/v1/admin/stats/system-health
 * Lấy system health metrics
 */
export async function getSystemHealth(): Promise<SystemHealthResponse> {
  return apiFetch<SystemHealthResponse>(
    `/api/v1/admin/stats/system-health`,
    { method: "GET" }
  );
}
