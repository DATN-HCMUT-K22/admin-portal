import type { RoleRef } from "@/types/api";

export const ROLE_ADMIN = "ADMIN";
export const ROLE_BA = "BA";

export function roleNames(roles: RoleRef[] | undefined): string[] {
  return roles?.map((r) => r.name) ?? [];
}

export function hasRole(roles: RoleRef[] | undefined, name: string) {
  return roleNames(roles).includes(name);
}

/** Sau đăng nhập / bootstrap: thứ tự ADMIN → BA → consumer */
export function getPostLoginRedirectPath(roles: RoleRef[]): string {
  const names = roleNames(roles);
  if (names.includes(ROLE_ADMIN)) return "/dashboard";
  if (names.includes(ROLE_BA)) return "/dashboard/business/locations";
  return "/home";
}

export type DashboardZone = "hub" | "system" | "moderation" | "business";

export function dashboardZone(pathname: string): DashboardZone {
  if (pathname.startsWith("/dashboard/system")) return "system";
  if (pathname.startsWith("/dashboard/moderation")) return "moderation";
  if (pathname.startsWith("/dashboard/business")) return "business";
  return "hub";
}

/** Zone cần quyền gì — hub cho phép ADMIN hoặc BA */
export function zoneRequires(
  zone: DashboardZone
): "admin" | "ba" | "portal" {
  if (zone === "system" || zone === "moderation") return "admin";
  if (zone === "business") return "ba";
  return "portal";
}

export function canAccessDashboardPath(
  pathname: string,
  roles: RoleRef[]
): boolean {
  const names = roleNames(roles);
  const hasAdmin = names.includes(ROLE_ADMIN);
  const hasBa = names.includes(ROLE_BA);
  const zone = dashboardZone(pathname);
  const req = zoneRequires(zone);

  if (req === "portal") return hasAdmin || hasBa;
  if (req === "admin") return hasAdmin;
  return hasBa;
}

/** USER thuần (không ADMIN/BA) không vào portal quản trị */
export function canUseAdminPortal(roles: RoleRef[]): boolean {
  const names = roleNames(roles);
  return names.includes(ROLE_ADMIN) || names.includes(ROLE_BA);
}
