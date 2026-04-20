# Phase 1: Report Management Foundation

**Duration:** 3-4 days  
**Status:** ✅ COMPLETE  
**Goal:** BA can filter and view enhanced report details

---

## Objectives

- Add content type filtering (POST, COMMENT, USER tabs)
- Add status filtering (dropdown)
- Create color-coded status badges
- Enhance report list UI with better information display

---

## Tasks

### 1. Install Dependencies

```bash
npm install recharts
```

### 2. Add Type Definitions

**File:** `src/types/api.ts`

```typescript
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'PROCESSED' | 'DISMISSED' | 'ESCALATED';
export type ViolationType = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'MISINFORMATION' 
  | 'INAPPROPRIATE_CONTENT' | 'COPYRIGHT' | 'IMPERSONATION' | 'OTHER';
export type ContentType = 'POST' | 'COMMENT' | 'USER';

export interface ReportDetail {
  id: string;
  contentType: ContentType;
  violationType: ViolationType;
  status: ReportStatus;
  reporter: { id: string; username: string };
  reportedEntity: { id: string; content?: string; userId?: string };
  createdAt: string;
  handledAt?: string;
  handledBy?: { username: string };
  description?: string;
}
```

### 3. Enhance API Client

**File:** `src/lib/api/reports.ts`

Add filter parameters:

```typescript
interface ReportListParams {
  contentType?: ContentType;
  status?: ReportStatus;
  page?: number;
  pageSize?: number;
}

export async function listReports(token: string, params?: ReportListParams) {
  const query = new URLSearchParams();
  if (params?.contentType) query.set('contentType', params.contentType);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  
  return apiFetch<ReportDetail[]>(`/api/v1/reports?${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

### 4. Update Query Keys

**File:** `src/lib/query-keys.ts`

```typescript
export const queryKeys = {
  admin: {
    // ... existing keys
    reports: (params?: { status?: string; contentType?: string }) => 
      ["admin", "reports", params] as const,
    report: (id: string) => ["admin", "report", id] as const,
  },
};
```

### 5. Update Hook

**File:** `src/hooks/use-admin-queries.ts`

```typescript
export function useReports(params?: { contentType?: ContentType; status?: ReportStatus }) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.reports(params),
    queryFn: () => reportsApi.listReports(tokenOrThrow(token), params),
    enabled: !!token?.trim(),
    staleTime: 60_000, // 1 minute
  });
}
```

### 6. Create Status Badge Component

**File:** `src/components/reports/ReportStatusBadge.tsx`

```typescript
import type { ReportStatus } from "@/types/api";

interface Props {
  status: ReportStatus;
}

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "Đang chờ", className: "text-amber-600" },
  UNDER_REVIEW: { label: "Đang xem xét", className: "text-blue-600" },
  PROCESSED: { label: "Đã xử lý", className: "text-green-600" },
  DISMISSED: { label: "Đã bỏ qua", className: "text-gray-500" },
  ESCALATED: { label: "Đã leo thang", className: "text-red-600" },
};

export function ReportStatusBadge({ status }: Props) {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <span className={`font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
```

### 7. Create Filter Bar Component

**File:** `src/components/reports/ReportFilterBar.tsx`

```typescript
"use client";

import { useState } from "react";
import type { ContentType, ReportStatus } from "@/types/api";

interface Props {
  onFilterChange: (filters: { contentType?: ContentType; status?: ReportStatus }) => void;
}

const contentTypes: { value: ContentType; label: string }[] = [
  { value: "POST", label: "Bài viết" },
  { value: "COMMENT", label: "Bình luận" },
  { value: "USER", label: "Người dùng" },
];

const statuses: { value: ReportStatus; label: string }[] = [
  { value: "PENDING", label: "Đang chờ" },
  { value: "UNDER_REVIEW", label: "Đang xem xét" },
  { value: "PROCESSED", label: "Đã xử lý" },
  { value: "DISMISSED", label: "Đã bỏ qua" },
  { value: "ESCALATED", label: "Đã leo thang" },
];

export function ReportFilterBar({ onFilterChange }: Props) {
  const [activeTab, setActiveTab] = useState<ContentType | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | undefined>();

  const handleTabChange = (type: ContentType | undefined) => {
    setActiveTab(type);
    onFilterChange({ contentType: type, status: selectedStatus });
  };

  const handleStatusChange = (status: ReportStatus | undefined) => {
    setSelectedStatus(status);
    onFilterChange({ contentType: activeTab, status });
  };

  return (
    <div className="space-y-4">
      {/* Content Type Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => handleTabChange(undefined)}
          className={`px-4 py-2 font-medium transition ${
            !activeTab
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tất cả
        </button>
        {contentTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleTabChange(type.value)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === type.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Trạng thái:</label>
        <select
          value={selectedStatus || ""}
          onChange={(e) => handleStatusChange(e.target.value as ReportStatus || undefined)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

### 8. Create Report Card Component

**File:** `src/components/reports/ReportCard.tsx`

```typescript
import Link from "next/link";
import { ReportStatusBadge } from "./ReportStatusBadge";
import type { ReportDetail } from "@/types/api";

interface Props {
  report: ReportDetail;
}

export function ReportCard({ report }: Props) {
  return (
    <div className="rounded-xl border border-border p-4 transition hover:bg-accent/50">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-medium">Báo cáo #{report.id.slice(0, 8)}</h3>
          <p className="text-sm text-muted-foreground">
            Loại vi phạm: {report.violationType}
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Người báo cáo:</span>{" "}
          <span className="font-medium">{report.reporter.username}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Loại nội dung:</span>{" "}
          <span className="font-medium">{report.contentType}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Thời gian:</span>{" "}
          {new Date(report.createdAt).toLocaleString("vi-VN")}
        </div>
      </div>

      <div className="mt-4 text-right">
        <Link
          href={`/dashboard/business/reports/${report.id}`}
          className="font-medium text-primary underline"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
```

### 9. Update Reports Page

**File:** `src/app/dashboard/business/reports/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useReports } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ReportFilterBar } from "@/components/reports/ReportFilterBar";
import { ReportCard } from "@/components/reports/ReportCard";
import { normalizeItems } from "@/lib/list-utils";
import type { ContentType, ReportStatus, ReportDetail } from "@/types/api";

export default function ReportsPage() {
  const [filters, setFilters] = useState<{ 
    contentType?: ContentType; 
    status?: ReportStatus 
  }>({});

  const { data, isLoading, error } = useReports(filters);
  const reports = normalizeItems(data as ReportDetail[] | { items: ReportDetail[] } | undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Quản lý báo cáo</h1>

      <ReportFilterBar onFilterChange={setFilters} />

      <QueryState isLoading={isLoading} error={error as Error | null}>
        {reports.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Không có báo cáo nào.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
```

---

## Verification

After completing Phase 1, verify:

- [ ] Report list shows content type tabs (Tất cả, Bài viết, Bình luận, Người dùng)
- [ ] Status filter dropdown works
- [ ] Clicking tabs filters reports by content type
- [ ] Selecting status filters reports correctly
- [ ] Status badges show correct colors
- [ ] Report cards display all information
- [ ] "Xem chi tiết" links work

---

## Files Modified

- ✏️ `src/types/api.ts` - Add types
- ✏️ `src/lib/api/reports.ts` - Add filter params
- ✏️ `src/lib/query-keys.ts` - Update reports key
- ✏️ `src/hooks/use-admin-queries.ts` - Update useReports
- ➕ `src/components/reports/ReportStatusBadge.tsx`
- ➕ `src/components/reports/ReportFilterBar.tsx`
- ➕ `src/components/reports/ReportCard.tsx`
- ✏️ `src/app/dashboard/business/reports/page.tsx`

---

**Next:** [Phase 2 - Report Handling Workflow](./phase-2-report-handling.md)
