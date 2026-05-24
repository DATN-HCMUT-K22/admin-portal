import { apiFetch } from "./client";
import type { LocationBusinessMetadata } from "@/types/api";

export interface LocationDto extends LocationBusinessMetadata {
  id: string;
  [key: string]: unknown;
}

export async function createLocation(
  body: Partial<LocationBusinessMetadata> & Record<string, unknown>
) {
  return apiFetch<LocationDto>("/api/v1/locations", {
    method: "POST",
    body,
  });
}

export async function updateLocation(
  id: string,
  body: Partial<LocationBusinessMetadata> & Record<string, unknown>
) {
  return apiFetch<LocationDto>(`/api/v1/locations/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deleteLocation(id: string) {
  return apiFetch<unknown>(`/api/v1/locations/${id}`, {
    method: "DELETE",
  });
}

export async function listAdministrative(
  params?: { type?: string; country?: string }
) {
  const q = new URLSearchParams();
  if (params?.type) q.set("type", params.type);
  if (params?.country) q.set("country", params.country);
  const qs = q.toString();
  return apiFetch<unknown[]>(
    `/api/v1/locations/administrative${qs ? `?${qs}` : ""}`
  );
}
