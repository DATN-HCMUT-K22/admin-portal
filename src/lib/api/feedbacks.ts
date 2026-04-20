import { apiFetch } from "./client";

export interface FeedbackItem {
  id: string;
  [key: string]: unknown;
}

export async function listFeedbacks(
  token: string,
  params?: { page?: number; pageSize?: number }
) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.pageSize != null) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return apiFetch<FeedbackItem[] | { items: FeedbackItem[] }>(
    `/api/v1/feedbacks${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export async function getFeedback(token: string, id: string) {
  return apiFetch<FeedbackItem>(`/api/v1/feedbacks/${id}`, { token });
}
