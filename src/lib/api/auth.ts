import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type { ApiEnvelope } from "./envelope";
import type { AuthLoginData } from "@/types/api";

const prefix = "/api/v1/auth";

export async function login(body: { username: string; password: string }) {
  const raw = await apiFetch<unknown>(`${prefix}/login`, {
    method: "POST",
    body,
  });
  if (raw && typeof raw === "object" && "code" in raw) {
    const env = raw as ApiEnvelope<AuthLoginData>;
    if (env.code !== 1000) {
      throw new Error(
        typeof env.message === "string" && env.message
          ? env.message
          : "Đăng nhập thất bại."
      );
    }
  }
  return unwrapData<AuthLoginData>(raw);
}

/**
 * Refresh: ưu tiên body refreshToken; nếu không có thì gửi Bearer (một số backend chỉ cần cookie/header).
 */
export async function refreshSession(params: {
  refreshToken?: string;
  accessToken?: string;
}) {
  const body =
    params.refreshToken != null && params.refreshToken !== ""
      ? { refreshToken: params.refreshToken }
      : undefined;

  const raw = await apiFetch<unknown>(`${prefix}/refresh`, {
    method: "POST",
    body: body ?? {},
    token: params.accessToken ?? null,
  });

  return unwrapData<AuthLoginData>(raw);
}
