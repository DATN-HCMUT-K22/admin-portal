"use client";

import { useState } from "react";
import { useActivityLogs } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ActivityLogTabs, getTabActions } from "@/components/activity-logs/ActivityLogTabs";
import { LogTable } from "@/components/activity-logs/LogTable";
import { usePermissions } from "@/components/auth/PermissionGate";
import type { ActivityTabKey } from "@/types/api";
import { Typography, Tag, Result } from "antd";

const { Title, Text } = Typography;

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
        <Result
          status="403"
          title="Không có quyền truy cập"
          subTitle="Chỉ SYSTEM_ADMIN mới có thể xem nhật ký hoạt động hệ thống."
        />
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
          <Title level={4} style={{ margin: 0 }}>Nhật ký hoạt động</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Toàn bộ lịch sử hành động của người dùng trong hệ thống
          </Text>
        </div>
        {data?.totalElements != null && (
          <Tag color="processing" style={{ margin: 0, padding: "4px 12px", fontSize: 14 }}>
            {data.totalElements.toLocaleString()} bản ghi
          </Tag>
        )}
      </div>

      {/* Entity tabs */}
      <ActivityLogTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <div className="mt-4">
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
