# TripJoy Admin System - Comprehensive Guide
## Feature Expansion, UI/UX Design & Frontend Integration

**Date:** 2026-05-21  
**Status:** Brainstorming Complete - Ready for Implementation  
**Target:** Frontend Team (React + Next.js)  
**Focus:** Speed & Efficiency + Bulk Operations + Advanced Analytics

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current System Overview](#2-current-system-overview)
3. [Feature Expansion Proposals](#3-feature-expansion-proposals)
4. [UI/UX Design for Speed & Efficiency](#4-uiux-design-for-speed--efficiency)
5. [Component Architecture](#5-component-architecture)
6. [API Integration Guide](#6-api-integration-guide)
7. [TypeScript Types & Hooks](#7-typescript-types--hooks)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [Success Metrics](#9-success-metrics)

---

## 1. Executive Summary

### 1.1 Current State
TripJoy backend has **fully implemented** admin APIs with:
- ✅ User moderation (BAN, SUSPEND, WARN)
- ✅ Report management (submit, list, handle)
- ✅ Analytics (users, content, reports, system health)
- ✅ Role-based access control (ADMIN + BA)

### 1.2 Expansion Goals
**Primary:** Add bulk operations + advanced analytics  
**Secondary:** Design speed-focused UI/UX  
**Deliverable:** Complete FE integration guide

### 1.3 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend Stack** | React + Next.js | SSR benefits, API routes, team expertise |
| **Doc Format** | Detailed Markdown | Human-readable, code examples, easy to maintain |
| **UX Priority** | Speed & Efficiency | Keyboard shortcuts, minimal clicks, bulk actions |
| **New Features** | Bulk ops + Analytics | Admin efficiency + data-driven decisions |

---

## 2. Current System Overview

### 2.1 Backend APIs (Implemented)

#### **AdminController** (`/api/v1/admin`)
```java
POST   /moderate-user                    // Moderate user (BAN/SUSPEND/WARN)
GET    /moderation-actions               // List moderation actions (filtered)
GET    /moderation-actions/user/{userId} // User moderation history
GET    /stats/reports                    // Report statistics
GET    /stats/users                      // User statistics
GET    /stats/content                    // Content statistics
GET    /stats/system-health              // System health metrics
```

#### **ReportController** (`/api/v1/reports`)
```java
POST   /                           // Submit report (USER)
GET    /                           // List reports (ADMIN/BA, filtered)
GET    /{reportId}                 // Get report details
POST   /{reportId}/handle          // Handle report (ADMIN/BA)
```

### 2.2 Enums & Constants

**ModerationActionType:**
```typescript
type ModerationActionType = 'BAN_USER' | 'SUSPEND_USER' | 'WARN_USER';
```

**ReportType:**
```typescript
type ReportType = 
  | 'SPAM' 
  | 'HARASSMENT' 
  | 'HATE_SPEECH' 
  | 'MISINFORMATION' 
  | 'INAPPROPRIATE_CONTENT' 
  | 'COPYRIGHT' 
  | 'IMPERSONATION' 
  | 'OTHER';
```

**ReportStatus:**
```typescript
type ReportStatus = 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'PROCESSED' 
  | 'DISMISSED' 
  | 'ESCALATED';
```

### 2.3 Analytics Capabilities

**ReportStatistics:**
- Total/pending/processed/dismissed reports
- Breakdown by type (SPAM, HARASSMENT, etc.)
- Breakdown by content type (POST, COMMENT)
- Average handling time
- Daily trend data

**UserStatistics:**
- Total/active/locked/deleted users
- New users this month + growth rate
- Breakdown by role
- Top reporters list

**ContentStatistics:**
- Total posts/comments
- Created today
- Deleted posts/comments
- Average posts per user
- Most active users

**SystemHealth:**
- Memory usage
- CPU usage
- Active sessions
- Error count
- Response times

---

## 3. Feature Expansion Proposals

### 3.1 Bulk Operations (HIGH PRIORITY)

#### **3.1.1 Bulk Report Handling**

**Problem:** Admin has to handle 50 spam reports one-by-one  
**Solution:** Batch selection + bulk actions

**New API Endpoint:**
```java
POST /api/v1/admin/reports/bulk-handle
{
  "reportIds": ["uuid1", "uuid2", "..."],  // Max 100 per request
  "action": "DISMISS",                      // DISMISS | PROCESS
  "reason": "Spam campaign detected",       // Required for audit
  "moderationAction": "BAN_USER"            // If action=PROCESS
}

Response: 200 OK
{
  "processed": 48,
  "failed": 2,
  "errors": [
    {"reportId": "uuid-x", "error": "Already processed"}
  ]
}
```

**UI Flow:**
1. Admin selects multiple reports (checkbox)
2. Clicks "Bulk Action" button
3. Modal appears: Choose action + reason
4. Preview affected users/content
5. Confirm → API call → Success toast

**Backend Changes Required:**
```java
// New DTO
@Data
public class BulkHandleReportRequest {
    @NotEmpty
    @Size(max = 100)
    private List<UUID> reportIds;
    
    @NotNull
    private BulkActionType action; // DISMISS, PROCESS
    
    @NotBlank
    private String reason;
    
    private ModerationActionType moderationAction; // Required if action=PROCESS
}

// New Service Method
public BulkHandleResult bulkHandleReports(BulkHandleReportRequest request, UUID adminId);
```

**Trade-offs:**
- ✅ Saves admin time (50 reports → 1 click)
- ✅ Consistent handling (same reason for all)
- ⚠️ Risk: Accidental bulk action on wrong reports
- ⚠️ Mitigation: Confirmation modal + audit log

---

#### **3.1.2 Bulk User Moderation**

**Problem:** Need to ban 20 users from coordinated spam attack  
**Solution:** Bulk moderation API

**New API Endpoint:**
```java
POST /api/v1/admin/users/bulk-moderate
{
  "userIds": ["uuid1", "uuid2", "..."],  // Max 50 per request
  "actionType": "BAN_USER",
  "reason": "Coordinated spam attack",
  "duration": 7                          // Days (if SUSPEND_USER)
}

Response: 200 OK
{
  "processed": 18,
  "failed": 2,
  "errors": [...]
}
```

**UI Flow:**
1. Admin searches users by criteria (e.g., "joined in last 24h + 0 posts")
2. Selects multiple users
3. Bulk action → BAN/SUSPEND/WARN
4. Confirmation modal with affected count
5. Submit → Email notifications sent to all users

---

#### **3.1.3 CSV Export/Import**

**Export Reports (for analysis):**
```java
GET /api/v1/admin/reports/export?format=csv&status=PENDING

Response: reports_2026-05-21.csv
```

**Import Bulk Actions (advanced):**
```java
POST /api/v1/admin/reports/bulk-import
Content-Type: multipart/form-data

CSV Format:
reportId,action,reason
uuid1,DISMISS,False positive
uuid2,PROCESS,Confirmed spam
```

**Use Case:** Analyst reviews reports offline → prepares CSV → imports decisions

---

### 3.2 Advanced Analytics (MEDIUM PRIORITY)

#### **3.2.1 Time-Series Trend Charts**

**Enhancement:** Expand `/admin/stats/reports` to include detailed trends

**Current Response:**
```json
{
  "trend": [
    {"date": "2026-05-15", "count": 12},
    {"date": "2026-05-16", "count": 15}
  ]
}
```

**Enhanced Response (Proposed):**
```json
{
  "trend": {
    "labels": ["May 15", "May 16", "May 17", "May 18", "May 19", "May 20", "May 21"],
    "datasets": [
      {
        "label": "Total Reports",
        "data": [12, 15, 8, 20, 35, 18, 10]
      },
      {
        "label": "Pending",
        "data": [5, 8, 3, 10, 20, 10, 5]
      },
      {
        "label": "Processed",
        "data": [7, 7, 5, 10, 15, 8, 5]
      }
    ]
  }
}
```

**UI:** Chart.js line chart showing 7-day/30-day trends

**New API Endpoint:**
```java
GET /api/v1/admin/stats/trends
  ?metric=reports              // reports | users | content
  &period=7d                   // 7d | 30d | 90d
  &groupBy=day                 // day | week | month

Response: TrendDataResponse
```

---

#### **3.2.2 Anomaly Detection**

**Feature:** Alert when report volume spikes

**New API Endpoint:**
```java
GET /api/v1/admin/stats/anomalies

Response:
{
  "anomalies": [
    {
      "type": "REPORT_SPIKE",
      "severity": "HIGH",
      "message": "Report volume 300% above average (60 vs usual 15)",
      "detectedAt": "2026-05-21T14:30:00Z",
      "relatedData": {
        "reportType": "SPAM",
        "affectedUsers": 5
      }
    }
  ]
}
```

**Backend Logic:**
- Calculate 7-day average
- If today's count > 2x average → flag anomaly
- Group by report type to identify spam campaigns

**UI:** Alert banner on dashboard + notification badge

---

#### **3.2.3 Predictive Moderation (AI-Powered)**

**Feature:** Auto-flag likely violations

**Implementation Options:**

**Option A: Rule-Based (Simple, No ML)**
```java
// Flag if:
- User created >10 posts in 1 hour
- User received >3 reports in 24h
- Content contains spam keywords (regex)
```

**Option B: ML Model (Advanced, Requires Training)**
```java
// Train model on historical data:
- Features: post length, time of day, user age, previous reports
- Label: 1 if report was PROCESSED, 0 if DISMISSED
- Predict probability of violation for new content
```

**New API Endpoint:**
```java
GET /api/v1/admin/reports/high-risk
  ?threshold=0.8  // Probability threshold

Response:
{
  "reports": [
    {
      "reportId": "uuid",
      "riskScore": 0.92,
      "reasons": ["Keyword match", "User has 2 prior bans"],
      ...reportDetails
    }
  ]
}
```

**UI:** Separate tab "High Risk Reports" for priority review

**Decision:** Start with **Option A (rule-based)**, plan for Option B in Q3

---

#### **3.2.4 Custom Report Builder**

**Feature:** BA creates custom analytics queries

**UI Mockup:**
```
┌─────────────────────────────────────┐
│ Custom Report Builder               │
├─────────────────────────────────────┤
│ Metric:    [Reports ▼]              │
│ Date:      [Last 30 days ▼]         │
│ Group by:  [Report Type ▼]          │
│ Filter:    [Status = PENDING ▼]     │
│                                     │
│ [Generate Report]                   │
└─────────────────────────────────────┘

Results:
┌─────────────────────────────────────┐
│ SPAM:        120 reports            │
│ HARASSMENT:   45 reports            │
│ HATE_SPEECH:  12 reports            │
└─────────────────────────────────────┘
```

**New API Endpoint:**
```java
POST /api/v1/admin/stats/custom
{
  "metric": "reports",
  "dateRange": {"start": "2026-04-21", "end": "2026-05-21"},
  "groupBy": "reportType",
  "filters": [{"field": "status", "operator": "eq", "value": "PENDING"}]
}

Response: CustomReportResponse
```

**Backend:** Dynamic query builder using JPA Specification

---

## 4. UI/UX Design for Speed & Efficiency

### 4.1 Keyboard Shortcuts (HIGH PRIORITY)

**Global Shortcuts:**
```javascript
Cmd+K / Ctrl+K    → Open command palette
Cmd+/             → Show keyboard shortcuts help
Cmd+B             → Go to bulk actions
Cmd+F             → Focus search bar
Escape            → Close modal/clear selection
```

**Report List Shortcuts:**
```javascript
J / K             → Next/previous report
Enter             → Open report details
Space             → Select/deselect report
Shift+A           → Select all visible reports
Shift+C           → Clear selection
D                 → Dismiss selected report
P                 → Process selected report
```

**Report Detail Shortcuts:**
```javascript
1 / 2 / 3         → Quick action (Dismiss/Warn/Ban)
Cmd+Enter         → Submit action
Cmd+[ / Cmd+]     → Previous/next report
```

**Implementation:**
```typescript
// Use react-hotkeys-hook
import { useHotkeys } from 'react-hotkeys-hook';

export function ReportList() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useHotkeys('j', () => setSelectedIndex(i => Math.min(i + 1, reports.length - 1)));
  useHotkeys('k', () => setSelectedIndex(i => Math.max(i - 1, 0)));
  useHotkeys('enter', () => openReportDetail(reports[selectedIndex]));
  useHotkeys('space', () => toggleSelection(reports[selectedIndex]));
  
  return (
    <div>
      {reports.map((report, i) => (
        <ReportRow 
          key={report.id} 
          report={report} 
          isSelected={i === selectedIndex}
        />
      ))}
    </div>
  );
}
```

---

### 4.2 Command Palette (Cmd+K)

**Feature:** Universal search + quick actions

**UI:**
```
Press Cmd+K
┌──────────────────────────────────────────┐
│ 🔍 Search or type a command...          │
├──────────────────────────────────────────┤
│ 📊 Go to Analytics Dashboard             │
│ 📝 View Pending Reports                  │
│ 👤 Search User by Username               │
│ ⚡ Bulk Handle Reports                   │
│ 🚨 View High Risk Reports                │
│ 📤 Export Reports CSV                    │
└──────────────────────────────────────────┘
```

**Search Results:**
```
Type: "spam john"
┌──────────────────────────────────────────┐
│ Reports:                                 │
│   📝 SPAM report by @john_doe (2h ago)   │
│   📝 SPAM report on @john_travel (5h ago)│
│                                          │
│ Users:                                   │
│   👤 @john_doe (User ID: uuid-123)       │
│   👤 @johnny_walker (User ID: uuid-456)  │
└──────────────────────────────────────────┘
```

**Implementation:**
```typescript
// Use cmdk library
import { Command } from 'cmdk';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  
  useHotkeys('cmd+k', () => setOpen(true));
  
  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input placeholder="Search or type a command..." />
      <Command.List>
        <Command.Group heading="Actions">
          <Command.Item onSelect={() => navigate('/admin/reports?status=PENDING')}>
            View Pending Reports
          </Command.Item>
          <Command.Item onSelect={() => openBulkActionModal()}>
            Bulk Handle Reports
          </Command.Item>
        </Command.Group>
        
        <Command.Group heading="Search Results">
          {searchResults.map(result => (
            <Command.Item key={result.id} onSelect={() => navigate(result.url)}>
              {result.title}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

**Backend Support:**
```java
GET /api/v1/admin/search
  ?q=spam john
  &types=reports,users  // Filter search types

Response:
{
  "reports": [...],
  "users": [...]
}
```

---

### 4.3 Smart Filters with Saved Presets

**Feature:** Save frequently used filter combinations

**UI:**
```
┌─────────────────────────────────────┐
│ Filters:                            │
│   Status:       [PENDING ▼]         │
│   Content Type: [POST ▼]            │
│   Report Type:  [SPAM ▼]            │
│   Date Range:   [Last 7 days ▼]     │
│                                     │
│ [Apply] [Clear] [Save Preset...]    │
│                                     │
│ Saved Presets:                      │
│   • Pending Spam Posts              │
│   • Harassment Reports (All Time)   │
│   • High Priority (Custom)          │
└─────────────────────────────────────┘
```

**Storage:** localStorage for user-specific presets

```typescript
interface FilterPreset {
  id: string;
  name: string;
  filters: {
    status?: ReportStatus;
    contentType?: string;
    reportType?: ReportType;
    dateRange?: { start: string; end: string };
  };
}

// Save preset
const savePreset = (name: string, filters: Filters) => {
  const presets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
  presets.push({ id: uuid(), name, filters });
  localStorage.setItem('filterPresets', JSON.stringify(presets));
};

// Load preset
const loadPreset = (presetId: string) => {
  const presets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
  const preset = presets.find(p => p.id === presetId);
  if (preset) setFilters(preset.filters);
};
```

---

### 4.4 Infinite Scroll vs Pagination

**Current:** Pagination (page 1, 2, 3...)  
**Proposal:** Hybrid approach

**For Report List (high volume):** Infinite scroll
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['reports', filters],
  queryFn: ({ pageParam = 0 }) => 
    api.getReports({ ...filters, page: pageParam }),
  getNextPageParam: (lastPage) => 
    lastPage.hasMore ? lastPage.page + 1 : undefined
});

// Render with react-window for performance
<InfiniteLoader
  isItemLoaded={(index) => !!data?.pages[Math.floor(index / 20)]}
  itemCount={totalCount}
  loadMoreItems={fetchNextPage}
>
  {({ onItemsRendered, ref }) => (
    <FixedSizeList
      height={600}
      itemCount={totalCount}
      itemSize={80}
      onItemsRendered={onItemsRendered}
      ref={ref}
    >
      {ReportRow}
    </FixedSizeList>
  )}
</InfiniteLoader>
```

**For Analytics (low volume):** Traditional pagination with page numbers

---

### 4.5 Quick Action Menu (Right-Click Context Menu)

**Feature:** Right-click on report → context menu

**UI:**
```
Right-click on report row:
┌────────────────────────┐
│ View Details       ⌘↵  │
│ Dismiss           D    │
│ Process           P    │
│ ───────────────────    │
│ Ban User          1    │
│ Warn User         2    │
│ ───────────────────    │
│ Copy Report ID    ⌘C   │
│ Open User Profile      │
└────────────────────────┘
```

**Implementation:**
```typescript
// Use radix-ui/react-context-menu
import * as ContextMenu from '@radix-ui/react-context-menu';

<ContextMenu.Root>
  <ContextMenu.Trigger>
    <ReportRow report={report} />
  </ContextMenu.Trigger>
  
  <ContextMenu.Content>
    <ContextMenu.Item onSelect={() => viewDetails(report)}>
      View Details <span className="shortcut">⌘↵</span>
    </ContextMenu.Item>
    <ContextMenu.Item onSelect={() => dismissReport(report)}>
      Dismiss <span className="shortcut">D</span>
    </ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item onSelect={() => banUser(report.reportedUser)}>
      Ban User
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

---

### 4.6 Bulk Selection UI Patterns

**Visual Feedback:**
```
When items selected:
┌─────────────────────────────────────────┐
│ ✓ 15 reports selected                   │
│ [Dismiss All] [Process All] [Clear]     │
└─────────────────────────────────────────┘

Report List (with selection):
☑ SPAM report by @user1 (2h ago)       ← Selected
☑ HARASSMENT by @user2 (3h ago)        ← Selected
☐ SPAM report by @user3 (4h ago)       ← Not selected
```

**Sticky Action Bar:**
```
Position: Sticky top when scrolling

┌─────────────────────────────────────────┐
│ ✓ 15 selected | [Select All] [Clear]    │
│ Actions: [Dismiss ▼] [Process ▼] [More] │
└─────────────────────────────────────────┘
```

---

## 5. Component Architecture

### 5.1 Folder Structure

```
src/
├── app/
│   ├── (admin)/                    # Admin route group
│   │   ├── layout.tsx              # Admin layout with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx            # /admin/dashboard
│   │   ├── reports/
│   │   │   ├── page.tsx            # /admin/reports (list)
│   │   │   └── [id]/
│   │   │       └── page.tsx        # /admin/reports/[id] (detail)
│   │   ├── moderation/
│   │   │   └── page.tsx            # /admin/moderation
│   │   ├── users/
│   │   │   ├── page.tsx            # /admin/users (list)
│   │   │   └── [id]/
│   │   │       └── page.tsx        # /admin/users/[id] (detail)
│   │   └── analytics/
│   │       └── page.tsx            # /admin/analytics
│   └── api/
│       └── admin/
│           └── [...proxy]/
│               └── route.ts        # Proxy to Java backend
├── components/
│   ├── admin/
│   │   ├── reports/
│   │   │   ├── ReportList.tsx
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportDetailModal.tsx
│   │   │   ├── HandleReportForm.tsx
│   │   │   └── BulkActionModal.tsx
│   │   ├── moderation/
│   │   │   ├── ModerationHistory.tsx
│   │   │   └── ModerateUserDialog.tsx
│   │   ├── analytics/
│   │   │   ├── StatCard.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   └── TopReportersTable.tsx
│   │   └── shared/
│   │       ├── FilterBar.tsx
│   │       ├── BulkSelectionBar.tsx
│   │       └── CommandPalette.tsx
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ...
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── endpoints/
│   │   │   ├── admin.ts           # Admin API methods
│   │   │   └── reports.ts         # Report API methods
│   │   └── types.ts               # API TypeScript types
│   ├── hooks/
│   │   ├── useReports.ts          # React Query hooks
│   │   ├── useModeration.ts
│   │   └── useAnalytics.ts
│   └── store/
│       └── admin-store.ts         # Zustand store
└── types/
    └── admin.ts                   # Shared TypeScript types
```

---

### 5.2 Component Design Principles

#### **5.2.1 Server Components by Default (Next.js 14+)**

```typescript
// app/(admin)/reports/page.tsx - Server Component
import { ReportList } from '@/components/admin/reports/ReportList';

export default async function ReportsPage({
  searchParams
}: {
  searchParams: { status?: string; page?: string }
}) {
  // Fetch data on server
  const reports = await fetch(`${API_URL}/reports?${new URLSearchParams(searchParams)}`);
  const data = await reports.json();
  
  return <ReportList initialData={data} />;
}
```

**Benefits:**
- ✅ Faster initial load (no loading spinner)
- ✅ SEO friendly (though admin pages don't need SEO)
- ✅ Reduced client bundle size

**Use Client Components for:**
- Interactive features (modals, forms, selections)
- Real-time updates (WebSocket)
- Browser APIs (localStorage, keyboard shortcuts)

---

#### **5.2.2 Composition over Props Drilling**

**Bad:**
```typescript
<ReportList 
  onDismiss={handleDismiss}
  onProcess={handleProcess}
  onBan={handleBan}
  onWarn={handleWarn}
  showFilters={true}
  enableBulkActions={true}
  // ... 20 more props
/>
```

**Good:**
```typescript
<ReportList>
  <ReportList.Filters>
    <StatusFilter />
    <TypeFilter />
  </ReportList.Filters>
  
  <ReportList.BulkActions>
    <DismissAction />
    <ProcessAction />
  </ReportList.BulkActions>
  
  <ReportList.Items />
</ReportList>
```

---

#### **5.2.3 Data Fetching Patterns**

**Use React Query for:**
- List data (reports, users)
- Detail views
- Analytics data

**Use Zustand for:**
- UI state (selected items, open modals)
- Filter state (across components)
- Keyboard shortcut state

**Example:**
```typescript
// React Query for data
const { data: reports } = useQuery({
  queryKey: ['reports', filters],
  queryFn: () => api.getReports(filters)
});

// Zustand for UI state
const { selectedReports, addSelection } = useAdminStore();
```

---

## 6. API Integration Guide

### 6.1 API Client Setup

**File:** `lib/api/client.ts`

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response.data.data, // Extract data from ApiResponse
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Refresh token or redirect to login
      window.location.href = '/login';
    }
    
    // Extract error message
    const message = error.response?.data?.message || 'An error occurred';
    throw new Error(message);
  }
);

export default apiClient;
```

---

### 6.2 API Endpoints Module

**File:** `lib/api/endpoints/admin.ts`

```typescript
import apiClient from '../client';
import type {
  ModerationActionRequest,
  ModerationActionResponse,
  ReportStatisticsResponse,
  UserStatisticsResponse,
  ContentStatisticsResponse,
  SystemHealthResponse,
  PageResponse
} from '../types';

export const adminApi = {
  // Moderate user
  moderateUser: (request: ModerationActionRequest) =>
    apiClient.post<ModerationActionResponse>('/admin/moderate-user', request),
  
  // Get moderation actions with filters
  getModerationActions: (params: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) =>
    apiClient.get<PageResponse<ModerationActionResponse>>(
      '/admin/moderation-actions',
      { params }
    ),
  
  // Get user moderation history
  getUserModerationHistory: (userId: string) =>
    apiClient.get<ModerationActionResponse[]>(
      `/admin/moderation-actions/user/${userId}`
    ),
  
  // Analytics
  getReportStatistics: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<ReportStatisticsResponse>('/admin/stats/reports', { params }),
  
  getUserStatistics: () =>
    apiClient.get<UserStatisticsResponse>('/admin/stats/users'),
  
  getContentStatistics: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<ContentStatisticsResponse>('/admin/stats/content', { params }),
  
  getSystemHealth: () =>
    apiClient.get<SystemHealthResponse>('/admin/stats/system-health'),
  
  // Bulk operations (NEW)
  bulkHandleReports: (request: {
    reportIds: string[];
    action: 'DISMISS' | 'PROCESS';
    reason: string;
    moderationAction?: ModerationActionType;
  }) =>
    apiClient.post<BulkHandleResult>('/admin/reports/bulk-handle', request),
  
  bulkModerateUsers: (request: {
    userIds: string[];
    actionType: ModerationActionType;
    reason: string;
    duration?: number;
  }) =>
    apiClient.post<BulkHandleResult>('/admin/users/bulk-moderate', request),
  
  // Search (for command palette)
  search: (params: { q: string; types?: string }) =>
    apiClient.get<SearchResult>('/admin/search', { params })
};
```

**File:** `lib/api/endpoints/reports.ts`

```typescript
import apiClient from '../client';
import type {
  ReportRequest,
  ReportResponse,
  HandleReportRequest,
  HandleReportResponse,
  PageResponse
} from '../types';

export const reportsApi = {
  // Submit report (USER role)
  submitReport: (request: ReportRequest) =>
    apiClient.post<ReportResponse>('/reports', request),
  
  // Get all reports (ADMIN/BA)
  getAllReports: (params: {
    status?: string;
    contentType?: string;
    reportType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) =>
    apiClient.get<PageResponse<ReportResponse>>('/reports', { params }),
  
  // Get report by ID
  getReportById: (reportId: string) =>
    apiClient.get<ReportResponse>(`/reports/${reportId}`),
  
  // Handle report
  handleReport: (reportId: string, request: HandleReportRequest) =>
    apiClient.post<HandleReportResponse>(`/reports/${reportId}/handle`, request),
  
  // Export reports (NEW)
  exportReports: (params: {
    format: 'csv' | 'json';
    status?: string;
    contentType?: string;
  }) =>
    apiClient.get<Blob>('/admin/reports/export', { 
      params,
      responseType: 'blob'
    })
};
```

---

## 7. TypeScript Types & Hooks

### 7.1 TypeScript Types

**File:** `lib/api/types.ts`

```typescript
// ============= Enums =============
export type ModerationActionType = 'BAN_USER' | 'SUSPEND_USER' | 'WARN_USER';

export type ReportType =
  | 'SPAM'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'MISINFORMATION'
  | 'INAPPROPRIATE_CONTENT'
  | 'COPYRIGHT'
  | 'IMPERSONATION'
  | 'OTHER';

export type ReportStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'PROCESSED'
  | 'DISMISSED'
  | 'ESCALATED';

export type ContentType = 'POST' | 'COMMENT' | 'USER';

// ============= API Response Wrapper =============
export interface ApiResponse<T> {
  code: number;
  message: string | null;
  data: T;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ============= User Types =============
export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: 'USER' | 'ADMIN' | 'BA';
  isLocked: boolean;
  createdAt: string;
}

// ============= Report Types =============
export interface ReportRequest {
  contentType: ContentType;
  contentId: string;
  reportType: ReportType;
  description: string;
}

export interface ReportResponse {
  id: string;
  contentType: ContentType;
  contentId: string;
  reportType: ReportType;
  status: ReportStatus;
  description: string;
  reportedBy: User;
  reportedEntity: PostSnapshot | CommentSnapshot | User;
  createdAt: string;
  updatedAt: string;
  handledBy?: User;
  handledAt?: string;
}

export interface HandleReportRequest {
  decision: 'DISMISS' | 'PROCESS' | 'ESCALATE';
  moderationAction?: ModerationActionType;
  reason: string;
  duration?: number; // For SUSPEND_USER (days)
}

export interface HandleReportResponse {
  reportId: string;
  status: ReportStatus;
  moderationAction?: ModerationActionResponse;
  handledBy: User;
  handledAt: string;
}

// ============= Moderation Types =============
export interface ModerationActionRequest {
  userId: string;
  actionType: ModerationActionType;
  reason: string;
  duration?: number; // Days (for SUSPEND_USER)
}

export interface ModerationActionResponse {
  id: string;
  actionType: ModerationActionType;
  user: User;
  moderator: User;
  reason: string;
  duration?: number;
  expiresAt?: string;
  createdAt: string;
}

// ============= Analytics Types =============
export interface ReportStatisticsResponse {
  total_reports: number;
  pending_reports: number;
  processed_reports: number;
  dismissed_reports: number;
  by_type: Record<ReportType, number>;
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
  user: User;
  report_count: number;
}

export interface MostActiveUserDto {
  user: User;
  post_count: number;
  comment_count: number;
}

export interface RecentErrorDto {
  timestamp: string;
  error_message: string;
  endpoint: string;
}

// ============= Bulk Operations (NEW) =============
export interface BulkHandleResult {
  processed: number;
  failed: number;
  errors: Array<{
    reportId?: string;
    userId?: string;
    error: string;
  }>;
}

// ============= Search (NEW) =============
export interface SearchResult {
  reports: ReportResponse[];
  users: User[];
}

// ============= Snapshots =============
export interface PostSnapshot {
  id: string;
  content: string;
  creator: User;
  createdAt: string;
}

export interface CommentSnapshot {
  id: string;
  content: string;
  creator: User;
  postId: string;
  createdAt: string;
}
```

---

### 7.2 React Query Hooks

**File:** `lib/hooks/useReports.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/endpoints/reports';
import { toast } from 'sonner';
import type { 
  ReportResponse, 
  HandleReportRequest,
  PageResponse 
} from '@/lib/api/types';

// Get all reports with filters
export function useReports(filters: {
  status?: string;
  contentType?: string;
  reportType?: string;
  page?: number;
  size?: number;
}) {
  return useQuery<PageResponse<ReportResponse>>({
    queryKey: ['reports', filters],
    queryFn: () => reportsApi.getAllReports(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // Refetch every minute for new reports
  });
}

// Get single report
export function useReport(reportId: string) {
  return useQuery<ReportResponse>({
    queryKey: ['reports', reportId],
    queryFn: () => reportsApi.getReportById(reportId),
    enabled: !!reportId
  });
}

// Handle report mutation
export function useHandleReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      reportId, 
      request 
    }: { 
      reportId: string; 
      request: HandleReportRequest;
    }) => reportsApi.handleReport(reportId, request),
    
    onSuccess: (data, variables) => {
      toast.success('Report handled successfully');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    
    onError: (error: Error) => {
      toast.error(`Failed to handle report: ${error.message}`);
    }
  });
}

// Bulk handle reports (NEW)
export function useBulkHandleReports() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.bulkHandleReports,
    
    onSuccess: (result) => {
      toast.success(
        `Processed ${result.processed} reports. Failed: ${result.failed}`
      );
      
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    
    onError: (error: Error) => {
      toast.error(`Bulk action failed: ${error.message}`);
    }
  });
}

// Export reports
export function useExportReports() {
  return useMutation({
    mutationFn: reportsApi.exportReports,
    
    onSuccess: (blob, variables) => {
      // Download CSV file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports_${new Date().toISOString().split('T')[0]}.${variables.format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Reports exported successfully');
    }
  });
}
```

**File:** `lib/hooks/useAnalytics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/endpoints/admin';
import type {
  ReportStatisticsResponse,
  UserStatisticsResponse,
  ContentStatisticsResponse,
  SystemHealthResponse
} from '@/lib/api/types';

export function useReportStatistics(dateRange?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<ReportStatisticsResponse>({
    queryKey: ['admin', 'stats', 'reports', dateRange],
    queryFn: () => adminApi.getReportStatistics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000
  });
}

export function useUserStatistics() {
  return useQuery<UserStatisticsResponse>({
    queryKey: ['admin', 'stats', 'users'],
    queryFn: () => adminApi.getUserStatistics(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useContentStatistics(dateRange?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<ContentStatisticsResponse>({
    queryKey: ['admin', 'stats', 'content', dateRange],
    queryFn: () => adminApi.getContentStatistics(dateRange),
    staleTime: 5 * 60 * 1000
  });
}

export function useSystemHealth() {
  return useQuery<SystemHealthResponse>({
    queryKey: ['admin', 'stats', 'system-health'],
    queryFn: () => adminApi.getSystemHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000 // Poll every 30s
  });
}
```

---

### 7.3 Zustand Store

**File:** `lib/store/admin-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminStore {
  // Bulk selection state
  selectedReports: Set<string>;
  selectedUsers: Set<string>;
  
  addReportSelection: (reportId: string) => void;
  removeReportSelection: (reportId: string) => void;
  toggleReportSelection: (reportId: string) => void;
  selectAllReports: (reportIds: string[]) => void;
  clearReportSelection: () => void;
  
  // Filter presets
  filterPresets: FilterPreset[];
  addFilterPreset: (preset: FilterPreset) => void;
  removeFilterPreset: (presetId: string) => void;
  
  // Command palette state
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // UI preferences
  preferences: {
    theme: 'light' | 'dark';
    compactMode: boolean;
    enableKeyboardShortcuts: boolean;
  };
  updatePreferences: (prefs: Partial<AdminStore['preferences']>) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      // Bulk selection
      selectedReports: new Set(),
      selectedUsers: new Set(),
      
      addReportSelection: (reportId) =>
        set((state) => ({
          selectedReports: new Set(state.selectedReports).add(reportId)
        })),
      
      removeReportSelection: (reportId) =>
        set((state) => {
          const newSet = new Set(state.selectedReports);
          newSet.delete(reportId);
          return { selectedReports: newSet };
        }),
      
      toggleReportSelection: (reportId) =>
        set((state) => {
          const newSet = new Set(state.selectedReports);
          if (newSet.has(reportId)) {
            newSet.delete(reportId);
          } else {
            newSet.add(reportId);
          }
          return { selectedReports: newSet };
        }),
      
      selectAllReports: (reportIds) =>
        set(() => ({ selectedReports: new Set(reportIds) })),
      
      clearReportSelection: () =>
        set(() => ({ selectedReports: new Set() })),
      
      // Filter presets
      filterPresets: [],
      
      addFilterPreset: (preset) =>
        set((state) => ({
          filterPresets: [...state.filterPresets, preset]
        })),
      
      removeFilterPreset: (presetId) =>
        set((state) => ({
          filterPresets: state.filterPresets.filter(p => p.id !== presetId)
        })),
      
      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) =>
        set(() => ({ commandPaletteOpen: open })),
      
      // Preferences
      preferences: {
        theme: 'light',
        compactMode: false,
        enableKeyboardShortcuts: true
      },
      
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        }))
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        filterPresets: state.filterPresets,
        preferences: state.preferences
      })
    }
  )
);
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Setup project + auth + basic UI

- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Setup shadcn/ui components
- [ ] Configure TanStack Query + Zustand
- [ ] Implement authentication (NextAuth.js)
- [ ] Create admin layout with navigation
- [ ] Setup API client with interceptors
- [ ] Create TypeScript types for all DTOs

**Deliverables:**
- Working admin dashboard shell
- Login/logout flow
- Protected routes with role check
- API client ready for integration

---

### Phase 2: Report Management (Week 2-3)
**Goal:** Core report handling features

**Week 2:**
- [ ] Report list page with filters
- [ ] Report card component
- [ ] Filter bar with status/type/date filters
- [ ] Pagination or infinite scroll
- [ ] Loading states + error handling

**Week 3:**
- [ ] Report detail modal
- [ ] Handle report form (Dismiss/Process)
- [ ] User profile preview in modal
- [ ] Moderation action history
- [ ] Success/error toast notifications

**Deliverables:**
- Functional report management UI
- Can view, filter, and handle reports
- Full error handling

---

### Phase 3: Bulk Operations & Efficiency Features (Week 4)
**Goal:** Speed optimizations

- [ ] Bulk selection UI (checkboxes)
- [ ] Bulk action modal
- [ ] Keyboard shortcuts (J/K navigation)
- [ ] Command palette (Cmd+K)
- [ ] Filter presets (save/load)
- [ ] Context menu (right-click actions)
- [ ] Sticky bulk action bar

**Backend Required:**
- New endpoints: `/admin/reports/bulk-handle`, `/admin/users/bulk-moderate`

**Deliverables:**
- Admin can handle 50 reports with 3 clicks
- Full keyboard navigation
- Command palette for quick actions

---

### Phase 4: User Management & Moderation (Week 5)
**Goal:** User administration

- [ ] User list page with search
- [ ] User detail page
- [ ] Moderate user dialog
- [ ] User moderation history
- [ ] Lock/unlock user action
- [ ] Bulk user moderation

**Deliverables:**
- Complete user management UI
- User search and filtering
- Moderation actions on users

---

### Phase 5: Analytics Dashboard (Week 6)
**Goal:** Data visualization

- [ ] Dashboard layout with stat cards
- [ ] Report statistics (total, pending, by type)
- [ ] User statistics (total, active, locked)
- [ ] Content statistics (posts, comments)
- [ ] System health widget
- [ ] Trend charts (Chart.js or Recharts)
- [ ] Date range picker for analytics

**Advanced (if time permits):**
- [ ] Anomaly detection alerts
- [ ] Custom report builder

**Deliverables:**
- Comprehensive analytics dashboard
- Real-time system health
- Visual trend charts

---

### Phase 6: Polish & Testing (Week 7)
**Goal:** Production readiness

- [ ] Responsive design (mobile/tablet)
- [ ] Dark mode support
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Performance optimization (Lighthouse score >90)
- [ ] Error boundary components
- [ ] Loading skeletons
- [ ] Documentation (README + Storybook)

**Deliverables:**
- Production-ready admin dashboard
- Full test coverage
- Performance optimized
- Accessible

---

## 9. Success Metrics

### 9.1 Functional Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Report Handling Speed** | <30s per report | Time from opening report to submitting action |
| **Bulk Action Efficiency** | 50 reports in <2 min | Time to select + confirm bulk action |
| **Filter Application** | <500ms | Time from clicking filter to results update |
| **Search Response Time** | <1s | Time from search input to results |
| **Chart Render Time** | <2s | Time to render analytics charts |

### 9.2 Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| **Test Coverage** | >80% | Vitest |
| **Lighthouse Score** | >90 | Chrome DevTools |
| **Bundle Size** | <500KB (gzipped) | Next.js Bundle Analyzer |
| **Accessibility** | WCAG 2.1 AA | axe DevTools |
| **Type Safety** | 0 `any` types | TypeScript strict mode |

### 9.3 User Experience Metrics

- **Admin Satisfaction Score:** >8/10 (post-launch survey)
- **Feature Adoption:** >80% of admins use keyboard shortcuts within 1 week
- **Error Rate:** <2% of actions result in errors
- **Support Tickets:** <5 tickets per week after launch

---

## 10. Risk Mitigation

### 10.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Backend API not ready for bulk operations** | HIGH | Phase bulk features for later sprint; focus on core features first |
| **Performance issues with large report lists** | MEDIUM | Implement virtual scrolling (react-window); use pagination as fallback |
| **Complex filter logic causes bugs** | MEDIUM | Comprehensive unit tests; use TypeScript discriminated unions |
| **Keyboard shortcuts conflict with browser** | LOW | Use non-standard combos; provide customization |

### 10.2 Timeline Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **Backend delays bulk endpoints** | MEDIUM | Implement frontend UI; mock API responses for demo |
| **Scope creep from stakeholders** | HIGH | Lock features in Phase 1; defer nice-to-haves to Phase 2 |
| **Testing takes longer than planned** | MEDIUM | Parallel testing during dev; use Playwright codegen |

---

## 11. Next Steps

### 11.1 Immediate Actions (This Week)

1. **Backend Team:**
   - [ ] Review bulk operation proposals
   - [ ] Estimate effort for new endpoints
   - [ ] Confirm API response formats match TypeScript types
   - [ ] Add OpenAPI/Swagger annotations to existing endpoints

2. **Frontend Team:**
   - [ ] Setup Next.js project with shadcn/ui
   - [ ] Create GitHub repository + project board
   - [ ] Define component naming conventions
   - [ ] Setup CI/CD pipeline (GitHub Actions)

3. **Design Team:**
   - [ ] Create Figma mockups for bulk action modal
   - [ ] Design command palette UI
   - [ ] Define color tokens for admin theme
   - [ ] Create loading skeleton designs

### 11.2 Stakeholder Review

- [ ] Schedule demo of backend APIs (Postman)
- [ ] Present UI/UX proposals to product owner
- [ ] Get approval on bulk operations scope
- [ ] Confirm analytics requirements with BA team

### 11.3 Documentation

- [ ] Create API documentation (this document serves as primary)
- [ ] Write component documentation in Storybook
- [ ] Document keyboard shortcuts in help modal
- [ ] Create admin user guide (PDF)

---

## 12. Appendix

### 12.1 Component Library (shadcn/ui)

**Recommended components to install:**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add context-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add command
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add form
```

### 12.2 Useful Libraries

**Data Visualization:**
```bash
npm install recharts
# or
npm install chart.js react-chartjs-2
```

**Keyboard Shortcuts:**
```bash
npm install react-hotkeys-hook
```

**Command Palette:**
```bash
npm install cmdk
```

**Virtual Scrolling:**
```bash
npm install react-window
npm install react-virtuoso
```

**Date Handling:**
```bash
npm install date-fns
```

**Form Validation:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

### 12.3 Environment Variables

**File:** `.env.local`

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_BULK_ACTIONS=true
NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS=false
NEXT_PUBLIC_ENABLE_COMMAND_PALETTE=true
```

---

## Conclusion

This comprehensive guide provides:

✅ **Feature Expansion:** Bulk operations + advanced analytics  
✅ **Speed-Focused UX:** Keyboard shortcuts, command palette, bulk actions  
✅ **Complete Integration Guide:** API endpoints, TypeScript types, React hooks  
✅ **Production-Ready Architecture:** Next.js 14, React Query, Zustand, shadcn/ui  
✅ **Clear Implementation Roadmap:** 7-week plan with deliverables

**Estimated Timeline:** 7 weeks (2 BE + 5 FE + 1 QA overlap)  
**Team Size:** 2 frontend devs + 1 backend dev + 1 QA

**Status:** ✅ Brainstorming Complete - Ready for Planning

---

**Next Action:** Create detailed implementation plan with `/plan` command?

**Questions/Feedback:** Review with team and adjust priorities as needed.

**Document Owner:** Development Team  
**Last Updated:** 2026-05-21  
**Version:** 1.0
