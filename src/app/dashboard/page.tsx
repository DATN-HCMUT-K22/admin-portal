"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getPostLoginRedirectPath } from "@/lib/auth/paths";
import { DashboardSkeleton } from "@/components/auth/dashboard-skeleton";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      const target = getPostLoginRedirectPath(user.roles);
      if (target === "/dashboard") {
        router.replace("/dashboard/system/users");
      } else {
        router.replace(target);
      }
    }
  }, [user, isLoading, router]);

  return <DashboardSkeleton />;
}
