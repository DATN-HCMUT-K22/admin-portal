"use client";

import { useAdminStore, type PortalMode } from "@/stores/admin-store";
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
 * Shorthand component for ADMIN-only content.
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
 * Shorthand component for BA-only content.
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
 * Hook to check current portal mode permissions.
 *
 * @example
 * ```tsx
 * const { isAdmin, isBA, mode } = usePermissions();
 * if (isAdmin) { ... }
 * ```
 */
export function usePermissions() {
  const mode = useAdminStore((s) => s.portalMode);

  return {
    mode,
    isAdmin: mode === 'system',
    isBA: mode === 'business',
  };
}
