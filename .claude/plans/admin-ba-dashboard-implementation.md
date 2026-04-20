# Implementation Plan: Admin & BA Dashboard Modules

**Date:** 2026-04-20  
**Project:** TripJoy Admin Portal Frontend  
**Base:** Next.js 16 + React Query + Zustand + Tailwind CSS

---

## Context

The TripJoy admin portal requires two role-based dashboards for content moderation and system administration. Based on comprehensive brainstorm requirements in `/media/ngocha/New Volume/admin-page/brain-storm/brainstorm-admin-ba-modules-2026-04-20.md`, we need to implement:

**Problem:** 
- Business Administrators (BA) need tools to handle user reports, view user statistics, and manage content quality
- System Administrators (ADMIN) need user management, role/permission controls, and activity log auditing
- Current implementation has basic scaffolding but lacks filtering, charts, and complete workflows

**Goal:**
Build production-ready dashboards with:
- Enhanced report management with filtering and action modals
- User statistics with charts and metrics visualization
- Activity log viewer with export capability
- Proper role-based access control

**Why extend vs rebuild:**
The codebase already has excellent foundations (auth provider, API client, React Query hooks, route guards). We'll enhance existing pages and add new modules following established patterns.

---

## Recommended Approach

### Strategy: Extend & Enhance Existing Infrastructure

**Phase 1 (Week 1):** Enhanced report management with filters and status badges  
**Phase 2 (Week 1-2):** Report handling workflow with action modal  
**Phase 3 (Week 2):** User statistics dashboard with charts  
**Phase 4 (Week 3):** Activity logs viewer and final polish

### Technical Decisions

1. **Charts:** Add Recharts library (40KB gzipped, React-native, TypeScript-friendly)
2. **Real-time:** Start with React Query polling (30s interval), defer WebSocket to Phase 4
3. **Tables:** Continue custom Tailwind pattern (`.rounded-xl border border-border`), create reusable `DataTable` component
4. **File Organization:** Co-locate features by module (reports, statistics, activity-logs)
5. **Language:** All Vietnamese copy (following existing pattern)

---

## Module Breakdown

### Module 1: Enhanced Report Management (BA Priority)

**Pages to Enhance:**
- `/dashboard/business/reports` - Add content type tabs (POST, COMMENT, USER) and status filters
- `/dashboard/business/reports/[reportId]` - Add action modal workflow

**New Components:**
```
src/components/reports/
├── ReportStatusBadge.tsx      # Color-coded badges (PENDING=yellow, PROCESSED=green, etc.)
├── ReportFilterBar.tsx        # Content type tabs + status dropdown
├── ReportCard.tsx             # Enhanced display with reporter, violation type, content snippet
└── HandleReportModal.tsx      # 3-step: Decision → Action → Reason
```

**API Enhancements:**
- Extend `src/lib/api/reports.ts` with filter params (contentType, status)
- Add type definitions for ReportStatus, ViolationType, ContentType
- Implement `handleReport()` endpoint wrapper

**Hooks:**
- Update `useReports()` to accept filter params
- Add `useReportStats()` for dashboard stats (pending count, etc.)

---

### Module 2: User Statistics Dashboard (BA)

**New Pages:**
- `/dashboard/business/statistics` - Search user + display charts and metrics

**New Components:**
```
src/components/statistics/
├── UserSearchBar.tsx          # Debounced search by username/email
├── StatCard.tsx               # Metric card (posts, violations, engagement)
├── ActivityChart.tsx          # Line chart (Recharts) - 30-day activity
├── ViolationPieChart.tsx      # Pie chart - violation type breakdown
└── ModerationHistoryTable.tsx # Recent moderation actions
```

**API:**
- Create `src/lib/api/statistics.ts` with `getUserStatistics()` function
- Interface: `UserStatistics` with activity, violations, timeline, moderationHistory

**Hooks:**
- Add `useUserStatistics(userId)` with 5-minute cache

---

### Module 3: Activity Log Viewer (ADMIN Only)

**New Pages:**
- `/dashboard/system/activity-logs` - Filterable log viewer with CSV export

**New Components:**
```
src/components/activity-logs/
├── LogFilterBar.tsx    # User, action, date range filters
├── LogTable.tsx        # Server-side pagination (20 items/page)
└── LogDetailModal.tsx  # Full log entry with JSON payload
```

**API:**
- Create `src/lib/api/activity-logs.ts` with `listActivityLogs()` and `exportActivityLogs()`
- Support filtering by user, action, entityType, dateRange

**Hooks:**
- Add `useActivityLogs(params)` with 1-minute cache
- Add `useExportLogs()` mutation that triggers CSV download

---

### Module 4: Shared User List (BA Read-Only)

**Approach:** Extract table component from `/dashboard/system/users/page.tsx`

**New Components:**
- `src/components/users/UserTable.tsx` - Reusable with `showActions` prop (false for BA)

**New Pages:**
- `/dashboard/business/users` - Same table, read-only (no lock/unlock or role assignment)

---

## Critical Files to Reference

Existing patterns to follow:

1. **`/media/ngocha/New Volume/admin-page/src/hooks/use-admin-queries.ts`**
   - Pattern for all data fetching hooks
   - Query invalidation on mutations
   - Token validation with `tokenOrThrow()`

2. **`/media/ngocha/New Volume/admin-page/src/app/dashboard/system/users/page.tsx`**
   - Table styling pattern with Tailwind
   - QueryState wrapper for loading/error states
   - Vietnamese labels and status badges

3. **`/media/ngocha/New Volume/admin-page/src/components/dashboard/dashboard-shell.tsx`**
   - Navigation structure and portal mode switching
   - Layout patterns for dashboard pages

4. **`/media/ngocha/New Volume/admin-page/src/lib/api/client.ts`**
   - `apiFetch()` function for all API calls
   - Error handling with ApiError class
   - Token injection pattern

5. **`/media/ngocha/New Volume/admin-page/src/lib/query-keys.ts`**
   - Query key organization: `["admin", "resource", identifier]`
   - Extend with new keys for statistics and activity-logs

6. **`/media/ngocha/New Volume/admin-page/src/lib/schemas/admin-forms.ts`**
   - Zod schema patterns for form validation
   - Vietnamese error messages

---

## Implementation Steps

### Phase 1: Report Management Foundation

**Dependencies:**
```bash
npm install recharts
```

**Type Definitions (`src/types/api.ts`):**
```typescript
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'PROCESSED' | 'DISMISSED' | 'ESCALATED';
export type ViolationType = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'MISINFORMATION' 
  | 'INAPPROPRIATE_CONTENT' | 'COPYRIGHT' | 'IMPERSONATION' | 'OTHER';
export type ContentType = 'POST' | 'COMMENT' | 'USER';
export type ModerationActionType = 'WARN_USER' | 'DELETE_CONTENT' | 'BAN_USER_TEMPORARY' 
  | 'BAN_USER_PERMANENT' | 'RESTORE_CONTENT' | 'UNBAN_USER';

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
}
```

**API Enhancement (`src/lib/api/reports.ts`):**
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

**Components:**
1. Create `ReportStatusBadge.tsx` with color mapping
2. Create `ReportFilterBar.tsx` with tabs (POST, COMMENT, USER) and status dropdown
3. Update `/dashboard/business/reports/page.tsx` to use filters

**Query Keys (`src/lib/query-keys.ts`):**
```typescript
reports: (params?: { status?: string; contentType?: string }) => 
  ["admin", "reports", params] as const,
```

---

### Phase 2: Report Handling Workflow

**Schema (`src/lib/schemas/admin-forms.ts`):**
```typescript
export const handleReportSchema = z.object({
  decision: z.enum(['DISMISS', 'PROCESS', 'ESCALATE']),
  action: z.enum(['WARN_USER', 'DELETE_CONTENT', 'BAN_USER_TEMPORARY', 
    'BAN_USER_PERMANENT', 'RESTORE_CONTENT', 'UNBAN_USER']).optional(),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
});
```

**Modal Component:**
- Create `HandleReportModal.tsx` with multi-step form
- Step 1: Decision selection (radio buttons)
- Step 2: Action selection (if PROCESS, show dropdown)
- Step 3: Reason textarea (required)
- Use react-hook-form + zodResolver

**Mutation:**
Update `useHandleReport()` to:
- Show success notification
- Invalidate report detail and list queries
- Close modal on success

---

### Phase 3: User Statistics Dashboard

**API (`src/lib/api/statistics.ts`):**
```typescript
export interface UserStatistics {
  userId: string;
  username: string;
  activity: {
    totalPosts: number;
    totalComments: number;
    likesReceived: number;
    lastActive: string;
    avgPostsPerWeek: number;
  };
  violations: {
    reportsReceived: number;
    confirmedViolations: number;
    warnings: number;
  };
  timeline: Array<{ date: string; posts: number; comments: number }>;
  moderationHistory: Array<{
    actionType: string;
    reason: string;
    handledBy: string;
    createdAt: string;
  }>;
}

export async function getUserStatistics(token: string, userId: string) {
  return apiFetch<UserStatistics>(`/api/v1/admin/user-statistics/${userId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

**Chart Components:**
- `ActivityChart.tsx`: Use Recharts `<LineChart>` with 30-day data
- `ViolationPieChart.tsx`: Use Recharts `<PieChart>` for violation breakdown
- `StatCard.tsx`: Grid layout (4 cards per row) with Tailwind

**Page Layout:**
```
┌─────────────────────────────────────┐
│ Search Bar                          │
├─────────────────────────────────────┤
│ [Total Posts] [Comments] [Violations] [Last Active] │ (StatCards)
├─────────────────────────────────────┤
│ Activity Chart (30 days)            │
│ Violation Pie Chart                 │ (2-column grid)
├─────────────────────────────────────┤
│ Moderation History Table            │
└─────────────────────────────────────┘
```

---

### Phase 4: Activity Logs + Polish

**API (`src/lib/api/activity-logs.ts`):**
```typescript
interface ActivityLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function listActivityLogs(token: string, params: ActivityLogParams) {
  const query = new URLSearchParams(params as Record<string, string>);
  return apiFetch<Paginated<ActivityLog>>(`/api/v1/admin/activity-logs?${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function exportActivityLogs(token: string, params: ActivityLogParams): Promise<Blob> {
  const query = new URLSearchParams(params as Record<string, string>);
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/activity-logs/export?${query}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.blob();
}
```

**CSV Export Hook:**
```typescript
export function useExportLogs() {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (params: ActivityLogParams) =>
      exportActivityLogs(tokenOrThrow(token), params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
```

**Shared Components:**
- Extract `DataTable.tsx` for reusable pagination + filtering
- Extract `UserTable.tsx` from `/dashboard/system/users/page.tsx`
- Create `ConfirmModal.tsx` for destructive actions
- Add loading skeletons for all tables/charts

---

## File Structure

```
src/
├── app/dashboard/
│   ├── business/
│   │   ├── reports/
│   │   │   ├── page.tsx                    # ENHANCED (filters)
│   │   │   └── [reportId]/page.tsx         # ENHANCED (modal)
│   │   ├── statistics/
│   │   │   └── page.tsx                    # NEW
│   │   └── users/
│   │       └── page.tsx                    # NEW (shared table)
│   └── system/
│       └── activity-logs/
│           └── page.tsx                    # NEW
├── components/
│   ├── reports/
│   │   ├── ReportStatusBadge.tsx
│   │   ├── ReportFilterBar.tsx
│   │   ├── ReportCard.tsx
│   │   └── HandleReportModal.tsx
│   ├── statistics/
│   │   ├── UserSearchBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── ActivityChart.tsx
│   │   ├── ViolationPieChart.tsx
│   │   └── ModerationHistoryTable.tsx
│   ├── activity-logs/
│   │   ├── LogFilterBar.tsx
│   │   ├── LogTable.tsx
│   │   └── LogDetailModal.tsx
│   ├── users/
│   │   └── UserTable.tsx                   # Extracted
│   └── common/
│       ├── DataTable.tsx
│       ├── ConfirmModal.tsx
│       └── LoadingSkeleton.tsx
├── lib/
│   ├── api/
│   │   ├── reports.ts                      # ENHANCED
│   │   ├── statistics.ts                   # NEW
│   │   └── activity-logs.ts                # NEW
│   ├── schemas/
│   │   └── admin-forms.ts                  # EXTENDED
│   └── query-keys.ts                       # EXTENDED
├── hooks/
│   └── use-admin-queries.ts                # EXTENDED
└── types/
    └── api.ts                              # EXTENDED
```

---

## Key Patterns to Follow

**Styling (from existing `/dashboard/system/users/page.tsx`):**
```tsx
// Table wrapper
<div className="overflow-x-auto rounded-xl border border-border">
  
// Table header
<thead className="bg-muted/80">
  
// Status badges
<span className="text-primary">Hoạt động</span>
<span className="text-amber-600">Khóa</span>
<span className="text-muted-foreground">Đã xóa</span>

// Links
<Link className="font-medium text-foreground underline">Chi tiết</Link>
```

**Data Fetching (from `use-admin-queries.ts`):**
```typescript
export function useResource(params) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.resource(params),
    queryFn: () => api.fetchResource(tokenOrThrow(token), params),
    enabled: !!token?.trim(),
    staleTime: 60_000, // 1 minute
  });
}

// Mutation with invalidation
export function useUpdateResource(id: string) {
  const token = useAdminStore((s) => s.bearerToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.updateResource(tokenOrThrow(token), id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.resource(id) });
      void qc.invalidateQueries({ queryKey: ["admin", "resources"] });
    },
  });
}
```

**Form Validation:**
```typescript
// Schema
const schema = z.object({
  field: z.string().min(1, 'Vui lòng nhập'),
});

// Component
const form = useForm({ resolver: zodResolver(schema) });
const mutation = useMutation(...);

<form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
  <input {...form.register('field')} />
  {form.formState.errors.field && (
    <p className="text-sm text-red-600">{form.formState.errors.field.message}</p>
  )}
  <button disabled={mutation.isPending}>Gửi</button>
</form>
```

---

## Verification Steps

After implementation, verify:

1. **Authentication:**
   - [ ] BA cannot access `/dashboard/system/activity-logs` (should see 403)
   - [ ] ADMIN can access all BA and system routes
   - [ ] Portal mode switcher works for users with both roles

2. **Report Management:**
   - [ ] Filter reports by content type (POST, COMMENT, USER tabs)
   - [ ] Filter reports by status dropdown
   - [ ] Status badges show correct colors
   - [ ] Handle report modal opens and closes properly
   - [ ] Report list refreshes after handling a report

3. **User Statistics:**
   - [ ] Search user by username/email works
   - [ ] 4 stat cards display correct metrics
   - [ ] Activity chart renders with 30-day data
   - [ ] Violation pie chart shows breakdown
   - [ ] Moderation history table paginates correctly

4. **Activity Logs:**
   - [ ] Log table loads with pagination
   - [ ] Filters work (user, action, date range)
   - [ ] CSV export downloads with correct filename
   - [ ] Log detail modal shows full entry

5. **Shared User List:**
   - [ ] BA can view user list at `/dashboard/business/users`
   - [ ] Action buttons (Lock/Unlock, Edit Roles) are hidden for BA
   - [ ] Same table renders for ADMIN with actions visible

6. **Performance:**
   - [ ] Charts render within 1 second
   - [ ] Tables paginate smoothly
   - [ ] No console errors in browser
   - [ ] React Query devtools show proper cache invalidation

7. **UI/UX:**
   - [ ] Loading skeletons display during data fetch
   - [ ] Error states show friendly Vietnamese messages
   - [ ] Empty states show when no data
   - [ ] All copy is in Vietnamese
   - [ ] Responsive design works on desktop and mobile

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend enum values don't match | HIGH | Use string literals in frontend, add validation when backend confirms |
| Recharts bundle size | MEDIUM | Use Next.js dynamic imports: `const Chart = dynamic(() => import('./Chart'))` |
| Report pagination performance | MEDIUM | Server-side pagination, default 20 items per page |
| WebSocket complexity | LOW | Start with polling (30s), defer WebSocket to optional Phase 4 |
| Date picker complexity | LOW | Use native `<input type="date">` for MVP, upgrade to library later |

---

## Dependencies

**New:**
```bash
npm install recharts
```

**No changes needed:**
- Next.js, React, React Query, Zustand, Tailwind (already configured)

---

## Success Criteria

**BA Dashboard:**
- ✅ Filter reports by content type and status
- ✅ Handle reports with 3-step modal (decision → action → reason)
- ✅ View user statistics with 2 charts + 4 metrics
- ✅ Read-only access to user list

**ADMIN Dashboard:**
- ✅ All BA capabilities
- ✅ Activity log viewer with filters
- ✅ CSV export of activity logs
- ✅ User management (existing, no changes)

**Code Quality:**
- ✅ TypeScript strict mode, no `any` types
- ✅ Consistent Tailwind styling
- ✅ All mutations invalidate related queries
- ✅ Vietnamese copy throughout

---

## Estimated Effort

- **Phase 1:** 3-4 days
- **Phase 2:** 3-4 days
- **Phase 3:** 4-5 days
- **Phase 4:** 5-6 days

**Total:** 3-4 weeks (1 developer) or 2 weeks (2 developers in parallel)

---

## Next Actions

1. Review and approve plan
2. Install dependencies: `npm install recharts`
3. Create feature branch: `git checkout -b feat/ba-admin-dashboards`
4. Start Phase 1: Enhanced report management
5. Daily progress updates via standup

---

**Plan Ready for Implementation** ✅
