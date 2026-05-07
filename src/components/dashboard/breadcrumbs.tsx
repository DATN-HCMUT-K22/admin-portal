"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pathMap: Record<string, string> = {
  dashboard: "Tổng quan",
  system: "Quản trị",
  business: "BA",
  moderation: "Kiểm duyệt",
  users: "Người dùng",
  roles: "Vai trò & quyền",
  reports: "Báo cáo",
  statistics: "Thống kê người dùng",
  "activity-logs": "Nhật ký hoạt động",
  feedbacks: "Phản hồi",
  moderate: "Điều phối user",
  locations: "Địa điểm (POI)",
  administrative: "Ranh giới hành chính",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on dashboard root
  if (segments.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-foreground transition">
        Trang chủ
      </Link>
      {segments.slice(1).map((segment, idx) => {
        const href = '/' + segments.slice(0, idx + 2).join('/');
        const label = pathMap[segment] || segment;
        const isLast = idx === segments.length - 2;

        // Skip UUIDs and dynamic route segments
        if (segment.match(/^[a-f0-9-]{36}$/i) || segment.match(/^\[.*\]$/)) {
          return null;
        }

        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-muted-foreground/50">/</span>
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
