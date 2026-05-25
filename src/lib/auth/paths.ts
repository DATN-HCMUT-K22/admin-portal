import type { RoleRef } from "@/types/api";

// ─── Role constants — khớp với BE (commit 9b611b4) ───────────────────────────
export const ROLE_SYSTEM_ADMIN = "SYSTEM_ADMIN";
export const ROLE_BUSINESS_ADMIN = "BUSINESS_ADMIN";
export const ROLE_USER = "USER";

/** @deprecated Dùng ROLE_SYSTEM_ADMIN */
export const ROLE_ADMIN = ROLE_SYSTEM_ADMIN;
/** @deprecated Dùng ROLE_BUSINESS_ADMIN */
export const ROLE_BA = ROLE_BUSINESS_ADMIN;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function roleNames(roles: RoleRef[] | undefined): string[] {
  return roles?.map((r) => r.name) ?? [];
}

export function hasRole(roles: RoleRef[] | undefined, name: string) {
  return roleNames(roles).includes(name);
}

/** Sau đăng nhập / bootstrap: SYSTEM_ADMIN → hub, BUSINESS_ADMIN → business */
export function getPostLoginRedirectPath(roles: RoleRef[]): string {
  const names = roleNames(roles);
  if (names.includes(ROLE_SYSTEM_ADMIN)) return "/dashboard/system/users";
  if (names.includes(ROLE_BUSINESS_ADMIN)) return "/dashboard/business/reports";
  return "/home";
}

export type DashboardZone = "hub" | "system" | "moderation" | "business";

export function dashboardZone(pathname: string): DashboardZone {
  if (pathname.startsWith("/dashboard/system")) return "system";
  if (pathname.startsWith("/dashboard/moderation")) return "moderation";
  if (pathname.startsWith("/dashboard/business")) return "business";
  return "hub";
}

/** Zone cần quyền gì */
export function zoneRequires(zone: DashboardZone): "admin" | "ba" | "portal" {
  if (zone === "system" || zone === "moderation") return "admin";
  if (zone === "business") return "ba";
  return "portal";
}

export function canAccessDashboardPath(
  pathname: string,
  roles: RoleRef[]
): boolean {
  const names = roleNames(roles);
  const hasSystemAdmin = names.includes(ROLE_SYSTEM_ADMIN);
  const hasBusinessAdmin = names.includes(ROLE_BUSINESS_ADMIN);
  
  // Ngoại lệ: BUSINESS_ADMIN được phép vào xem Users
  if (pathname.startsWith("/dashboard/system/users")) {
    return hasSystemAdmin || hasBusinessAdmin;
  }

  const zone = dashboardZone(pathname);
  const req = zoneRequires(zone);

  if (req === "portal") return hasSystemAdmin || hasBusinessAdmin;
  if (req === "admin") return hasSystemAdmin;
  return hasBusinessAdmin;
}

/** USER thuần (không SYSTEM_ADMIN/BUSINESS_ADMIN) không vào portal */
export function canUseAdminPortal(roles: RoleRef[]): boolean {
  const names = roleNames(roles);
  return names.includes(ROLE_SYSTEM_ADMIN) || names.includes(ROLE_BUSINESS_ADMIN);
}
