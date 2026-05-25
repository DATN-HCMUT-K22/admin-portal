"use client";

import { useState } from "react";
import type { ActivityLog } from "@/types/api";
import { LogDetailModal } from "./LogDetailModal";

interface Props {
  logs: ActivityLog[];
  totalElements?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  /** Ẩn cột "Người dùng" khi đang xem log của 1 user cụ thể */
  hideUser?: boolean;
}

const ACTION_BADGE_CLASS: Record<string, string> = {
  CREATED: "bg-emerald-500/10 text-emerald-600",
  UPDATED: "bg-blue-500/10 text-blue-600",
  DELETED: "bg-red-500/10 text-red-600",
  LIKED: "bg-pink-500/10 text-pink-600",
  JOINED: "bg-violet-500/10 text-violet-600",
  LOGIN: "bg-sky-500/10 text-sky-600",
  LOGOUT: "bg-slate-500/10 text-slate-600",
  SENT: "bg-orange-500/10 text-orange-600",
};

function actionBadgeClass(action: string): string {
  const verb = action.split("_").pop() ?? "";
  return ACTION_BADGE_CLASS[verb] ?? "bg-muted text-muted-foreground";
}

export function LogTable({
  logs,
  totalElements = 0,
  page = 1,
  onPageChange,
  hideUser = false,
}: Props) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              {!hideUser && (
                <th className="px-4 py-3 font-medium">Người dùng</th>
              )}
              <th className="px-4 py-3 font-medium">Hành động</th>
              <th className="px-4 py-3 font-medium">Đối tượng</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-border transition hover:bg-muted/30"
              >
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(log.created_at).toLocaleString("vi-VN")}
                </td>
                {!hideUser && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.user.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={log.user.avatarUrl}
                          alt={log.user.username}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {log.user.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{log.user.username}</span>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      actionBadgeClass(log.action),
                    ].join(" ")}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {log.entity_type ? (
                    <span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="ml-1 text-muted-foreground">
                          #{log.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {log.ip_address ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-xs font-medium text-primary underline hover:opacity-75"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Không có dữ liệu.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} — {totalElements} bản ghi
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent disabled:opacity-40"
            >
              ← Trước
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent disabled:opacity-40"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
