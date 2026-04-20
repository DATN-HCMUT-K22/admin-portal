"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

/** Khu vực người dùng thường (USER) — không phải portal quản trị */
export default function HomeUserPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">TripJoy</h1>
        <p className="mt-2 text-muted-foreground">
          Trang dành cho tài khoản người dùng. Quản trị viên đăng nhập qua{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            cổng đăng nhập
          </Link>
          .
        </p>
      </div>
      {!isLoading && user ? (
        <p className="text-sm text-muted-foreground">
          Xin chào, <strong className="text-foreground">{user.fullName || user.username}</strong>.
        </p>
      ) : null}
      <Link
        href="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
