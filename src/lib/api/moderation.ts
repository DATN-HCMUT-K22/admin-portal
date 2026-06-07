import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type {
  ModerationActionRequest,
  ModerationActionResponse,
  Paginated,
} from "@/types/api";

/**
 * [BUSINESS_ADMIN | SYSTEM_ADMIN] POST /api/v1/admins/moderate-user
 * Thực hiện moderation action lên user.
 * Lưu ý: user_id là snake_case theo API spec.
 */
export async function moderateUser(body: ModerationActionRequest) {
  const raw = await apiFetch<unknown>("/api/v1/admin/moderate-user", {
    method: "POST",
    body,
  });
  return unwrapData<ModerationActionResponse>(raw);
}

/**
 * GET /api/v1/admin/moderation-actions
 * Lấy danh sách moderation actions với filters.
 * NOTE: API có thể chưa implement, sẽ fail gracefully.
 */
export async function listModerationActions(params?: {
  userId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<ModerationActionResponse>> {
  const q = new URLSearchParams();
  if (params?.userId) q.set("userId", params.userId);
  if (params?.actionType) q.set("actionType", params.actionType);
  if (params?.startDate) q.set("startDate", params.startDate);
  if (params?.endDate) q.set("endDate", params.endDate);
  if (params?.page != null) q.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) q.set("size", String(params.pageSize));
  const qs = q.toString();

  try {
    const raw = await apiFetch<unknown>(
      `/api/v1/admin/moderation-actions${qs ? `?${qs}` : ""}`
    );
    return unwrapData<Paginated<ModerationActionResponse>>(raw);
  } catch (error) {
    console.warn("listModerationActions API is pending. Using graceful fallback:", error);
    return {
      content: [],
      pageable: {
        pageNumber: params?.page ? Math.max(0, params.page - 1) : 0,
        pageSize: params?.pageSize || 20,
      },
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
  }
}

/**
 * Lấy moderation history của 1 user cụ thể.
 * Gọi API GET /api/v1/users/{userId}/moderations
 */
export async function getUserModerationHistory(
  userId: string,
  params?: { page?: number; pageSize?: number }
): Promise<ModerationActionResponse[]> {
  try {
    const q = new URLSearchParams();
    if (params?.page != null) q.set("page", String(Math.max(0, params.page - 1)));
    if (params?.pageSize != null) q.set("size", String(params.pageSize));
    else q.set("size", "100");
    q.set("sort", "createdAt,desc");

    const raw = await apiFetch<unknown>(
      `/api/v1/users/${userId}/moderations?${q.toString()}`
    );
    const paginated = unwrapData<Paginated<ModerationActionResponse>>(raw);
    return paginated.content || [];
  } catch (error) {
    console.warn(`getUserModerationHistory API failed for user ${userId}. Using graceful fallback:`, error);
    return [];
  }
}
