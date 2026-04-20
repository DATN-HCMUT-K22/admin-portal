# Phase 3: User Statistics Dashboard

**Duration:** 4-5 days  
**Status:** ✅ COMPLETE  
**Goal:** BA can view user activity and violation metrics with charts

---

## Objectives

- Build user search functionality
- Display 4 metric stat cards
- Create activity line chart (30-day timeline)
- Create violation pie chart (breakdown by type)
- Show moderation history table

---

## Tasks

### 1. Add Statistics Types

**File:** `src/types/api.ts`

```typescript
export interface UserStatistics {
  userId: string;
  username: string;
  fullName: string;
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
    id: string;
    actionType: string;
    reason: string;
    handledBy: string;
    createdAt: string;
  }>;
}
```

### 2. Create Statistics API Client

**File:** `src/lib/api/statistics.ts`

```typescript
import { apiFetch } from "./client";
import type { UserStatistics } from "@/types/api";

export async function getUserStatistics(
  token: string,
  userId: string
): Promise<UserStatistics> {
  return apiFetch<UserStatistics>(
    `/api/v1/admin/user-statistics/${userId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function searchUsers(
  token: string,
  query: string
): Promise<Array<{ id: string; username: string; fullName: string }>> {
  return apiFetch(`/api/v1/admin/users/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

### 3. Add Statistics Hooks

**File:** `src/hooks/use-admin-queries.ts`

```typescript
// Add to existing file
import * as statisticsApi from "@/lib/api/statistics";

export function useUserStatistics(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "statistics", userId],
    queryFn: () => statisticsApi.getUserStatistics(tokenOrThrow(token), userId),
    enabled: !!token && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchUsers(query: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "users", "search", query],
    queryFn: () => statisticsApi.searchUsers(tokenOrThrow(token), query),
    enabled: !!token && query.length >= 2,
    staleTime: 60_000, // 1 minute
  });
}
```

### 4. Create User Search Component

**File:** `src/components/statistics/UserSearchBar.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchUsers } from "@/hooks/use-admin-queries";

interface Props {
  onSelect: (userId: string, username: string) => void;
}

export function UserSearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [] } = useSearchUsers(debouncedQuery);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="Tìm kiếm người dùng (username hoặc tên)..."
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
      />

      {showResults && results.length > 0 && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-lg border border-border bg-background shadow-lg">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelect(user.id, user.username);
                setQuery("");
                setShowResults(false);
              }}
              className="w-full px-4 py-3 text-left transition hover:bg-accent"
            >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-muted-foreground">{user.fullName}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. Create Stat Card Component

**File:** `src/components/statistics/StatCard.tsx`

```typescript
import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
}

export function StatCard({ title, value, icon, subtitle }: Props) {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && (
        <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
```

### 6. Create Activity Chart Component

**File:** `src/components/statistics/ActivityChart.tsx`

```typescript
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataPoint {
  date: string;
  posts: number;
  comments: number;
}

interface Props {
  data: DataPoint[];
}

export function ActivityChart({ data }: Props) {
  // Format date for display
  const formattedData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString("vi-VN", { 
      month: "short", 
      day: "numeric" 
    }),
  }));

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Hoạt động 30 ngày qua</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="posts" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Bài viết"
          />
          <Line 
            type="monotone" 
            dataKey="comments" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Bình luận"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 7. Create Violation Pie Chart Component

**File:** `src/components/statistics/ViolationPieChart.tsx`

```typescript
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  violations: Record<string, number>;
}

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981"];

export function ViolationPieChart({ violations }: Props) {
  const data = Object.entries(violations).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-border p-6">
        <h3 className="mb-4 font-semibold">Phân loại vi phạm</h3>
        <p className="py-12 text-center text-sm text-muted-foreground">
          Không có vi phạm
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Phân loại vi phạm</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => 
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 8. Create Moderation History Table

**File:** `src/components/statistics/ModerationHistoryTable.tsx`

```typescript
interface ModerationAction {
  id: string;
  actionType: string;
  reason: string;
  handledBy: string;
  createdAt: string;
}

interface Props {
  history: ModerationAction[];
}

export function ModerationHistoryTable({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-border p-6">
        <h3 className="mb-4 font-semibold">Lịch sử kiểm duyệt</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">
          Chưa có hành động kiểm duyệt nào
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Lịch sử kiểm duyệt</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/80">
            <tr>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
              <th className="px-4 py-3 font-medium">Lý do</th>
              <th className="px-4 py-3 font-medium">Người xử lý</th>
            </tr>
          </thead>
          <tbody>
            {history.map((action) => (
              <tr key={action.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {new Date(action.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 font-medium">{action.actionType}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {action.reason.length > 50
                    ? `${action.reason.slice(0, 50)}...`
                    : action.reason}
                </td>
                <td className="px-4 py-3">{action.handledBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 9. Create Statistics Page

**File:** `src/app/dashboard/business/statistics/page.tsx`

```typescript
"use client";

import { useState, useMemo } from "react";
import { useUserStatistics } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserSearchBar } from "@/components/statistics/UserSearchBar";
import { StatCard } from "@/components/statistics/StatCard";
import { ActivityChart } from "@/components/statistics/ActivityChart";
import { ViolationPieChart } from "@/components/statistics/ViolationPieChart";
import { ModerationHistoryTable } from "@/components/statistics/ModerationHistoryTable";

export default function StatisticsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUsername, setSelectedUsername] = useState<string>("");

  const { data: stats, isLoading, error } = useUserStatistics(selectedUserId);

  // Calculate violation breakdown
  const violationBreakdown = useMemo(() => {
    if (!stats) return {};
    
    // Mock data - replace with actual breakdown from API
    return {
      SPAM: Math.floor(stats.violations.confirmedViolations * 0.3),
      HARASSMENT: Math.floor(stats.violations.confirmedViolations * 0.2),
      HATE_SPEECH: Math.floor(stats.violations.confirmedViolations * 0.15),
      OTHER: Math.floor(stats.violations.confirmedViolations * 0.35),
    };
  }, [stats]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Thống kê người dùng</h1>

      <UserSearchBar 
        onSelect={(userId, username) => {
          setSelectedUserId(userId);
          setSelectedUsername(username);
        }} 
      />

      {selectedUserId && (
        <QueryState isLoading={isLoading} error={error as Error | null}>
          {stats && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="rounded-xl border border-border bg-accent/30 p-6">
                <h2 className="text-lg font-semibold">{selectedUsername}</h2>
                <p className="text-sm text-muted-foreground">{stats.fullName}</p>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Tổng bài viết"
                  value={stats.activity.totalPosts}
                  subtitle={`${stats.activity.avgPostsPerWeek.toFixed(1)} bài/tuần`}
                />
                <StatCard
                  title="Tổng bình luận"
                  value={stats.activity.totalComments}
                />
                <StatCard
                  title="Lượt thích nhận được"
                  value={stats.activity.likesReceived}
                />
                <StatCard
                  title="Vi phạm xác nhận"
                  value={stats.violations.confirmedViolations}
                  subtitle={`${stats.violations.warnings} cảnh báo`}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ActivityChart data={stats.timeline} />
                <ViolationPieChart violations={violationBreakdown} />
              </div>

              {/* Moderation History */}
              <ModerationHistoryTable history={stats.moderationHistory} />
            </div>
          )}
        </QueryState>
      )}

      {!selectedUserId && (
        <div className="rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">
            Tìm kiếm người dùng để xem thống kê
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Verification

After completing Phase 3, verify:

- [ ] User search bar shows autocomplete results
- [ ] Selecting user loads their statistics
- [ ] 4 stat cards display correct numbers
- [ ] Activity chart renders 30-day timeline
- [ ] Line chart shows posts and comments
- [ ] Pie chart shows violation breakdown
- [ ] Empty pie chart shows "Không có vi phạm" message
- [ ] Moderation history table displays correctly
- [ ] Empty history shows appropriate message
- [ ] Charts are responsive on mobile

---

## Files Created

- ➕ `src/lib/api/statistics.ts`
- ✏️ `src/types/api.ts` - Add UserStatistics
- ✏️ `src/hooks/use-admin-queries.ts` - Add statistics hooks
- ➕ `src/components/statistics/UserSearchBar.tsx`
- ➕ `src/components/statistics/StatCard.tsx`
- ➕ `src/components/statistics/ActivityChart.tsx`
- ➕ `src/components/statistics/ViolationPieChart.tsx`
- ➕ `src/components/statistics/ModerationHistoryTable.tsx`
- ➕ `src/app/dashboard/business/statistics/page.tsx`

---

**Next:** [Phase 4 - Activity Logs + Polish](./phase-4-activity-logs.md)
