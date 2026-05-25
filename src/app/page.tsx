"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getPostLoginRedirectPath } from "@/lib/auth/paths";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, hasAdmin, hasBa } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || !user) return;
    if (hasAdmin || hasBa) {
      router.replace(getPostLoginRedirectPath(user.roles));
    } else {
      router.replace("/home");
    }
  }, [mounted, isLoading, user, hasAdmin, hasBa, router]);

  if (!mounted || isLoading || (user && (hasAdmin || hasBa))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-secondary" />
        <div className="h-4 w-64 animate-pulse rounded bg-secondary/70" />
      </div>
    );
  }

  if (user && !hasAdmin && !hasBa) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-secondary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">TripJoy</h1>
        <p className="mt-3 text-muted-foreground">
          Cổng quản trị hệ thống và kinh doanh. Đăng nhập để tiếp tục.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex w-fit rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Đăng nhập
      </Link>
    </div>
  );
}
