# Phase 3: Role-based UI Permissions

**Timeline:** Day 5 (1 day)  
**Priority:** HIGH  
**Goal:** Show/hide features based on portalMode

---

## Permission Matrix

| Feature | ADMIN (system) | BA (business) |
|---------|----------------|---------------|
| View users | ✅ | ✅ |
| Create user | ✅ | ❌ |
| Lock/unlock user | ✅ | ✅ |
| Assign roles | ✅ | ❌ |
| View reports | ✅ | ✅ |
| Handle reports | ✅ | ✅ |
| View statistics | ✅ | ✅ |
| View activity logs | ✅ | ❌ |
| Manage roles/permissions | ✅ | ❌ |

---

## Step 1: Create PermissionGate Component

**File:** `src/components/auth/PermissionGate.tsx`

```tsx
"use client";

import { useAdminStore, type PortalMode } from "@/stores/admin-store";
import { type ReactNode } from "react";

interface Props {
  allowedModes: PortalMode[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ allowedModes, children, fallback = null }: Props) {
  const mode = useAdminStore((s) => s.portalMode);
  
  if (!allowedModes.includes(mode)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Shorthand components
export function AdminOnly({ children, fallback }: Omit<Props, 'allowedModes'>) {
  return (
    <PermissionGate allowedModes={['system']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function BAOnly({ children, fallback }: Omit<Props, 'allowedModes'>) {
  return (
    <PermissionGate allowedModes={['business']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
```

---

## Step 2: Apply to Pages

### User Detail Page

**File:** `src/app/dashboard/system/users/[userId]/page.tsx`

```tsx
import { AdminOnly } from "@/components/auth/PermissionGate";

export default function UserDetailPage() {
  // ... existing code

  return (
    <div>
      {/* ... user info */}
      
      <AdminOnly>
        <button onClick={handleAssignRoles}>Gán vai trò</button>
      </AdminOnly>
      
      {/* Lock/unlock visible to both ADMIN and BA */}
      <button onClick={handleLockToggle}>
        {user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
      </button>
    </div>
  );
}
```

### Role Management Page

**File:** `src/app/dashboard/system/roles/page.tsx`

Add route protection:

```tsx
import { redirect } from "next/navigation";
import { useAdminStore } from "@/stores/admin-store";

export default function RolesPage() {
  const mode = useAdminStore((s) => s.portalMode);
  
  if (mode !== 'system') {
    redirect('/dashboard/403'); // Or show 403 page
  }
  
  // ... existing code
}
```

### Activity Logs Page

**File:** `src/app/dashboard/system/activity-logs/page.tsx`

Same pattern - ADMIN only.

---

## Step 3: Update Navigation

**File:** `src/components/dashboard/dashboard-shell.tsx` (or sidebar component)

```tsx
import { useAdminStore } from "@/stores/admin-store";
import { AdminOnly } from "@/components/auth/PermissionGate";

export function DashboardShell({ children }: { children: ReactNode }) {
  const mode = useAdminStore((s) => s.portalMode);
  
  return (
    <div className="flex">
      <aside className="w-64 border-r">
        <nav>
          {/* Shared links */}
          <NavLink href="/dashboard/system/users">Người dùng</NavLink>
          <NavLink href="/dashboard/moderation/reports">Báo cáo</NavLink>
          <NavLink href="/dashboard/business/statistics">Thống kê</NavLink>
          
          {/* ADMIN-only links */}
          <AdminOnly>
            <NavLink href="/dashboard/system/roles">Vai trò & quyền</NavLink>
            <NavLink href="/dashboard/system/activity-logs">Nhật ký hoạt động</NavLink>
          </AdminOnly>
        </nav>
      </aside>
      
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Step 4: Add Portal Mode Toggle

**File:** `src/components/dashboard/top-bar.tsx`

```tsx
"use client";

import { useAdminStore } from "@/stores/admin-store";

export function TopBar() {
  const { portalMode, setPortalMode } = useAdminStore();
  
  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">TripJoy Admin Portal</h1>
        
        <div className="flex items-center gap-4">
          {/* Portal Mode Toggle */}
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setPortalMode('system')}
              className={`px-3 py-1.5 text-sm transition ${
                portalMode === 'system'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => setPortalMode('business')}
              className={`px-3 py-1.5 text-sm transition ${
                portalMode === 'business'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              BA
            </button>
          </div>
          
          <button onClick={() => useAdminStore.getState().logout()}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## Testing Checklist

- [ ] Toggle ADMIN → BA → verify activity logs link disappears
- [ ] Toggle BA → ADMIN → verify role management appears
- [ ] Navigate to `/dashboard/system/activity-logs` as BA → see 403 or redirect
- [ ] View user detail as BA → "Assign roles" button hidden
- [ ] View user detail as ADMIN → "Assign roles" visible
- [ ] Portal mode persists after page refresh (Zustand storage works)
- [ ] No console errors when toggling modes
