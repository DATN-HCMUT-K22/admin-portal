import { apiFetch } from "./client";
import { unwrapData } from "./envelope";
import type { 
  RoleRequest, 
  RoleWithPermissions, 
  PermissionResponse, 
  PermissionRequest 
} from "@/types/api";

export async function listRoles() {
  const raw = await apiFetch<unknown>("/api/v1/roles");
  return unwrapData<RoleWithPermissions[]>(raw);
}

export async function createRole(body: RoleRequest) {
  const raw = await apiFetch<unknown>("/api/v1/roles", {
    method: "POST",
    body,
  });
  return unwrapData<RoleWithPermissions>(raw);
}

export async function deleteRole(roleId: string) {
  return apiFetch<unknown>(`/api/v1/roles/${roleId}`, {
    method: "DELETE",
  });
}

export async function listPermissions() {
  const raw = await apiFetch<unknown>("/api/v1/permissions");
  return unwrapData<PermissionResponse[]>(raw);
}

export async function createPermission(body: PermissionRequest) {
  const raw = await apiFetch<unknown>("/api/v1/permissions", {
    method: "POST",
    body,
  });
  return unwrapData<PermissionResponse>(raw);
}

export async function deletePermission(permissionId: string) {
  return apiFetch<unknown>(`/api/v1/permissions/${permissionId}`, {
    method: "DELETE",
  });
}
