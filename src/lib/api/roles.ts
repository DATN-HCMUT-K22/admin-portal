import { apiFetch } from "./client";
import type { RoleRequest, RoleWithPermissions } from "@/types/api";

export async function listRoles() {
  return apiFetch<RoleWithPermissions[]>("/api/v1/roles");
}

export async function createRole(body: RoleRequest) {
  return apiFetch<unknown>("/api/v1/roles", {
    method: "POST",
    body,
  });
}

export async function listPermissions() {
  return apiFetch<string[] | { name: string }[]>("/api/v1/permissions");
}
