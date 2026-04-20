"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAdminStore, type PortalMode } from "@/stores/admin-store";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/cn";

const systemLinks = [
  { href: "/dashboard/system/users", label: "Người dùng" },
  { href: "/dashboard/system/roles", label: "Vai trò & quyền" },
];

const moderationLinks = [
  { href: "/dashboard/moderation/reports", label: "Báo cáo" },
  { href: "/dashboard/moderation/feedbacks", label: "Phản hồi" },
  { href: "/dashboard/moderation/moderate", label: "Điều phối user" },
];

const businessLinks = [
  { href: "/dashboard/business/locations", label: "Địa điểm (POI)" },
  {
    href: "/dashboard/business/administrative",
    label: "Ranh giới hành chính",
  },
];

function NavSection({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <nav className="flex flex-col gap-0.5">
        {links.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const portalMode = useAdminStore((s) => s.portalMode);
  const setPortalMode = useAdminStore((s) => s.setPortalMode);
  const { hasAdmin, hasBa } = useAuth();

  const effectiveMode = useMemo((): PortalMode => {
    if (hasAdmin && !hasBa) return "system";
    if (!hasAdmin && hasBa) return "business";
    return portalMode;
  }, [hasAdmin, hasBa, portalMode]);

  const showPortalSwitcher = hasAdmin && hasBa;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className={cn(
          "w-full shrink-0 border-b border-border md:w-64 md:border-b-0 md:border-r",
          effectiveMode === "system"
            ? "bg-muted"
            : "bg-muted/90 ring-1 ring-emerald-500/15"
        )}
      >
        <div className="sticky top-0 flex flex-col p-4">
          <Link
            href="/dashboard"
            className="mb-6 block text-lg font-semibold tracking-tight text-foreground"
          >
            Admin Portal
          </Link>

          {showPortalSwitcher ? (
            <div className="mb-4 flex rounded-lg bg-secondary/90 p-1">
              {(
                [
                  ["system", "Hệ thống"],
                  ["business", "Kinh doanh"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPortalMode(mode as PortalMode)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    portalMode === mode
                      ? "bg-card text-card-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {effectiveMode === "system" && hasAdmin ? (
            <>
              <NavSection title="Quản trị" links={systemLinks} />
              <NavSection title="Kiểm duyệt" links={moderationLinks} />
            </>
          ) : null}
          {effectiveMode === "business" && hasBa ? (
            <NavSection title="Địa điểm & KD" links={businessLinks} />
          ) : null}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
