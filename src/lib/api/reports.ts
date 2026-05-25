import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type { HandleReportRequest, ReportDetail, ContentType, ReportStatus, Paginated } from "@/types/api";

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
  const raw = await apiFetch<unknown>(
    `/api/v1/reports${qs ? `?${qs}` : ""}`
  );
  return unwrapData<Paginated<ReportDetail>>(raw);
}

export async function getReport(reportId: string) {
  const raw = await apiFetch<unknown>(`/api/v1/reports/${reportId}`);
  return unwrapData<ReportDetail>(raw);
}

export async function handleReport(
  reportId: string,
  body: HandleReportRequest
) {
  const raw = await apiFetch<unknown>(`/api/v1/reports/${reportId}/handle`, {
    method: "POST",
    body,
  });
  return unwrapData<unknown>(raw);
}
