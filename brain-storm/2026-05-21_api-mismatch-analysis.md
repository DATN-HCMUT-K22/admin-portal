# API Implementation Mismatch Analysis
**Date:** 2026-05-21  
**Purpose:** Compare comprehensive guide APIs vs actual frontend implementation

## Executive Summary

🚨 **Critical Findings:**
- Guide is **INCOMPLETE** - Missing 13 implemented APIs
- Guide mentions **7 unimplemented** analytics/moderation endpoints
- Frontend has **MORE features** than documented in guide

---

## 1. APIs in Guide vs Actual Implementation

### ✅ FULLY IMPLEMENTED (Guide → Frontend)

| Endpoint | Method | Status | File |
|----------|--------|--------|------|
| `/api/v1/reports` | GET | ✓ | `src/lib/api/reports.ts` |
| `/api/v1/reports/{id}` | GET | ✓ | `src/lib/api/reports.ts` |
| `/api/v1/reports/{id}/handle` | POST | ✓ | `src/lib/api/reports.ts` |
| `/api/v1/admin/moderate-user` | POST | ✓ | `src/lib/api/moderation.ts` |

---

## 2. ❌ MISSING in Frontend (Guide Claims "Implemented")

### 2.1 Analytics Endpoints (HIGH PRIORITY)

| Endpoint | Purpose | Guide Section | Impact |
|----------|---------|---------------|--------|
| `GET /api/v1/admin/stats/reports` | Report statistics (total, pending, by type, trends) | 2.1, 2.3 | **HIGH** - Dashboard analytics broken |
| `GET /api/v1/admin/stats/users` | User statistics (total, active, locked, growth rate) | 2.1, 2.3 | **HIGH** - User analytics missing |
| `GET /api/v1/admin/stats/content` | Content statistics (posts, comments, deleted) | 2.1, 2.3 | **MEDIUM** - Content insights unavailable |
| `GET /api/v1/admin/stats/system-health` | System health metrics (memory, CPU, errors) | 2.1, 2.3 | **LOW** - Monitoring dashboard incomplete |

**Current Workaround:**  
Frontend has `GET /api/v1/admin/user-statistics/{userId}` - individual user stats only, NOT aggregate.

### 2.2 Moderation History Endpoints (MEDIUM PRIORITY)

| Endpoint | Purpose | Impact |
|----------|---------|--------|
| `GET /api/v1/admin/moderation-actions` | List all moderation actions (filtered) | **MEDIUM** - Audit log incomplete |
| `GET /api/v1/admin/moderation-actions/user/{userId}` | User moderation history | **LOW** - Included in user-statistics response |

---

## 3. ✨ EXTRA APIs (Implemented but NOT in Guide)

### 3.1 User Management (NOT DOCUMENTED)

| Endpoint | Method | File |
|----------|--------|------|
| `/api/v1/users/me` | GET | `src/lib/api/users.ts` |
| `/api/v1/users` | GET | `src/lib/api/users.ts` |
| `/api/v1/users/{id}` | GET | `src/lib/api/users.ts` |
| `/api/v1/users/{id}/status` | POST | `src/lib/api/users.ts` |
| `/api/v1/users/{id}/roles` | POST | `src/lib/api/users.ts` |

**Impact:** Complete user CRUD missing from guide!

### 3.2 Activity Logs (NOT DOCUMENTED)

| Endpoint | Method | File |
|----------|--------|------|
| `/api/v1/admin/activity-logs` | GET | `src/lib/api/activity-logs.ts` |
| `/api/v1/admin/activity-logs/export` | GET | `src/lib/api/activity-logs.ts` |

**Impact:** Audit trail feature completely undocumented.

### 3.3 Feedback System (NOT DOCUMENTED)

| Endpoint | Method | File |
|----------|--------|------|
| `/api/v1/feedbacks` | GET | `src/lib/api/feedbacks.ts` |
| `/api/v1/feedbacks/{id}` | GET | `src/lib/api/feedbacks.ts` |

**Impact:** User feedback feature missing from guide.

### 3.4 Role & Permission System (NOT DOCUMENTED)

| Endpoint | Method | File |
|----------|--------|------|
| `/api/v1/roles` | GET | `src/lib/api/roles.ts` |
| `/api/v1/roles` | POST | `src/lib/api/roles.ts` |
| `/api/v1/permissions` | GET | `src/lib/api/roles.ts` |

**Impact:** RBAC system completely missing from guide.

### 3.5 Search & Statistics (DIFFERENT from Guide)

| Endpoint | Method | File | Guide Equivalent |
|----------|--------|------|------------------|
| `/api/v1/admin/users/search` | GET | `src/lib/api/statistics.ts` | ❌ None |
| `/api/v1/admin/user-statistics/{userId}` | GET | `src/lib/api/statistics.ts` | ⚠️ Different from `/stats/users` |

---

## 4. API Endpoint Discrepancies

### 4.1 Statistics API Mismatch

**Guide Expects:**
```
GET /api/v1/admin/stats/users
Response: {
  total_users, active_users, locked_users, deleted_users,
  new_users_this_month, growth_rate_percent, by_role, top_reporters
}
```

**Actual Implementation:**
```
GET /api/v1/admin/user-statistics/{userId}
Response: {
  userId, username, fullName,
  activity: { totalPosts, totalComments, likesReceived, ... },
  violations: { reportsReceived, confirmedViolations, warnings },
  timeline: [...],
  moderationHistory: [...]
}
```

**Problem:** Aggregate vs Individual stats - completely different endpoints!

---

## 5. Frontend Update Recommendations

### Priority 1: CRITICAL (Do Now)

#### Add Missing Analytics APIs

**File:** `src/lib/api/statistics.ts`

```typescript
// Add to statistics.ts
export async function getReportStatistics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ReportStatisticsResponse> {
  const q = new URLSearchParams();
  if (params?.startDate) q.set("startDate", params.startDate);
  if (params?.endDate) q.set("endDate", params.endDate);
  return apiFetch(`/api/v1/admin/stats/reports${q.toString() ? `?${q}` : ""}`);
}

export async function getAllUserStatistics(): Promise<UserStatisticsResponse> {
  return apiFetch("/api/v1/admin/stats/users");
}

export async function getContentStatistics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ContentStatisticsResponse> {
  const q = new URLSearchParams();
  if (params?.startDate) q.set("startDate", params.startDate);
  if (params?.endDate) q.set("endDate", params.endDate);
  return apiFetch(`/api/v1/admin/stats/content${q.toString() ? `?${q}` : ""}`);
}

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  return apiFetch("/api/v1/admin/stats/system-health");
}
```

**Types to Add:** (based on guide section 7.1)
```typescript
// Add to src/types/api.ts
export interface ReportStatisticsResponse {
  total_reports: number;
  pending_reports: number;
  processed_reports: number;
  dismissed_reports: number;
  by_type: Record<ViolationType, number>;
  by_content_type: Record<ContentType, number>;
  avg_handling_time_hours: number;
  trend: DailyTrendDto[];
}

export interface UserStatisticsResponse {
  total_users: number;
  active_users: number;
  locked_users: number;
  deleted_users: number;
  new_users_this_month: number;
  growth_rate_percent: number;
  by_role: Record<string, number>;
  top_reporters: TopReporterDto[];
}

export interface ContentStatisticsResponse {
  total_posts: number;
  total_comments: number;
  posts_created_today: number;
  comments_created_today: number;
  deleted_posts: number;
  deleted_comments: number;
  avg_posts_per_user: number;
  most_active_users: MostActiveUserDto[];
}

export interface SystemHealthResponse {
  memory_usage_percent: number;
  cpu_usage_percent: number;
  active_sessions: number;
  error_count: number;
  avg_response_time_ms: number;
  recent_errors: RecentErrorDto[];
}

export interface DailyTrendDto {
  date: string;
  count: number;
}

export interface TopReporterDto {
  user: { id: string; username: string; fullName: string };
  report_count: number;
}

export interface MostActiveUserDto {
  user: { id: string; username: string; fullName: string };
  post_count: number;
  comment_count: number;
}

export interface RecentErrorDto {
  timestamp: string;
  error_message: string;
  endpoint: string;
}
```

#### Add Missing Moderation APIs

**File:** `src/lib/api/moderation.ts`

```typescript
// Add to moderation.ts
export async function listModerationActions(params: {
  userId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const q = new URLSearchParams();
  if (params.userId) q.set("userId", params.userId);
  if (params.actionType) q.set("actionType", params.actionType);
  if (params.startDate) q.set("startDate", params.startDate);
  if (params.endDate) q.set("endDate", params.endDate);
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  
  return apiFetch<Paginated<ModerationActionResponse>>(
    `/api/v1/admin/moderation-actions${q.toString() ? `?${q}` : ""}`
  );
}

export async function getUserModerationHistory(userId: string) {
  return apiFetch<ModerationActionResponse[]>(
    `/api/v1/admin/moderation-actions/user/${userId}`
  );
}
```

**Types:**
```typescript
// Add to src/types/api.ts
export interface ModerationActionResponse {
  id: string;
  actionType: ModerationActionType;
  user: { id: string; username: string };
  moderator: { id: string; username: string };
  reason: string;
  duration?: number;
  expiresAt?: string;
  createdAt: string;
}
```

---

### Priority 2: Update React Query Hooks

**File:** `src/hooks/use-admin-queries.ts`

```typescript
// Add new hooks
export function useReportStatistics(dateRange?: { startDate?: string; endDate?: string }) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ['admin', 'stats', 'reports', dateRange],
    queryFn: () => statisticsApi.getReportStatistics(dateRange),
    enabled: !!token?.trim(),
    staleTime: 5 * 60_000, // 5 minutes
  });
}

export function useAllUserStatistics() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: () => statisticsApi.getAllUserStatistics(),
    enabled: !!token?.trim(),
    staleTime: 10 * 60_000,
  });
}

export function useContentStatistics(dateRange?: { startDate?: string; endDate?: string }) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ['admin', 'stats', 'content', dateRange],
    queryFn: () => statisticsApi.getContentStatistics(dateRange),
    enabled: !!token?.trim(),
    staleTime: 5 * 60_000,
  });
}

export function useSystemHealth() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ['admin', 'stats', 'system-health'],
    queryFn: () => statisticsApi.getSystemHealth(),
    enabled: !!token?.trim(),
    staleTime: 30_000,
    refetchInterval: 30_000, // Poll every 30s
  });
}

export function useModerationActions(params: {
  userId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ['admin', 'moderation-actions', params],
    queryFn: () => moderationApi.listModerationActions(params),
    enabled: !!token?.trim(),
  });
}
```

---

### Priority 3: Update Dashboard Page

**File:** `src/app/dashboard/page.tsx`

Add analytics widgets using new hooks:

```typescript
import { useReportStatistics, useAllUserStatistics, useContentStatistics, useSystemHealth } from '@/hooks/use-admin-queries';

export default function DashboardPage() {
  const { data: reportStats } = useReportStatistics();
  const { data: userStats } = useAllUserStatistics();
  const { data: contentStats } = useContentStatistics();
  const { data: systemHealth } = useSystemHealth();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Report Stats Cards */}
      <StatCard 
        title="Total Reports" 
        value={reportStats?.total_reports} 
        trend={reportStats?.trend}
      />
      <StatCard 
        title="Pending Reports" 
        value={reportStats?.pending_reports} 
      />
      
      {/* User Stats Cards */}
      <StatCard 
        title="Total Users" 
        value={userStats?.total_users} 
      />
      <StatCard 
        title="Active Users" 
        value={userStats?.active_users} 
      />
      
      {/* System Health */}
      <HealthCard 
        cpu={systemHealth?.cpu_usage_percent}
        memory={systemHealth?.memory_usage_percent}
      />
    </div>
  );
}
```

---

## 6. Backend Verification Needed

🔍 **Before implementing frontend changes, verify backend actually has these endpoints:**

```bash
# Test with curl (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/v1/admin/stats/reports
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/v1/admin/stats/users
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/v1/admin/stats/content
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/v1/admin/stats/system-health
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/v1/admin/moderation-actions
```

**If endpoints return 404:**
- Guide is WRONG - backend doesn't have these endpoints
- Need to implement backend first before frontend

---

## 7. Documentation Updates Needed

### Update Guide to Include:

1. **User Management Section** (completely missing)
   - List users
   - Get user details
   - Update user status
   - Update user roles

2. **Activity Logs Section** (completely missing)
   - List activity logs with filters
   - Export activity logs

3. **Feedback System Section** (completely missing)
   - List feedbacks
   - Get feedback details

4. **Roles & Permissions Section** (completely missing)
   - List roles
   - Create role
   - List permissions

5. **Clarify Statistics Endpoints**
   - Aggregate stats (`/stats/users`) vs Individual stats (`/user-statistics/{userId}`)
   - Document both clearly

---

## 8. Summary Table

| Category | Guide Says "Implemented" | Actually Implemented | Action |
|----------|-------------------------|----------------------|--------|
| Reports CRUD | 4 endpoints | ✅ 3/4 (missing POST /reports) | Low priority - submit report is user-facing |
| Moderation | 3 endpoints | ✅ 1/3 | **Add 2 endpoints** |
| Analytics | 4 endpoints | ❌ 0/4 | **CRITICAL - Add all 4** |
| User Management | ❌ Not mentioned | ✅ 5 endpoints | Update guide |
| Activity Logs | ❌ Not mentioned | ✅ 2 endpoints | Update guide |
| Feedbacks | ❌ Not mentioned | ✅ 2 endpoints | Update guide |
| Roles | ❌ Not mentioned | ✅ 3 endpoints | Update guide |

---

## 9. Next Steps

### Immediate Actions:

1. ✅ **Verify backend** - Test if `/stats/*` endpoints exist
2. 📝 **Update types** - Add missing TypeScript interfaces
3. 🔧 **Add API functions** - Implement missing analytics/moderation APIs
4. 🎣 **Create hooks** - Add React Query hooks for new endpoints
5. 🎨 **Update dashboard** - Use real analytics data
6. 📚 **Update guide** - Document all existing features

### Timeline Estimate:

- Backend verification: 30 min
- Type definitions: 1 hour
- API functions: 2 hours
- React Query hooks: 2 hours
- Dashboard UI updates: 4 hours
- Testing: 2 hours
- Documentation: 2 hours

**Total: ~1.5 days of work**

---

**Report Generated:** 2026-05-21  
**Status:** Ready for implementation  
**Owner:** Frontend Team
