import { apiFetch } from "./client";
import type { RoleRequest, RoleWithPermissions } from "@/types/api";

export async function listRoles(token: string) {
  return apiFetch<RoleWithPermissions[]>("/api/v1/roles", { token });
}

export async function createRole(token: string, body: RoleRequest) {
  return apiFetch<unknown>("/api/v1/roles", {
    method: "POST",
    body,
    token,
  });
}

export async function listPermissions(token: string) {
  return apiFetch<string[] | { name: string }[]>("/api/v1/permissions", {
    token,
  });
}
