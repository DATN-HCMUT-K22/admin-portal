"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useAdminStore } from "@/stores/admin-store";
import {
  canAccessDashboardPath,
  canUseAdminPortal,
} from "@/lib/auth/paths";
import { DashboardSkeleton } from "./dashboard-skeleton";

export function DashboardAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAdminStore((s) => s.bearerToken);
  const { user, isLoading, profileError, refetchProfile, logout } = useAuth();

  const needLogin = !isLoading && !token?.trim();

  useEffect(() => {
    if (needLogin) {
      const q = pathname ? `?returnUrl=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${q}`);
    }
  }, [needLogin, pathname, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (needLogin) {
    return <DashboardSkeleton />;
  }

  if (profileError && token?.trim()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <p className="text-center text-sm text-muted-foreground">
          Không tải được hồ sơ người dùng. Token có thể đã hết hạn.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => refetchProfile()}
          >
            Thử lại
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm"
            onClick={() => {
              logout();
              const q = pathname
                ? `?returnUrl=${encodeURIComponent(pathname)}`
                : "";
              router.replace(`/login${q}`);
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  if (user && !canUseAdminPortal(user.roles)) {
    router.replace("/home");
    return <DashboardSkeleton />;
  }

  if (user && !canAccessDashboardPath(pathname, user.roles)) {
    router.replace("/403");
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
}
