"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import { useAuth } from "@/providers/auth-provider";
import { useAdminStore } from "@/stores/admin-store";
import { getPostLoginRedirectPath } from "@/lib/auth/paths";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const setSession = useAdminStore((s) => s.setSession);
  const { isLoading: authLoading, user, hasAdmin, hasBa } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    if (hasAdmin || hasBa) {
      router.replace(getPostLoginRedirectPath(user.roles));
    } else {
      router.replace("/home");
    }
  }, [authLoading, user, hasAdmin, hasBa, router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await authApi.login({ username: username.trim(), password });
      setSession({
        accessToken: data.token,
        refreshToken: data.refreshToken,
      });
      const token = useAdminStore.getState().bearerToken;
      const me = await usersApi.getMe(token);
      await qc.invalidateQueries({ queryKey: ["auth"] });
      const returnUrl = searchParams.get("returnUrl");
      const safeReturn =
        returnUrl &&
        returnUrl.startsWith("/") &&
        !returnUrl.startsWith("//") &&
        !returnUrl.startsWith("/login")
          ? returnUrl
          : null;
      const target = safeReturn ?? getPostLoginRedirectPath(me.roles);
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          TripJoy — cổng quản trị &amp; kinh doanh
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Tên đăng nhập
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
