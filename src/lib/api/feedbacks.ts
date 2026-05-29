import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type { Paginated, UserSimpleResponse } from "@/types/api";

export interface ParentFeedbackSimpleResponse {
  id: string;
  title: string;
  status: string;
}

export interface ReportContentSimpleResponse {
  id: string;
  content_type: string;
  reported_entity_id: string;
  report_type: string;
  status: string;
  reported_content_text?: string;
  reported_media_url?: string;
  reporter?: UserSimpleResponse;
  reported_user?: UserSimpleResponse;
}

export interface FeedbackResponse {
  id: string;
  title: string;
  content: string;
  rating: number;
  type: string; // e.g. "BUG_REPORT", "SUGGESTION", "ADMIN_RESPONSE", "REPORT_FEEDBACK", "OTHER"
  status: string; // e.g. "OPEN", "REPLIED", "RESOLVED", "SENT"
  userId: string;
  sender?: UserSimpleResponse;
  receiverId?: string;
  receiver?: UserSimpleResponse;
  parent_feedback?: ParentFeedbackSimpleResponse;
  report?: ReportContentSimpleResponse;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

export interface FeedbackResponseResponse {
  id: string;
  feedback_id: string;
  responded_by: UserSimpleResponse;
  response_for: UserSimpleResponse;
  created_at: string;
  description: string;
  status: string;
}

export interface FeedbackItem extends FeedbackResponse {}

export async function listFeedbacks(
  params?: { page?: number; size?: number; sort?: string }
) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.size != null) q.set("size", String(params.size));
  if (params?.sort != null) q.set("sort", params.sort);
  const qs = q.toString();
  const raw = await apiFetch<unknown>(
    `/api/v1/feedbacks${qs ? `?${qs}` : ""}`
  );
  return unwrapData<Paginated<FeedbackResponse>>(raw);
}

export async function getFeedback(id: string) {
  const raw = await apiFetch<unknown>(`/api/v1/feedbacks/${id}`);
  return unwrapData<FeedbackResponse>(raw);
}

export async function respondToFeedback(
  id: string,
  body: { description: string; status?: string }
) {
  const raw = await apiFetch<unknown>(`/api/v1/feedbacks/${id}/respond`, {
    method: "POST",
    body,
  });
  return unwrapData<FeedbackResponseResponse>(raw);
}

