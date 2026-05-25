"use client";

import { useState } from "react";
import { useUserActivityLogs } from "@/hooks/use-admin-queries";
import { ActivityLogTabs, getTabActions } from "./ActivityLogTabs";
import { LogTable } from "./LogTable";
import type { ActivityTabKey } from "@/types/api";
import { Drawer, Spin } from "antd";

interface Props {
  userId: string;
  username: string;
  onClose: () => void;
}

export function UserActivityLogDrawer({ userId, username, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<ActivityTabKey>("all");
  const [page, setPage] = useState(1);

  const actionFilter = getTabActions(activeTab);

  const { data, isLoading } = useUserActivityLogs(userId, {
    action: actionFilter,
    page,
    size: 20,
    sort: "createdAt,desc",
  });

  function handleTabChange(tab: ActivityTabKey) {
    setActiveTab(tab);
    setPage(1);
  }

  return (
    <Drawer
      title={
        <div>
          <h2 className="text-lg font-semibold">Activity Log</h2>
          <p className="text-sm font-normal text-muted-foreground">
            User: <span className="font-medium text-foreground">{username}</span>
          </p>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={true}
      width={768}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Tabs */}
      <div className="border-b border-border px-6 pt-4">
        <ActivityLogTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-4">
            <LogTable
              logs={data?.content ?? []}
              totalElements={data?.totalElements}
              page={page}
              onPageChange={setPage}
              hideUser
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}
