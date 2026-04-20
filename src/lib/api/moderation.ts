import { apiFetch } from "./client";
import type { ModerationActionRequest } from "@/types/api";

export async function moderateUser(token: string, body: ModerationActionRequest) {
  return apiFetch<unknown>("/api/v1/admin/moderate-user", {
    method: "POST",
    body,
    token,
  });
}
