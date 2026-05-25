import { apiFetch } from "./client";

export interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  rating: number;
  type: string;
  status: string;
  userId: string;
  receiverId?: string;
  parentFeedbackId?: string;
  reportContentId?: string;
  created_at?: string;
}

export async function listFeedbacks(
  params?: { page?: number; pageSize?: number }
) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiFetch<FeedbackItem[] | { items: FeedbackItem[] }>(
    `/api/v1/feedbacks${qs ? `?${qs}` : ""}`
  );
}

export async function getFeedback(id: string) {
  return apiFetch<FeedbackItem>(`/api/v1/feedbacks/${id}`);
}

export async function respondToFeedback(id: string, body: { description: string; status?: string }) {
  return apiFetch(`/api/v1/feedbacks/${id}/respond`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
