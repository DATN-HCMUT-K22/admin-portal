# TripJoy Admin Dashboard - Frontend Implementation Guide

**Version:** 1.0  
**Date:** 2026-05-21  
**Purpose:** Comprehensive frontend planning document for Admin & BA dashboard implementation  
**Target Framework:** Next.js 14+ (React, TypeScript)  
**Backend Reference:** `/docs/plans/admin-api-implementation/`

---

## Executive Summary

This document provides complete frontend specifications for building the TripJoy Admin Dashboard, a dual-role administrative interface for System Administrators (ADMIN) and Business Administrators (BA). The dashboard enables content moderation, user management, violation reporting, and system analytics.

**Key Deliverables:**
- 4 core feature modules (Report Management, User Moderation, User Management, Analytics)
- 12 API endpoints integration
- Role-based access control (RBAC)
- Real-time data with optimistic updates
- Responsive admin interface

**Technology Stack:**
- **Framework:** Next.js 14+ with App Router
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** TanStack Query (React Query) + Zustand
- **API Client:** Axios with interceptors
- **Authentication:** JWT with NextAuth.js
- **Forms:** React Hook Form + Zod validation

---

## Table of Contents

1. [Problem Statement & Requirements](#1-problem-statement--requirements)
2. [Role Definitions](#2-role-definitions)
3. [Architecture Overview](#3-architecture-overview)
4. [Technical Stack Rationale](#4-technical-stack-rationale)
5. [Feature Specifications](#5-feature-specifications)
   - [5.1 Report Management](#51-report-management)
   - [5.2 User Moderation](#52-user-moderation)
   - [5.3 User Management](#53-user-management)
   - [5.4 Analytics Dashboard](#54-analytics-dashboard)
6. [API Integration Guide](#6-api-integration-guide)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [State Management Patterns](#8-state-management-patterns)
9. [UI/UX Guidelines](#9-uiux-guidelines)
10. [Implementation Phases](#10-implementation-phases)
11. [Testing Strategy](#11-testing-strategy)
12. [Success Criteria](#12-success-criteria)
13. [Risk Management](#13-risk-management)

---

## 1. Problem Statement & Requirements

### 1.1 Business Objectives

**Primary Goals:**
- Enable BA team to efficiently moderate user-reported content
- Provide ADMIN team complete system control and visibility
- Reduce response time for violation reports from hours to minutes
- Maintain platform safety and community guidelines compliance

**User Roles:**
1. **System Administrator (ADMIN)**: Full system control - user CRUD, RBAC, system monitoring, all moderation actions
2. **Business Administrator (BA)**: Content moderation, report handling, user behavior monitoring, limited user actions

### 1.2 Functional Requirements

**Core Features:**
- ✅ Report submission (users) and handling (admins)
- ✅ User search, filtering, status management
- ✅ Direct moderation actions (ban, warn, suspend)
- ✅ Analytics dashboard with real-time metrics
- ✅ Audit trail for all admin actions
- ✅ Notification system for critical events

**Non-Functional Requirements:**
- **Performance:** Page load <2s, API response <500ms, real-time updates <1s delay
- **Security:** Role-based access, CSRF protection, XSS prevention, secure token storage
- **Accessibility:** WCAG 2.1 AA compliance
- **Responsive:** Desktop-first (1280px+), tablet support (768px+)

---

## 2. Role Definitions

### 2.1 ADMIN Permissions

**Full Access:**
- ✅ All BA permissions
- ✅ Create/delete user accounts
- ✅ Assign/revoke roles
- ✅ Manage roles & permissions (CRUD)
- ✅ View system activity logs
- ✅ Access all analytics endpoints

**Exclusive Endpoints:**
- `POST /api/v1/users` - Create user
- `PUT /api/v1/users/{userId}/roles` - Assign roles
- `GET /api/v1/admin/activity-logs` - System logs

### 2.2 BA Permissions

**Content Moderation:**
- ✅ View all reports (POST, COMMENT, USER)
- ✅ Handle reports (approve/dismiss/escalate)
- ✅ Direct user moderation (ban/warn/suspend)
- ✅ View user statistics
- ✅ Lock/unlock user accounts

**Restrictions:**
- ❌ Cannot create users
- ❌ Cannot assign roles
- ❌ Cannot access system activity logs

### 2.3 Shared Permissions (ADMIN + BA)

- View user list (paginated, searchable)
- View user details (admin view)
- Lock/unlock user accounts
- View moderation history
- Access analytics dashboard

---

## 3. Architecture Overview

### 3.1 Application Structure

```
admin-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx            # Main dashboard layout
│   │   ├── reports/              # Report management
│   │   │   ├── page.tsx          # Report list
│   │   │   └── [id]/             # Report detail
│   │   ├── moderation/           # User moderation
│   │   │   ├── page.tsx          # Moderation history
│   │   │   └── actions/
│   │   ├── users/                # User management
│   │   │   ├── page.tsx          # User list
│   │   │   └── [id]/             # User detail
│   │   └── analytics/            # Analytics dashboard
│   │       └── page.tsx
│   └── api/                      # API routes (optional proxy)
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── reports/
│   │   ├── moderation/
│   │   ├── users/
│   │   └── analytics/
│   ├── layouts/                  # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/                       # shadcn/ui components
│   └── shared/                   # Shared components
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts             # Axios instance
│   │   ├── endpoints/
│   │   │   ├── reports.ts
│   │   │   ├── admin.ts
│   │   │   └── users.ts
│   │   └── types.ts              # API type definitions
│   ├── hooks/                    # Custom hooks
│   ├── stores/                   # Zustand stores
│   └── utils/                    # Utilities
├── types/                        # TypeScript types
└── public/
```

### 3.2 Data Flow

```
User Action → Component → API Hook (TanStack Query) → API Client (Axios) 
                                                            ↓
Backend API ← HTTP Request ← Interceptors (Auth, Error)
                                                            ↓
    ↓                                                       ↓
Response → Cache Update → UI Update → Optimistic Update (if applicable)
```

---

## 4. Technical Stack Rationale

### 4.1 Component Library: shadcn/ui

**Why shadcn/ui:**
- ✅ **Accessibility:** Built on Radix UI primitives (WCAG 2.1 AA compliant)
- ✅ **Customization:** Copy-paste components, full control over code
- ✅ **TypeScript:** First-class TypeScript support
- ✅ **Tailwind CSS:** Consistent styling, easy theming
- ✅ **Admin-friendly:** Excellent data tables, forms, dialogs, dropdowns

**Key Components for Admin Dashboard:**
- `<DataTable>` - Report lists, user lists, moderation history
- `<Dialog>` - Report handling modals, confirmation dialogs
- `<Form>` - Report submission, moderation actions
- `<Select>`, `<Combobox>` - Filters, status dropdowns
- `<Badge>` - Report status, user roles
- `<Card>` - Analytics metrics, stat cards
- `<Tabs>` - Report filtering, user sections

**Alternative Considered:**
- **Ant Design**: More opinionated, heavier bundle, less customization
- **MUI**: Good but more complex setup, theming can be cumbersome

### 4.2 State Management: TanStack Query + Zustand

**TanStack Query (React Query) for Server State:**
- ✅ **Caching:** Automatic caching with 5-minute TTL (matches backend)
- ✅ **Optimistic Updates:** Instant UI feedback before API response
- ✅ **Background Sync:** Automatic refetch on window focus
- ✅ **Pagination:** Built-in pagination support
- ✅ **Mutations:** Easy mutation handling with rollback

**Zustand for Client State:**
- ✅ **Simple:** Minimal boilerplate, no providers
- ✅ **TypeScript:** Excellent TypeScript inference
- ✅ **Use Cases:** UI state (sidebar open/closed, selected filters, current user)

**Why Not Redux:**
- ❌ Too much boilerplate for admin dashboard
- ❌ TanStack Query handles server state better
- ❌ Zustand is sufficient for client state

### 4.3 Forms: React Hook Form + Zod

**Why React Hook Form:**
- ✅ Performance: Uncontrolled components, minimal re-renders
- ✅ Validation: Integrates perfectly with Zod for type-safe validation
- ✅ DX: Excellent TypeScript support, intuitive API

**Why Zod:**
- ✅ Type Safety: Schema-based validation with TypeScript inference
- ✅ Reusable: Share validation schemas between frontend/backend
- ✅ Error Messages: Easy custom error messages

### 4.4 Authentication: NextAuth.js

**Why NextAuth.js:**
- ✅ JWT Support: Built-in JWT strategy
- ✅ RBAC: Easy role-based access control
- ✅ Middleware: Protect routes with middleware
- ✅ Next.js Integration: Seamless with App Router

---

## 5. Feature Specifications

### 5.1 Report Management

**Feature Overview:**  
Handle user-submitted violation reports for posts, comments, and users. BA/ADMIN can view, filter, and take action on reports.

#### 5.1.1 Report List Screen

**Route:** `/reports`  
**Permissions:** ADMIN, BA

**UI Components:**

```
┌─────────────────────────────────────────────────────────────┐
│ Reports                                    [🔔] [👤 Admin]   │
├─────────────────────────────────────────────────────────────┤
│ Filters:                                                     │
│ [Status ▼] [Content Type ▼] [Report Type ▼] [Date Range]   │
│                                              [Clear Filters] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DataTable: Reports (Paginated)                          │ │
│ ├────────┬────────┬──────────┬────────┬──────┬───────────┤ │
│ │ Status │ Type   │ Content  │ Report │ Date │ Actions   │ │
│ ├────────┼────────┼──────────┼────────┼──────┼───────────┤ │
│ │ 🔴 PEND│ POST   │ SPAM     │ @user1 │ 2h   │ [View]    │ │
│ │ 🟡 PROC│ COMMENT│ HARASS   │ @user2 │ 5h   │ [View]    │ │
│ │ 🟢 DISM│ POST   │ MSINF    │ @user3 │ 1d   │ [View]    │ │
│ └────────┴────────┴──────────┴────────┴──────┴───────────┘ │
│                                    Page 1 of 12  [< 1 2 >]  │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time report list with filters
- Color-coded status badges (PENDING=red, PROCESSED=yellow, DISMISSED=green)
- Sortable columns (date, status, type)
- Pagination (10/25/50 per page)
- Search bar (search by reporter, content text)

**API Endpoint:**
```typescript
GET /api/v1/reports?status=PENDING&contentType=POST&page=0&size=10
```

**State Management:**
```typescript
// TanStack Query hook
const { data, isLoading, error } = useReports({
  status: selectedStatus,
  contentType: selectedContentType,
  reportType: selectedReportType,
  startDate: dateRange?.from,
  endDate: dateRange?.to,
  page: currentPage,
  size: pageSize,
});
```

**Component Hierarchy:**
```
ReportListPage
├── ReportFilters (Select, DateRangePicker)
├── ReportTable (DataTable)
│   └── ReportRow
│       ├── StatusBadge
│       ├── ContentPreview
│       └── ActionButtons
└── Pagination
```

#### 5.1.2 Report Detail & Handling Screen

**Route:** `/reports/[id]`  
**Permissions:** ADMIN, BA

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Reports              Report #12345                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Report Details                                          │ │
│ │ Status: 🔴 PENDING                                      │ │
│ │ Type: SPAM                                              │ │
│ │ Content: POST                                           │ │
│ │ Reported by: @user123 (John Doe)                       │ │
│ │ Reported at: 2026-05-21 10:30 AM                       │ │
│ │ Description: This post contains promotional links...    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Reported Content                                        │ │
│ │ Creator: @spammer456 (Jane Spammer)                    │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [Image: Travel photo]                               │ │ │
│ │ │ Check out this amazing deal on flights! Visit...   │ │ │
│ │ │ #ad #sponsored #travel                              │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Handle Report                                           │ │
│ │ Decision: ( ) Dismiss  (•) Process  ( ) Escalate       │ │
│ │                                                          │ │
│ │ Action: [Delete Content ▼]  (if Process selected)      │ │
│ │         Options: Warn User / Delete Content /           │ │
│ │                  Ban User (Temporary) / Ban (Permanent) │ │
│ │                                                          │ │
│ │ Reason: [Required text area]                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Spam content violates community guidelines...       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                          │ │
│ │                        [Cancel] [Submit Decision]       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoints:**
```typescript
// Get report details
GET /api/v1/reports/{reportId}

// Handle report
POST /api/v1/reports/{reportId}/handle
Body: {
  decision: "PROCESS" | "DISMISS" | "ESCALATE",
  action?: "WARN_USER" | "DELETE_CONTENT" | "BAN_USER_TEMPORARY" | "BAN_USER_PERMANENT",
  reason: string,
  banDuration?: number  // days, if BAN_USER_TEMPORARY
}
```

**Form Validation (Zod):**
```typescript
const handleReportSchema = z.object({
  decision: z.enum(["PROCESS", "DISMISS", "ESCALATE"]),
  action: z.enum([
    "WARN_USER",
    "DELETE_CONTENT",
    "BAN_USER_TEMPORARY",
    "BAN_USER_PERMANENT"
  ]).optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  banDuration: z.number().min(1).max(30).optional(),
}).refine(
  (data) => data.decision !== "PROCESS" || data.action !== undefined,
  { message: "Action is required when processing a report", path: ["action"] }
);
```

**Component Hierarchy:**
```
ReportDetailPage
├── ReportInfo (Card)
├── ReportedContent (Card)
│   ├── PostPreview (if POST)
│   ├── CommentPreview (if COMMENT)
│   └── UserProfile (if USER)
└── HandleReportForm (Dialog or Card)
    ├── RadioGroup (decision)
    ├── Select (action, conditional)
    ├── Textarea (reason)
    └── SubmitButton
```

---

### 5.2 User Moderation

**Feature Overview:**  
Direct moderation actions on users (not report-driven). View moderation history and undo actions if needed.

#### 5.2.1 User Moderation Screen

**Route:** `/moderation/actions`  
**Permissions:** ADMIN, BA

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Moderation Actions                         [🔔] [👤 Admin]   │
├─────────────────────────────────────────────────────────────┤
│ Filters:                                                     │
│ [User Search] [Action Type ▼] [Date Range]  [Clear Filters] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DataTable: Moderation History                           │ │
│ ├────────┬──────────┬────────┬──────────┬──────┬─────────┤ │
│ │ User   │ Action   │ Reason │ Moderator│ Date │ Actions │ │
│ ├────────┼──────────┼────────┼──────────┼──────┼─────────┤ │
│ │ @user1 │ BAN_PERM │ Spam   │ @admin1  │ 2h   │ [Undo]  │ │
│ │ @user2 │ WARN     │ Harass │ @ba_01   │ 5h   │ -       │ │
│ │ @user3 │ BAN_TEMP │ Violat │ @admin2  │ 1d   │ [Undo]  │ │
│ └────────┴──────────┴────────┴──────────┴──────┴─────────┘ │
│                                    Page 1 of 8   [< 1 2 >]  │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoints:**
```typescript
// Get all moderation actions (with filters)
GET /api/v1/admin/moderation-actions?userId={uuid}&actionType={type}&startDate={date}&endDate={date}

// Get user-specific moderation history
GET /api/v1/admin/moderation-actions/user/{userId}

// Perform moderation action
POST /api/v1/admin/moderate-user
Body: {
  userId: string,
  actionType: "WARN_USER" | "BAN_USER_TEMPORARY" | "BAN_USER_PERMANENT" | "DELETE_CONTENT",
  reason: string,
  banDuration?: number  // days
}

// Undo moderation action (optional, Phase 7)
POST /api/v1/admin/moderation-actions/{actionId}/undo
```

**Component Hierarchy:**
```
ModerationActionsPage
├── ModerationFilters
├── ModerationTable (DataTable)
│   └── ModerationRow
│       ├── UserInfo
│       ├── ActionBadge
│       └── UndoButton (conditional)
└── Pagination
```

#### 5.2.2 Moderate User Dialog

**Trigger:** From user detail page or moderation screen  
**Permissions:** ADMIN, BA

**UI Layout:**

```
┌─────────────────────────────────────────┐
│ Moderate User: @username123             │
├─────────────────────────────────────────┤
│ Action Type:                             │
│ [Select Action ▼]                        │
│   - Warn User                            │
│   - Ban User (Temporary - 1-30 days)    │
│   - Ban User (Permanent)                │
│                                          │
│ Ban Duration: (if temporary)             │
│ [___] days  (1-30)                       │
│                                          │
│ Reason: *                                │
│ ┌─────────────────────────────────────┐ │
│ │ Repeated spam violations...          │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ⚠️  This action will:                    │
│ • Lock the user account                 │
│ • Send notification to user             │
│ • Record in moderation history          │
│                                          │
│               [Cancel] [Confirm Action] │
└─────────────────────────────────────────┘
```

**Form Schema:**
```typescript
const moderateUserSchema = z.object({
  userId: z.string().uuid(),
  actionType: z.enum([
    "WARN_USER",
    "BAN_USER_TEMPORARY",
    "BAN_USER_PERMANENT",
  ]),
  reason: z.string().min(10),
  banDuration: z.number().min(1).max(30).optional(),
}).refine(
  (data) => data.actionType !== "BAN_USER_TEMPORARY" || data.banDuration !== undefined,
  { message: "Ban duration is required for temporary bans", path: ["banDuration"] }
);
```

---

### 5.3 User Management

**Feature Overview:**  
Search, view, and manage user accounts. ADMIN can create users and assign roles. Both ADMIN and BA can lock/unlock accounts.

#### 5.3.1 User List Screen

**Route:** `/users`  
**Permissions:** ADMIN, BA

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Users                             [+ Create User] [🔔] [👤]  │
│                                   (ADMIN only)                │
├─────────────────────────────────────────────────────────────┤
│ Search: [_______________] 🔍                                 │
│ Filters: [Role ▼] [Status ▼] [Registration Date]            │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DataTable: Users                                        │ │
│ ├─────────┬──────────┬─────────┬────────┬──────┬─────────┤ │
│ │ Avatar  │ Username │ Email   │ Role   │ Stat │ Actions │ │
│ ├─────────┼──────────┼─────────┼────────┼──────┼─────────┤ │
│ │ [IMG]   │ @user123 │ u@ex.cm │ USER   │ 🟢   │ [View]  │ │
│ │ [IMG]   │ @admin01 │ a@ex.cm │ ADMIN  │ 🟢   │ [View]  │ │
│ │ [IMG]   │ @locked  │ l@ex.cm │ USER   │ 🔴   │ [View]  │ │
│ └─────────┴──────────┴─────────┴────────┴──────┴─────────┘ │
│                                    Page 1 of 45  [< 1 2 >]  │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoint:**
```typescript
GET /api/v1/users?q={keyword}&role={role}&status={status}&page={n}&size={m}
```

**Component Hierarchy:**
```
UserListPage
├── UserSearch (Input with debounce)
├── UserFilters (Select components)
├── CreateUserButton (ADMIN only)
├── UserTable (DataTable)
│   └── UserRow
│       ├── Avatar
│       ├── UserInfo
│       ├── RoleBadge
│       ├── StatusIndicator
│       └── ViewButton
└── Pagination
```

#### 5.3.2 User Detail Screen

**Route:** `/users/[id]`  
**Permissions:** ADMIN, BA

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Users                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐ ┌───────────────────────────────────┐ │
│ │ [User Avatar]     │ │ @username123                      │ │
│ │                   │ │ John Doe • john@example.com       │ │
│ │ [Change Photo]    │ │ USER • 🟢 Active                   │ │
│ └───────────────────┘ │ Member since: Jan 2025            │ │
│                       │ Last active: 2 hours ago          │ │
│                       │                                    │ │
│                       │ [🔒 Lock Account] [⚠️ Moderate]    │ │
│                       │ [👑 Assign Roles] (ADMIN only)     │ │
│                       └───────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Tabs: [Statistics] [Activity] [Moderation History]          │
├─────────────────────────────────────────────────────────────┤
│ Statistics Tab:                                              │
│ ┌────────────┬────────────┬────────────┬────────────┐       │
│ │ Posts      │ Comments   │ Likes      │ Followers  │       │
│ │ 47         │ 152        │ 890        │ 234        │       │
│ └────────────┴────────────┴────────────┴────────────┘       │
│                                                               │
│ ┌────────────┬────────────┬────────────┬────────────┐       │
│ │ Reports    │ Violations │ Warnings   │ Bans       │       │
│ │ Received   │ Confirmed  │            │            │       │
│ │ 2          │ 1          │ 1          │ 0          │       │
│ └────────────┴────────────┴────────────┴────────────┘       │
│                                                               │
│ Activity Timeline:                                           │
│ [Chart: Posts per week]                                      │
│                                                               │
│ Moderation History Tab:                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Date        Action      Reason          Moderator       │ │
│ │ 2026-03-15  WARN_USER   Spam comments   @admin_ba_01    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoints:**
```typescript
// Get user details (admin view)
GET /api/v1/users/{userId}/admin-view

// Lock/unlock user
PATCH /api/v1/users/{userId}/status
Body: { isLocked: boolean, reason?: string }

// Assign roles (ADMIN only)
PUT /api/v1/users/{userId}/roles
Body: { roles: string[] }

// Get user statistics (future endpoint)
GET /api/v1/admin/user-statistics/{userId}
```

**Component Hierarchy:**
```
UserDetailPage
├── UserHeader
│   ├── Avatar
│   ├── UserInfo
│   └── ActionButtons
│       ├── LockAccountButton
│       ├── ModerateButton
│       └── AssignRolesButton (ADMIN only)
├── Tabs (Statistics, Activity, Moderation History)
│   ├── StatisticsTab
│   │   ├── StatCards
│   │   └── ActivityChart
│   ├── ActivityTab
│   │   └── ActivityTimeline
│   └── ModerationHistoryTab
│       └── ModerationTable
```

---

### 5.4 Analytics Dashboard

**Feature Overview:**  
Real-time metrics and insights for admin decision-making. Includes report statistics, user growth, content stats, and system health.

#### 5.4.1 Analytics Dashboard Screen

**Route:** `/analytics`  
**Permissions:** ADMIN, BA

**UI Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                        [🔔] [👤 Admin]   │
│ Date Range: [Last 30 days ▼]                                │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│ │ Total Reports│ Pending      │ Processed    │ Dismissed  │ │
│ │ 1,234        │ 45 ⚠️        │ 1,089 ✓      │ 100        │ │
│ │ +12% vs last │              │              │            │ │
│ └──────────────┴──────────────┴──────────────┴────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Reports Trend (Last 30 Days)                            │ │
│ │ [Line Chart: Daily report submissions]                  │ │
│ │                                                          │ │
│ │  │                                  ╱╲                   │ │
│ │  │                       ╱╲        ╱  ╲                  │ │
│ │  │          ╱╲          ╱  ╲      ╱    ╲                 │ │
│ │  │         ╱  ╲   ╱╲   ╱    ╲    ╱      ╲    ╱╲         │ │
│ │  └────────────────────────────────────────────────────   │ │
│ │    Day 1                               Day 30            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌───────────────────────────┬───────────────────────────┐   │
│ │ Report Breakdown by Type  │ Top Reporters             │   │
│ │ [Pie Chart]               │ 1. @user123 - 45 reports  │   │
│ │                           │ 2. @user456 - 32 reports  │   │
│ │ SPAM: 45%                 │ 3. @user789 - 28 reports  │   │
│ │ HARASSMENT: 25%           │ 4. @userABC - 21 reports  │   │
│ │ HATE_SPEECH: 15%          │ 5. @userDEF - 18 reports  │   │
│ │ OTHER: 15%                │                           │   │
│ └───────────────────────────┴───────────────────────────┘   │
│                                                               │
│ ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│ │ Total Users  │ New Today    │ Active Users │ Locked     │ │
│ │ 45,234       │ +123         │ 12,450       │ 45         │ │
│ └──────────────┴──────────────┴──────────────┴────────────┘ │
│                                                               │
│ ┌───────────────────────────┬───────────────────────────┐   │
│ │ Content Statistics        │ System Health             │   │
│ │ Posts: 8,456 (+234)       │ API Uptime: 99.98%        │   │
│ │ Comments: 24,123 (+567)   │ Avg Response: 145ms       │   │
│ │ Reactions: 89,234 (+1.2k) │ Error Rate: 0.02%         │   │
│ └───────────────────────────┴───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**API Endpoints:**
```typescript
// Report statistics
GET /api/v1/admin/stats/reports?startDate={date}&endDate={date}
Response: {
  totalReports: number,
  pendingReports: number,
  processedReports: number,
  dismissedReports: number,
  reportsByType: { type: string, count: number }[],
  reportsByStatus: { status: string, count: number }[],
  dailyTrends: { date: string, count: number }[],
  topReporters: { userId: string, username: string, reportCount: number }[]
}

// User statistics
GET /api/v1/admin/stats/users
Response: {
  totalUsers: number,
  activeUsersToday: number,
  newUsersToday: number,
  lockedUsers: number,
  userGrowthRate: number,  // percentage
  mostActiveUsers: { userId: string, username: string, activityScore: number }[]
}

// Content statistics
GET /api/v1/admin/stats/content?startDate={date}&endDate={date}
Response: {
  totalPosts: number,
  totalComments: number,
  totalReactions: number,
  postsToday: number,
  commentsToday: number,
  contentTrends: { date: string, posts: number, comments: number }[]
}

// System health
GET /api/v1/admin/stats/system-health
Response: {
  apiUptime: number,  // percentage
  avgResponseTime: number,  // milliseconds
  errorRate: number,  // percentage
  activeConnections: number,
  cacheHitRate: number  // percentage
}
```

**Component Hierarchy:**
```
AnalyticsDashboardPage
├── DateRangeSelector
├── StatCards
│   └── StatCard (total, pending, processed, dismissed)
├── ReportsTrendChart (Line chart)
├── TwoColumnLayout
│   ├── ReportBreakdownChart (Pie chart)
│   └── TopReportersList
├── UserStatsCards
└── TwoColumnLayout
    ├── ContentStatsCard
    └── SystemHealthCard
```

**Charting Library:** **Recharts**  
**Why:** Composable, responsive, good TypeScript support, works well with React

---

## 6. API Integration Guide

### 6.1 API Client Setup

**File:** `lib/api/client.ts`

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to all requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized: Sign out user
      await signOut({ callbackUrl: '/login' });
    }

    if (error.response?.status === 403) {
      // Forbidden: User doesn't have permission
      // Show toast notification
    }

    return Promise.reject(error);
  }
);
```

### 6.2 API Endpoints Module

**File:** `lib/api/endpoints/reports.ts`

```typescript
import { apiClient } from '../client';
import type { 
  ReportResponse, 
  ReportRequest, 
  HandleReportRequest, 
  HandleReportResponse,
  PaginatedResponse 
} from '../types';

export const reportsApi = {
  // Submit a report (users)
  submitReport: async (data: ReportRequest) => {
    const response = await apiClient.post<{ data: ReportResponse }>('/api/v1/reports', data);
    return response.data.data;
  },

  // Get all reports with filters (admin)
  getReports: async (params: {
    status?: string;
    contentType?: string;
    reportType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await apiClient.get<{ data: PaginatedResponse<ReportResponse> }>(
      '/api/v1/reports',
      { params }
    );
    return response.data.data;
  },

  // Get report by ID (admin)
  getReportById: async (reportId: string) => {
    const response = await apiClient.get<{ data: ReportResponse }>(
      `/api/v1/reports/${reportId}`
    );
    return response.data.data;
  },

  // Handle a report (admin)
  handleReport: async (reportId: string, data: HandleReportRequest) => {
    const response = await apiClient.post<{ data: HandleReportResponse }>(
      `/api/v1/reports/${reportId}/handle`,
      data
    );
    return response.data.data;
  },
};
```

**File:** `lib/api/endpoints/admin.ts`

```typescript
import { apiClient } from '../client';
import type { 
  ModerationActionRequest,
  ModerationActionResponse,
  ReportStatisticsResponse,
  UserStatisticsResponse,
  ContentStatisticsResponse,
  SystemHealthResponse,
  PaginatedResponse 
} from '../types';

export const adminApi = {
  // Moderate user
  moderateUser: async (data: ModerationActionRequest) => {
    const response = await apiClient.post<{ data: ModerationActionResponse }>(
      '/api/v1/admin/moderate-user',
      data
    );
    return response.data.data;
  },

  // Get moderation actions with filters
  getModerationActions: async (params: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await apiClient.get<{ data: PaginatedResponse<ModerationActionResponse> }>(
      '/api/v1/admin/moderation-actions',
      { params }
    );
    return response.data.data;
  },

  // Get user moderation history
  getUserModerationHistory: async (userId: string) => {
    const response = await apiClient.get<{ data: ModerationActionResponse[] }>(
      `/api/v1/admin/moderation-actions/user/${userId}`
    );
    return response.data.data;
  },

  // Analytics endpoints
  getReportStatistics: async (params: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get<{ data: ReportStatisticsResponse }>(
      '/api/v1/admin/stats/reports',
      { params }
    );
    return response.data.data;
  },

  getUserStatistics: async () => {
    const response = await apiClient.get<{ data: UserStatisticsResponse }>(
      '/api/v1/admin/stats/users'
    );
    return response.data.data;
  },

  getContentStatistics: async (params: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get<{ data: ContentStatisticsResponse }>(
      '/api/v1/admin/stats/content',
      { params }
    );
    return response.data.data;
  },

  getSystemHealth: async () => {
    const response = await apiClient.get<{ data: SystemHealthResponse }>(
      '/api/v1/admin/stats/system-health'
    );
    return response.data.data;
  },
};
```

### 6.3 TypeScript Types

**File:** `lib/api/types.ts`

```typescript
// Common types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string | null;
  data: T;
}

// Report types
export type ReportStatus = 'PENDING' | 'PROCESSED' | 'DISMISSED';
export type ContentType = 'POST' | 'COMMENT' | 'USER';
export type ReportType = 
  | 'SPAM' 
  | 'HARASSMENT' 
  | 'HATE_SPEECH' 
  | 'MISINFORMATION' 
  | 'INAPPROPRIATE_CONTENT' 
  | 'COPYRIGHT' 
  | 'IMPERSONATION' 
  | 'OTHER';

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
  reportedBy: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  reportedEntity: {
    id: string;
    content: string;
    creator: {
      id: string;
      username: string;
    };
  };
  createdAt: string;
}

export type HandleDecision = 'PROCESS' | 'DISMISS' | 'ESCALATE';
export type ModerationAction = 
  | 'WARN_USER' 
  | 'DELETE_CONTENT' 
  | 'BAN_USER_TEMPORARY' 
  | 'BAN_USER_PERMANENT';

export interface HandleReportRequest {
  decision: HandleDecision;
  action?: ModerationAction;
  reason: string;
  banDuration?: number;
}

export interface HandleReportResponse {
  id: string;
  reportId: string;
  decision: HandleDecision;
  action?: ModerationAction;
  reason: string;
  handledBy: {
    id: string;
    username: string;
  };
  createdAt: string;
}

// Moderation types
export interface ModerationActionRequest {
  userId: string;
  actionType: ModerationAction;
  reason: string;
  banDuration?: number;
}

export interface ModerationActionResponse {
  id: string;
  userId: string;
  actionType: ModerationAction;
  reason: string;
  moderator: {
    id: string;
    username: string;
  };
  createdAt: string;
}

// Analytics types
export interface ReportStatisticsResponse {
  totalReports: number;
  pendingReports: number;
  processedReports: number;
  dismissedReports: number;
  reportsByType: { type: string; count: number }[];
  reportsByStatus: { status: string; count: number }[];
  dailyTrends: { date: string; count: number }[];
  topReporters: { userId: string; username: string; reportCount: number }[];
}

export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsersToday: number;
  newUsersToday: number;
  lockedUsers: number;
  userGrowthRate: number;
  mostActiveUsers: { userId: string; username: string; activityScore: number }[];
}

export interface ContentStatisticsResponse {
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
  postsToday: number;
  commentsToday: number;
  contentTrends: { date: string; posts: number; comments: number }[];
}

export interface SystemHealthResponse {
  apiUptime: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
  cacheHitRate: number;
}
```

---

## 7. Authentication & Authorization

### 7.1 NextAuth.js Configuration

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password required');
        }

        // Call backend login API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.data) {
          throw new Error(data.message || 'Authentication failed');
        }

        const { token, user } = data.data;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,  // ['ADMIN'] or ['BA']
          accessToken: token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.roles = user.roles;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.roles = token.roles;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,  // 24 hours
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 7.2 Role-Based Access Control (RBAC)

**File:** `lib/auth/rbac.ts`

```typescript
import { useSession } from 'next-auth/react';

export type Role = 'ADMIN' | 'BA' | 'USER';

export const useHasRole = (requiredRoles: Role[]) => {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  return requiredRoles.some((role) => userRoles.includes(role));
};

export const useIsAdmin = () => useHasRole(['ADMIN']);
export const useIsBA = () => useHasRole(['BA']);
export const useIsAdminOrBA = () => useHasRole(['ADMIN', 'BA']);

// Server-side RBAC check
export const hasRole = (userRoles: Role[], requiredRoles: Role[]) => {
  return requiredRoles.some((role) => userRoles.includes(role));
};
```

**Usage in Components:**

```typescript
import { useIsAdmin, useIsAdminOrBA } from '@/lib/auth/rbac';

export function UserListPage() {
  const isAdmin = useIsAdmin();
  const canModerate = useIsAdminOrBA();

  return (
    <div>
      {isAdmin && <CreateUserButton />}
      {canModerate && <ModerationActions />}
    </div>
  );
}
```

### 7.3 Protected Routes Middleware

**File:** `middleware.ts`

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user has ADMIN or BA role
    const userRoles = token?.roles || [];
    const hasAdminAccess = userRoles.includes('ADMIN') || userRoles.includes('BA');

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/reports/:path*', '/users/:path*', '/moderation/:path*', '/analytics/:path*'],
};
```

---

## 8. State Management Patterns

### 8.1 TanStack Query Hooks

**File:** `lib/hooks/useReports.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/endpoints/reports';
import { useToast } from '@/components/ui/use-toast';
import type { ReportRequest, HandleReportRequest } from '@/lib/api/types';

export const useReports = (params: {
  status?: string;
  contentType?: string;
  reportType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportsApi.getReports(params),
    staleTime: 5 * 60 * 1000,  // 5 minutes (matches backend cache)
  });
};

export const useReportById = (reportId: string) => {
  return useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => reportsApi.getReportById(reportId),
    enabled: !!reportId,
  });
};

export const useSubmitReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ReportRequest) => reportsApi.submitReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Report submitted',
        description: 'Your report has been submitted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit report.',
        variant: 'destructive',
      });
    },
  });
};

export const useHandleReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: HandleReportRequest }) =>
      reportsApi.handleReport(reportId, data),
    onMutate: async ({ reportId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['reports', reportId] });
      const previousReport = queryClient.getQueryData(['reports', reportId]);

      queryClient.setQueryData(['reports', reportId], (old: any) => ({
        ...old,
        status: data.decision === 'PROCESS' ? 'PROCESSED' : 'DISMISSED',
      }));

      return { previousReport };
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', reportId] });
      toast({
        title: 'Report handled',
        description: 'The report has been processed successfully.',
      });
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(['reports'], context.previousReport);
      }
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to handle report.',
        variant: 'destructive',
      });
    },
  });
};
```

### 8.2 Zustand Store (Client State)

**File:** `lib/stores/useUIStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  selectedFilters: {
    reports: {
      status?: string;
      contentType?: string;
      reportType?: string;
    };
    users: {
      role?: string;
      status?: string;
    };
  };
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setReportFilters: (filters: UIState['selectedFilters']['reports']) => void;
  setUserFilters: (filters: UIState['selectedFilters']['users']) => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      selectedFilters: {
        reports: {},
        users: {},
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setReportFilters: (filters) =>
        set((state) => ({
          selectedFilters: { ...state.selectedFilters, reports: filters },
        })),
      setUserFilters: (filters) =>
        set((state) => ({
          selectedFilters: { ...state.selectedFilters, users: filters },
        })),
      resetFilters: () =>
        set({
          selectedFilters: {
            reports: {},
            users: {},
          },
        }),
    }),
    {
      name: 'admin-ui-storage',
    }
  )
);
```

---

## 9. UI/UX Guidelines

### 9.1 Design Principles

1. **Clarity over Aesthetics**: Admin dashboards prioritize information density and clarity
2. **Consistent Patterns**: Use same components for similar actions (filters, tables, modals)
3. **Feedback on Actions**: Always show loading states, success/error toasts, confirmations
4. **Progressive Disclosure**: Show details on demand, don't clutter initial views
5. **Keyboard Shortcuts**: Support keyboard navigation for power users

### 9.2 Color System

**Status Colors:**
- Pending/Warning: Yellow (`text-yellow-600`, `bg-yellow-100`)
- Success/Processed: Green (`text-green-600`, `bg-green-100`)
- Dismissed/Neutral: Gray (`text-gray-600`, `bg-gray-100`)
- Error/Critical: Red (`text-red-600`, `bg-red-100`)
- Info: Blue (`text-blue-600`, `bg-blue-100`)

**Role Colors:**
- ADMIN: Purple (`text-purple-600`, `bg-purple-100`)
- BA: Blue (`text-blue-600`, `bg-blue-100`)
- USER: Gray (`text-gray-600`, `bg-gray-100`)

### 9.3 Confirmation Patterns

**When to Ask for Confirmation:**
- Destructive actions (ban user, delete content)
- Irreversible actions (permanent ban)
- Bulk operations (ban multiple users)

**Dialog Pattern:**
```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Ban User</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently ban the user @{username}. They will not be able to access the
        platform anymore.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleBan}>Confirm Ban</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 9.4 Loading States

**Skeleton Pattern for Tables:**
```typescript
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <DataTable data={reports} columns={columns} />
)}
```

**Spinner for Actions:**
```typescript
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

---

## 10. Implementation Phases

### Phase 1: Setup & Authentication (Week 1)

**Goals:**
- Project setup with Next.js 14, TypeScript, Tailwind CSS
- Install shadcn/ui components
- Configure TanStack Query, Zustand, NextAuth.js
- Implement login page and authentication flow
- Setup API client with interceptors

**Deliverables:**
- ✅ Next.js project initialized
- ✅ shadcn/ui components installed
- ✅ Authentication working (login, logout, protected routes)
- ✅ API client configured with JWT interceptors
- ✅ RBAC hooks implemented

**Acceptance Criteria:**
- User can login with username/password
- JWT token stored securely
- Protected routes redirect to login if not authenticated
- ADMIN and BA roles distinguished in UI

---

### Phase 2: Report Management (Week 2-3)

**Goals:**
- Implement report list with filters and pagination
- Implement report detail screen
- Implement handle report functionality
- Real-time updates with TanStack Query

**Deliverables:**
- ✅ Report list screen (`/reports`)
- ✅ Report filters (status, content type, report type, date range)
- ✅ Report detail screen (`/reports/[id]`)
- ✅ Handle report dialog with form validation
- ✅ Optimistic updates on report handling

**Acceptance Criteria:**
- BA can view all reports
- BA can filter reports by status/type/date
- BA can handle a report (approve/dismiss/escalate)
- UI updates instantly (optimistic updates)
- Success/error toasts shown

---

### Phase 3: User Moderation & Management (Week 4)

**Goals:**
- Implement user list with search and filters
- Implement user detail screen with tabs
- Implement moderation actions (ban, warn, lock)
- Implement moderation history view

**Deliverables:**
- ✅ User list screen (`/users`)
- ✅ User detail screen (`/users/[id]`)
- ✅ User statistics tab
- ✅ Moderation history tab
- ✅ Moderate user dialog
- ✅ Lock/unlock user functionality
- ✅ Moderation actions list (`/moderation/actions`)

**Acceptance Criteria:**
- BA can search and view users
- BA can lock/unlock users
- BA can moderate users (ban/warn)
- ADMIN can assign roles (BA cannot)
- Moderation history visible per user

---

### Phase 4: Analytics Dashboard (Week 5)

**Goals:**
- Implement analytics dashboard with real-time metrics
- Implement charts for report trends, content stats
- Implement caching for analytics (5-minute TTL)

**Deliverables:**
- ✅ Analytics dashboard (`/analytics`)
- ✅ Report statistics cards
- ✅ User statistics cards
- ✅ Content statistics cards
- ✅ System health card
- ✅ Charts (Line chart for trends, Pie chart for breakdown)
- ✅ Date range selector

**Acceptance Criteria:**
- Analytics load in <2 seconds
- Charts render correctly with Recharts
- Data cached for 5 minutes
- Date range filter works

---

### Phase 5: Polish & Testing (Week 6)

**Goals:**
- Responsive design for tablet/mobile
- Accessibility audit (WCAG 2.1 AA)
- Error handling improvements
- Performance optimization
- Integration testing

**Deliverables:**
- ✅ Responsive layouts (768px+)
- ✅ Accessibility improvements (keyboard navigation, ARIA labels)
- ✅ Error boundaries
- ✅ Loading states everywhere
- ✅ Integration tests with Playwright
- ✅ Performance audit (Lighthouse)

**Acceptance Criteria:**
- Works on tablet (768px+)
- Lighthouse score >90
- WCAG 2.1 AA compliant
- All user flows tested

---

## 11. Testing Strategy

### 11.1 Unit Testing (Vitest)

**Test Files:**
- `lib/api/client.test.ts` - API client interceptors
- `lib/hooks/useReports.test.tsx` - TanStack Query hooks
- `lib/auth/rbac.test.ts` - RBAC utility functions
- `lib/stores/useUIStore.test.ts` - Zustand store

**Example:**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReports } from '@/lib/hooks/useReports';

describe('useReports', () => {
  it('fetches reports successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useReports({ page: 0, size: 10 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### 11.2 Integration Testing (Playwright)

**Test Scenarios:**
- Login flow (valid/invalid credentials)
- Report list filtering
- Handle report workflow
- User moderation workflow
- Role-based access (ADMIN vs BA)

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('BA can handle a report', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'ba_user');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('/reports');
  await page.click('text=View >> first');

  await page.click('text=Process');
  await page.selectOption('select[name="action"]', 'WARN_USER');
  await page.fill('textarea[name="reason"]', 'This violates community guidelines.');
  await page.click('text=Submit Decision');

  await expect(page.locator('text=Report handled')).toBeVisible();
});
```

### 11.3 E2E Testing Checklist

- [ ] User can login and see dashboard
- [ ] User with USER role cannot access admin routes
- [ ] BA can view and filter reports
- [ ] BA can handle a report (all actions: warn, delete, ban)
- [ ] BA can moderate a user directly
- [ ] ADMIN can create a new user
- [ ] ADMIN can assign roles
- [ ] Analytics dashboard loads and displays correct data
- [ ] Filters persist across page refreshes (Zustand persist)
- [ ] Optimistic updates work correctly
- [ ] Error messages shown on API failures

---

## 12. Success Criteria

### 12.1 Functional Requirements

- ✅ All 12 API endpoints integrated
- ✅ All 4 core features implemented (Reports, Moderation, Users, Analytics)
- ✅ Role-based access working (ADMIN vs BA)
- ✅ Optimistic updates on mutations
- ✅ Real-time data refresh (background sync)

### 12.2 Performance Requirements

- ✅ Initial page load <2 seconds
- ✅ API requests <500ms (depends on backend)
- ✅ TanStack Query caching working (5-minute TTL)
- ✅ No unnecessary re-renders
- ✅ Lighthouse performance score >90

### 12.3 Quality Requirements

- ✅ TypeScript strict mode enabled
- ✅ No TypeScript errors
- ✅ ESLint + Prettier configured
- ✅ Unit test coverage >70%
- ✅ All critical user flows tested (E2E)

### 12.4 Accessibility Requirements

- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation works
- ✅ Screen reader friendly (ARIA labels)
- ✅ Color contrast ratio >4.5:1
- ✅ Focus indicators visible

---

## 13. Risk Management

### 13.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Backend API delays** | High | Medium | Mock API responses for development, implement loading states |
| **Type mismatches (FE/BE)** | Medium | High | Share TypeScript types via OpenAPI spec generation |
| **Slow analytics queries** | High | Low | Backend implements caching, FE caches for 5 minutes |
| **Authentication issues** | High | Low | Test auth flow early, fallback to mock auth in dev |
| **Responsive design complexity** | Medium | Medium | Use shadcn/ui responsive components, test on tablets early |

### 13.2 Dependencies on Backend

**Critical:**
- Backend API must be deployed to staging before FE integration testing
- Backend enums (ReportStatus, ReportType, ModerationActionType) must match FE types
- Backend response format must match `ApiResponse<T>` structure

**Mitigation:**
- Use MSW (Mock Service Worker) for local development
- Document API contract in shared repository
- Setup contract testing (Pact.io or similar)

### 13.3 Timeline Risks

**Risk:** Backend delays impact FE delivery

**Mitigation:**
- Start with UI mockups and static data (Week 1-2)
- Implement API client layer early (Week 1)
- Use MSW to mock backend responses
- Parallel development possible for most features

---

## 14. Next Steps

### 14.1 Immediate Actions (Pre-Development)

1. **✅ Get stakeholder approval** on this document
2. **✅ Setup project repository** (create Next.js project)
3. **✅ Setup CI/CD pipeline** (GitHub Actions, Vercel)
4. **✅ Install dependencies** (Next.js, shadcn/ui, TanStack Query, etc.)
5. **✅ Create initial folder structure**
6. **✅ Setup ESLint, Prettier, TypeScript config**

### 14.2 Development Kickoff (Week 1)

1. **Day 1:** Project setup, install dependencies
2. **Day 2-3:** Setup authentication (NextAuth.js, login page)
3. **Day 4:** Setup API client (Axios, interceptors)
4. **Day 5:** Setup TanStack Query, Zustand stores

### 14.3 Coordination with Backend Team

**Weekly Sync:**
- Review API endpoints being developed (match FE integration schedule)
- Discuss any breaking changes to response formats
- Share TypeScript types (consider auto-generation from OpenAPI spec)

**Testing:**
- Backend team deploys to staging by Week 2 for FE integration
- FE team provides feedback on API usability
- Joint testing session before production deployment

---

## 15. Appendix

### 15.1 Useful Resources

**Documentation:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [NextAuth.js Docs](https://next-auth.js.org/)

**Design Inspiration:**
- [Retool Admin Panel](https://retool.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)

### 15.2 Component Library Examples

**shadcn/ui Admin Components:**
- [Data Table Example](https://ui.shadcn.com/docs/components/data-table)
- [Form Example](https://ui.shadcn.com/docs/components/form)
- [Dialog Example](https://ui.shadcn.com/docs/components/dialog)
- [Badge Example](https://ui.shadcn.com/docs/components/badge)

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** 2026-05-21  
**Author:** Development Team  
**Reviewers:** Product Manager, Tech Lead, Backend Team
