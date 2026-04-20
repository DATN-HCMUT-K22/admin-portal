"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function TopBar() {
  const router = useRouter();
  const { user, hasAdmin, hasBa, logout, isLoading } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {user?.fullName ?? user?.username ?? "—"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {isLoading
            ? "Đang tải…"
            : [hasAdmin && "ADMIN", hasBa && "BA"].filter(Boolean).join(" · ") ||
              "Portal"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/home"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Trang người dùng
        </Link>
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
