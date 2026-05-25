"use client";

import { useAdminStore, type PortalMode } from "@/stores/admin-store";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_SYSTEM_ADMIN, ROLE_BUSINESS_ADMIN } from "@/lib/auth/paths";
import { type ReactNode } from "react";

interface PermissionGateProps {
  allowedModes: PortalMode[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Permission gate component to show/hide content based on portal mode.
 *
 * @example
 * ```tsx
 * <PermissionGate allowedModes={['system']}>
 *   <button>ADMIN-only action</button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({ allowedModes, children, fallback = null }: PermissionGateProps) {
  const mode = useAdminStore((s) => s.portalMode);

  if (!allowedModes.includes(mode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Shorthand component for SYSTEM_ADMIN-only content.
 *
 * @example
 * ```tsx
 * <AdminOnly>
 *   <button>Create User</button>
 * </AdminOnly>
 * ```
 */
export function AdminOnly({ children, fallback }: Omit<PermissionGateProps, 'allowedModes'>) {
  return (
    <PermissionGate allowedModes={['system']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Shorthand component for BUSINESS_ADMIN-only content.
 *
 * @example
 * ```tsx
 * <BAOnly>
 *   <div>Business analytics view</div>
 * </BAOnly>
 * ```
 */
export function BAOnly({ children, fallback }: Omit<PermissionGateProps, 'allowedModes'>) {
  return (
    <PermissionGate allowedModes={['business']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Hook to check current user permissions from real JWT roles.
 * Derives isAdmin/isBA from actual roles returned by /me API.
 *
 * @example
 * ```tsx
 * const { isAdmin, isBA, mode } = usePermissions();
 * if (isAdmin) { ... }
 * ```
 */
export function usePermissions() {
  const mode = useAdminStore((s) => s.portalMode);
  // Đọc roles thật từ AuthContext thay vì portalMode
  const { user } = useAuth();
  const roleNames = user?.roles?.map((r) => r.name) ?? [];

  return {
    mode,
    isAdmin: roleNames.includes(ROLE_SYSTEM_ADMIN),
    isBA: roleNames.includes(ROLE_BUSINESS_ADMIN),
    /** Có quyền vào portal (SYSTEM_ADMIN hoặc BUSINESS_ADMIN) */
    hasPortalAccess: roleNames.includes(ROLE_SYSTEM_ADMIN) || roleNames.includes(ROLE_BUSINESS_ADMIN),
  };
}
