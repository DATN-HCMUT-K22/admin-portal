import { apiFetch } from "./client";
import type { LocationBusinessMetadata } from "@/types/api";

export interface LocationDto extends LocationBusinessMetadata {
  id: string;
  [key: string]: unknown;
}

export async function createLocation(
  token: string,
  body: Partial<LocationBusinessMetadata> & Record<string, unknown>
) {
  return apiFetch<LocationDto>("/api/v1/locations", {
    method: "POST",
    body,
    token,
  });
}

export async function updateLocation(
  token: string,
  id: string,
  body: Partial<LocationBusinessMetadata> & Record<string, unknown>
) {
  return apiFetch<LocationDto>(`/api/v1/locations/${id}`, {
    method: "PUT",
    body,
    token,
  });
}

export async function deleteLocation(token: string, id: string) {
  return apiFetch<unknown>(`/api/v1/locations/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function listAdministrative(
  token: string,
  params?: { type?: string; country?: string }
) {
  const q = new URLSearchParams();
  if (params?.type) q.set("type", params.type);
  if (params?.country) q.set("country", params.country);
  const qs = q.toString();
  return apiFetch<unknown[]>(
    `/api/v1/locations/administrative${qs ? `?${qs}` : ""}`,
    { token }
  );
}
