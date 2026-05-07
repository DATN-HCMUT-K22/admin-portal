# Phase 4: Navigation & Missing Components

**Timeline:** Days 6-7 (2 days)  
**Priority:** MEDIUM

---

## Tasks

### 1. Toast Notification System (4h)

**File:** `src/components/ui/toast-context.tsx`

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 5000); // Auto-dismiss after 5s
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        success: (msg) => addToast('success', msg),
        error: (msg) => addToast('error', msg),
        info: (msg) => addToast('info', msg),
        remove,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => onClose(toast.id)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Usage:**
```tsx
import { useToast } from "@/components/ui/toast-context";

const { toast } = useToast();
mutation.mutate(data, {
  onSuccess: () => toast.success('Lưu thành công'),
  onError: (e) => toast.error(e.message),
});
```

---

### 2. Enhanced QueryState (2h)

**File:** `src/components/query-state.tsx`

```tsx
import { type ReactNode } from "react";

interface Props {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  onRetry?: () => void;
}

export function QueryState({ isLoading, error, children, onRetry }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">Có lỗi xảy ra: {error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### 3. Sidebar Navigation (6h)

**File:** `src/components/dashboard/sidebar.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/stores/admin-store";
import { AdminOnly } from "@/components/auth/PermissionGate";

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: "🏠" },
  { href: "/dashboard/system/users", label: "Người dùng", icon: "👥" },
  { href: "/dashboard/moderation/reports", label: "Báo cáo", icon: "🚩" },
  { href: "/dashboard/business/statistics", label: "Thống kê", icon: "📊" },
];

const adminOnlyItems = [
  { href: "/dashboard/system/roles", label: "Vai trò", icon: "🔐" },
  { href: "/dashboard/system/activity-logs", label: "Nhật ký", icon: "📝" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-64 border-r bg-muted/20">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <AdminOnly>
          <div className="my-2 border-t border-border pt-2">
            {adminOnlyItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </AdminOnly>
      </nav>
    </aside>
  );
}
```

---

### 4. Breadcrumbs (2h)

**File:** `src/components/dashboard/breadcrumbs.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pathMap: Record<string, string> = {
  dashboard: "Tổng quan",
  system: "Quản trị",
  business: "BA",
  moderation: "Kiểm duyệt",
  users: "Người dùng",
  roles: "Vai trò",
  reports: "Báo cáo",
  statistics: "Thống kê",
  "activity-logs": "Nhật ký",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Trang chủ
      </Link>
      {segments.map((segment, idx) => {
        const href = '/' + segments.slice(0, idx + 1).join('/');
        const label = pathMap[segment] || segment;
        const isLast = idx === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

---

## Integration

Update `src/app/dashboard/layout.tsx`:

```tsx
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { ToastProvider } from "@/components/ui/toast-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <div className="p-6">
            <Breadcrumbs />
            <main className="mt-4">{children}</main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
```

---

## Success Criteria

- [ ] Toast notifications show/hide correctly
- [ ] Sidebar highlights active route
- [ ] Breadcrumbs reflect current path
- [ ] Portal toggle switches between ADMIN/BA modes
- [ ] QueryState retry button works
