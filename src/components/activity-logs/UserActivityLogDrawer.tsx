"use client";

import { useState } from "react";
import { useUserActivityLogs } from "@/hooks/use-admin-queries";
import { ActivityLogTabs, getTabActions } from "./ActivityLogTabs";
import { LogTable } from "./LogTable";
import type { ActivityTabKey } from "@/types/api";

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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Drawer panel */}
      <div className="flex h-full w-full max-w-3xl flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Activity Log</h2>
            <p className="text-sm text-muted-foreground">
              Người dùng: <span className="font-medium text-foreground">{username}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-6 pt-4">
          <ActivityLogTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
      </div>
    </div>
  );
}
