import { apiFetch } from "./client";
import type { HandleReportRequest, ReportDetail, ContentType, ReportStatus } from "@/types/api";

export interface ReportListParams {
  contentType?: ContentType;
  status?: ReportStatus;
  page?: number;
  pageSize?: number;
}

export async function listReports(
  params?: ReportListParams
) {
  const q = new URLSearchParams();
  if (params?.contentType) q.set("contentType", params.contentType);
  if (params?.status) q.set("status", params.status);
  if (params?.page != null) q.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiFetch<ReportDetail[] | { items: ReportDetail[] }>(
    `/api/v1/reports${qs ? `?${qs}` : ""}`
  );
}

export async function getReport(reportId: string) {
  return apiFetch<ReportDetail>(`/api/v1/reports/${reportId}`);
}

export async function handleReport(
  reportId: string,
  body: HandleReportRequest
) {
  return apiFetch<unknown>(`/api/v1/reports/${reportId}/handle`, {
    method: "POST",
    body,
  });
}
