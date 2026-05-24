"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserActivityLogDrawer } from "@/components/activity-logs/UserActivityLogDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import type { UserResponse } from "@/types/api";

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [drawerUser, setDrawerUser] = useState<{ id: string; username: string } | null>(null);

  const q = useDebounce(searchInput, 400);

  const { data, isLoading, error } = useUsers(page, q || undefined);
  const list: UserResponse[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const err = error as Error | null;

  function handleSearch(val: string) {
    setSearchInput(val);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Người dùng</h1>
          {data?.totalElements != null && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.totalElements.toLocaleString()} tài khoản
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            id="users-search"
            type="text"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm username hoặc email…"
            className="w-64 rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            🔍
          </span>
        </div>
      </div>

      <QueryState isLoading={isLoading} error={err}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-t border-border transition hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r.name}
                          className={[
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            r.name === "SYSTEM_ADMIN"
                              ? "bg-red-500/10 text-red-600"
                              : r.name === "BUSINESS_ADMIN"
                              ? "bg-violet-500/10 text-violet-600"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.isDeleted ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Đã xóa
                      </span>
                    ) : u.isLocked ? (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
                        Khóa
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{u.credits}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        id={`user-activity-${u.id}`}
                        onClick={() => setDrawerUser({ id: u.id, username: u.username })}
                        className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                      >
                        Activity
                      </button>
                      <Link
                        href={`/dashboard/system/users/${u.id}`}
                        className="text-xs font-medium text-primary underline hover:opacity-75"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {list.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {q ? `Không tìm thấy "${q}".` : "Không có dữ liệu."}
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent disabled:opacity-40"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </QueryState>

      {/* User Activity Log Drawer */}
      {drawerUser && (
        <UserActivityLogDrawer
          userId={drawerUser.id}
          username={drawerUser.username}
          onClose={() => setDrawerUser(null)}
        />
      )}
    </div>
  );
}
