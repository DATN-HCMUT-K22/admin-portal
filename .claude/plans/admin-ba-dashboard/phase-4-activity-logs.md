# Phase 4: Activity Logs + Polish

**Duration:** 5-6 days  
**Status:** ✅ COMPLETE  
**Goal:** ADMIN can audit system actions; finalize all UI refinements

---

## Objectives

- Build activity log viewer with advanced filtering
- Implement CSV export functionality
- Extract shared DataTable component
- Extract shared UserTable component
- Add loading skeletons and error boundaries
- Final UI polish and responsive design

---

## Tasks

### 1. Add Activity Log Types

**File:** `src/types/api.ts`

```typescript
export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

export interface ActivityLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
```

### 2. Create Activity Logs API Client

**File:** `src/lib/api/activity-logs.ts`

```typescript
import { apiFetch } from "./client";
import type { ActivityLog, ActivityLogParams, Paginated } from "@/types/api";

export async function listActivityLogs(
  token: string,
  params: ActivityLogParams = {}
): Promise<Paginated<ActivityLog>> {
  const query = new URLSearchParams();
  
  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  return apiFetch<Paginated<ActivityLog>>(
    `/api/v1/admin/activity-logs?${query}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function exportActivityLogs(
  token: string,
  params: ActivityLogParams = {}
): Promise<Blob> {
  const query = new URLSearchParams();
  
  if (params.userId) query.set("userId", params.userId);
  if (params.action) query.set("action", params.action);
  if (params.entityType) query.set("entityType", params.entityType);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/activity-logs/export?${query}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error("Export failed");
  }

  return response.blob();
}
```

### 3. Add Activity Log Hooks

**File:** `src/hooks/use-admin-queries.ts`

```typescript
// Add to existing file
import * as activityLogsApi from "@/lib/api/activity-logs";

export function useActivityLogs(params: ActivityLogParams = {}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "activity-logs", params],
    queryFn: () => activityLogsApi.listActivityLogs(tokenOrThrow(token), params),
    enabled: !!token,
    staleTime: 60_000, // 1 minute
  });
}

export function useExportLogs() {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (params: ActivityLogParams) =>
      activityLogsApi.exportActivityLogs(tokenOrThrow(token), params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
```

### 4. Create Log Filter Bar Component

**File:** `src/components/activity-logs/LogFilterBar.tsx`

```typescript
"use client";

import { useState } from "react";
import type { ActivityLogParams } from "@/types/api";

interface Props {
  onFilterChange: (filters: ActivityLogParams) => void;
  onExport: () => void;
  isExporting?: boolean;
}

export function LogFilterBar({ onFilterChange, onExport, isExporting }: Props) {
  const [filters, setFilters] = useState<ActivityLogParams>({});

  const handleChange = (key: keyof ActivityLogParams, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Người dùng</label>
          <input
            type="text"
            value={filters.userId || ""}
            onChange={(e) => handleChange("userId", e.target.value)}
            placeholder="User ID hoặc username"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Action Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Hành động</label>
          <select
            value={filters.action || ""}
            onChange={(e) => handleChange("action", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="CREATE">Tạo mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
            <option value="LOGIN">Đăng nhập</option>
            <option value="LOGOUT">Đăng xuất</option>
          </select>
        </div>

        {/* Entity Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Loại đối tượng</label>
          <select
            value={filters.entityType || ""}
            onChange={(e) => handleChange("entityType", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="USER">Người dùng</option>
            <option value="POST">Bài viết</option>
            <option value="COMMENT">Bình luận</option>
            <option value="REPORT">Báo cáo</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="mb-2 block text-sm font-medium">Từ ngày</label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
        >
          Xóa bộ lọc
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isExporting ? "Đang xuất..." : "Xuất CSV"}
        </button>
      </div>
    </div>
  );
}
```

### 5. Create Log Table Component

**File:** `src/components/activity-logs/LogTable.tsx`

```typescript
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
```

### 6. Create Log Detail Modal

**File:** `src/components/activity-logs/LogDetailModal.tsx`

```typescript
import type { ActivityLog } from "@/types/api";

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
}

export function LogDetailModal({ log, onClose }: Props) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chi tiết log</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="font-mono text-sm">{log.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Người dùng</p>
              <p className="font-medium">{log.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hành động</p>
              <p className="font-medium">{log.action}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
              <p>{new Date(log.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">IP Address</p>
              <p className="font-mono text-sm">{log.ipAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đối tượng</p>
              <p>
                {log.entityType} #{log.entityId}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">User Agent</p>
            <p className="text-xs text-muted-foreground">{log.userAgent}</p>
          </div>

          {log.payload && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Payload</p>
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-medium transition hover:bg-accent"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 7. Create Activity Logs Page

**File:** `src/app/dashboard/system/activity-logs/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useActivityLogs, useExportLogs } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { LogFilterBar } from "@/components/activity-logs/LogFilterBar";
import { LogTable } from "@/components/activity-logs/LogTable";
import type { ActivityLogParams } from "@/types/api";

export default function ActivityLogsPage() {
  const [filters, setFilters] = useState<ActivityLogParams>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useActivityLogs({ ...filters, page, pageSize: 20 });
  const exportMutation = useExportLogs();

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nhật ký hoạt động</h1>
      </div>

      <LogFilterBar
        onFilterChange={setFilters}
        onExport={handleExport}
        isExporting={exportMutation.isPending}
      />

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <LogTable
          logs={data?.items || []}
          total={data?.total}
          page={page}
          onPageChange={setPage}
        />
      </QueryState>
    </div>
  );
}
```

### 8. Create Loading Skeleton Component

**File:** `src/components/common/LoadingSkeleton.tsx`

```typescript
interface Props {
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/80">
          <tr>
            {[1, 2, 3, 4, 5].map((i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="h-[300px] animate-pulse rounded bg-muted/50" />
    </div>
  );
}
```

### 9. Extract Shared UserTable Component

**File:** `src/components/users/UserTable.tsx`

Extract from `/dashboard/system/users/page.tsx`:

```typescript
import Link from "next/link";
import type { UserAdminView } from "@/types/api";

interface Props {
  users: UserAdminView[];
  showActions?: boolean; // false for BA read-only
}

export function UserTable({ users, showActions = true }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/80">
          <tr>
            <th className="px-4 py-3 font-medium">Username</th>
            <th className="px-4 py-3 font-medium">Họ tên</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Credits</th>
            {showActions && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-4 py-3">{u.username}</td>
              <td className="px-4 py-3">{u.fullName}</td>
              <td className="px-4 py-3">
                {u.isDeleted ? (
                  <span className="text-muted-foreground">Đã xóa</span>
                ) : u.isLocked ? (
                  <span className="text-amber-600">Khóa</span>
                ) : (
                  <span className="text-primary">Hoạt động</span>
                )}
              </td>
              <td className="px-4 py-3">{u.credits}</td>
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/system/users/${u.id}`}
                    className="font-medium text-foreground underline"
                  >
                    Chi tiết
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Không có dữ liệu.
        </p>
      )}
    </div>
  );
}
```

### 10. Create BA Users Page (Read-Only)

**File:** `src/app/dashboard/business/users/page.tsx`

```typescript
"use client";

import { useUsers } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserTable } from "@/components/users/UserTable";
import { normalizeItems } from "@/lib/list-utils";
import type { UserAdminView } from "@/types/api";

export default function BusinessUsersPage() {
  const { data, isLoading, error } = useUsers(1);
  const users = normalizeItems(
    data as UserAdminView[] | { items: UserAdminView[] } | undefined
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Danh sách người dùng</h1>
      <p className="text-sm text-muted-foreground">Chế độ xem chỉ đọc</p>
      
      <QueryState isLoading={isLoading} error={error as Error | null}>
        <UserTable users={users} showActions={false} />
      </QueryState>
    </div>
  );
}
```

---

## Verification

After completing Phase 4, verify:

- [ ] Activity log page loads with filters
- [ ] User, action, entity type filters work
- [ ] Date range filter works
- [ ] Pagination works (prev/next buttons)
- [ ] CSV export downloads file
- [ ] Log detail modal shows full information
- [ ] BA users page shows read-only table
- [ ] No action buttons visible for BA role
- [ ] Loading skeletons display during fetch
- [ ] All pages are responsive on mobile
- [ ] No console errors

---

## Files Created

- ➕ `src/lib/api/activity-logs.ts`
- ✏️ `src/types/api.ts` - Add ActivityLog types
- ✏️ `src/hooks/use-admin-queries.ts` - Add activity log hooks
- ➕ `src/components/activity-logs/LogFilterBar.tsx`
- ➕ `src/components/activity-logs/LogTable.tsx`
- ➕ `src/components/activity-logs/LogDetailModal.tsx`
- ➕ `src/components/common/LoadingSkeleton.tsx`
- ➕ `src/components/users/UserTable.tsx` - Extracted
- ➕ `src/app/dashboard/system/activity-logs/page.tsx`
- ➕ `src/app/dashboard/business/users/page.tsx`

---

**Implementation Complete!** ✅

Return to [Overview](./00-overview.md) for final checklist.
