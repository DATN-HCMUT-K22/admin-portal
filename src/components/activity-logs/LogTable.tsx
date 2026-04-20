"use client";

import { useState } from "react";
import type { ActivityLog } from "@/types/api";
import { LogDetailModal } from "./LogDetailModal";

interface Props {
  logs: ActivityLog[];
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function LogTable({ logs, total = 0, page = 1, onPageChange }: Props) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted/80">
            <tr>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Người dùng</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
              <th className="px-4 py-3 font-medium">Đối tượng</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {new Date(log.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 font-medium">{log.username}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground">{log.entityType}</span>
                  <span className="ml-1 text-xs">#{log.entityId.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{log.ipAddress}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="font-medium text-primary underline"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Không có dữ liệu.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} (Tổng: {total} bản ghi)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-border px-3 py-1 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded-lg border border-border px-3 py-1 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}
