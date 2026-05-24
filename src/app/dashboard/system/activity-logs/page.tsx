"use client";

import { useState } from "react";
import { useActivityLogs } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ActivityLogTabs, getTabActions } from "@/components/activity-logs/ActivityLogTabs";
import { LogTable } from "@/components/activity-logs/LogTable";
import { usePermissions } from "@/components/auth/PermissionGate";
import type { ActivityTabKey } from "@/types/api";

export default function ActivityLogsPage() {
  const { isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<ActivityTabKey>("all");
  const [page, setPage] = useState(1);

  const actionFilter = getTabActions(activeTab);

  const { data, isLoading, error } = useActivityLogs({
    action: actionFilter,
    page,
    size: 20,
    sort: "createdAt,desc",
  });

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-destructive">
            Không có quyền truy cập
          </h1>
          <p className="mt-2 text-muted-foreground">
            Chỉ SYSTEM_ADMIN mới có thể xem nhật ký hoạt động hệ thống.
          </p>
        </div>
      </div>
    );
  }

  function handleTabChange(tab: ActivityTabKey) {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Nhật ký hoạt động</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Toàn bộ lịch sử hành động của người dùng trong hệ thống
          </p>
        </div>
        {data?.totalElements != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {data.totalElements.toLocaleString()} bản ghi
          </span>
        )}
      </div>

      {/* Entity tabs */}
      <ActivityLogTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <div className="space-y-4">
          <LogTable
            logs={data?.content ?? []}
            totalElements={data?.totalElements}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </QueryState>
    </div>
  );
}
