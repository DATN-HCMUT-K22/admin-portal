"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as usersApi from "@/lib/api/users";
import * as rolesApi from "@/lib/api/roles";
import * as reportsApi from "@/lib/api/reports";
import * as feedbacksApi from "@/lib/api/feedbacks";
import * as locationsApi from "@/lib/api/locations";
import * as moderationApi from "@/lib/api/moderation";
import * as statisticsApi from "@/lib/api/statistics";
import * as activityLogsApi from "@/lib/api/activity-logs";
import { useAdminStore } from "@/stores/admin-store";
import type {
  HandleReportRequest,
  LocationBusinessMetadata,
  ModerationActionRequest,
  RoleRequest,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest,
  ActivityLogParams,
} from "@/types/api";

const TWELVE_H_MS = 12 * 60 * 60 * 1000;

function tokenOrThrow(token: string) {
  if (!token?.trim()) {
    throw new Error("Cần Bearer token (nhập ở góc trên).");
  }
  return token;
}

export function useUsers(page = 1) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.users(page),
    queryFn: () => usersApi.listUsers(tokenOrThrow(token), { page, pageSize: 20 }),
    enabled: !!token?.trim(),
  });
}

export function useUser(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: () => usersApi.getUser(tokenOrThrow(token), userId),
    enabled: !!token?.trim() && !!userId,
    staleTime: TWELVE_H_MS,
  });
}

export function useUpdateUserStatus(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserStatusUpdateRequest) =>
      usersApi.updateUserStatus(tokenOrThrow(token), userId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserRoles(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserRoleUpdateRequest) =>
      usersApi.updateUserRoles(tokenOrThrow(token), userId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRoles() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.roles(),
    queryFn: () => rolesApi.listRoles(tokenOrThrow(token)),
    enabled: !!token?.trim(),
  });
}

export function useCreateRole() {
  const token = useAdminStore((s) => s.bearerToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RoleRequest) =>
      rolesApi.createRole(tokenOrThrow(token), body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.roles() });
    },
  });
}

export function usePermissions() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.permissions(),
    queryFn: () => rolesApi.listPermissions(tokenOrThrow(token)),
    enabled: !!token?.trim(),
  });
}

export function useReports(params?: { contentType?: string; status?: string }) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.reports(params),
    queryFn: () => reportsApi.listReports(tokenOrThrow(token), params),
    enabled: !!token?.trim(),
    staleTime: 60_000,
  });
}

export function useReport(reportId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.report(reportId),
    queryFn: () => reportsApi.getReport(tokenOrThrow(token), reportId),
    enabled: !!token?.trim() && !!reportId,
  });
}

export function useHandleReport(reportId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HandleReportRequest) =>
      reportsApi.handleReport(tokenOrThrow(token), reportId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.report(reportId) });
      void qc.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

export function useModerateUser() {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (body: ModerationActionRequest) =>
      moderationApi.moderateUser(tokenOrThrow(token), body),
  });
}

export function useFeedbacks() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.feedbacks(),
    queryFn: () => feedbacksApi.listFeedbacks(tokenOrThrow(token)),
    enabled: !!token?.trim(),
  });
}

export function useFeedback(id: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.feedback(id),
    queryFn: () => feedbacksApi.getFeedback(tokenOrThrow(token), id),
    enabled: !!token?.trim() && !!id,
  });
}

export function useCreateLocation() {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (body: Partial<LocationBusinessMetadata> & Record<string, unknown>) =>
      locationsApi.createLocation(tokenOrThrow(token), body),
  });
}

export function useUpdateLocation(id: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (body: Partial<LocationBusinessMetadata> & Record<string, unknown>) =>
      locationsApi.updateLocation(tokenOrThrow(token), id, body),
  });
}

export function useDeleteLocation() {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (id: string) =>
      locationsApi.deleteLocation(tokenOrThrow(token), id),
  });
}

export function useAdministrative(type?: string, country?: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.administrative(type, country),
    queryFn: () =>
      locationsApi.listAdministrative(tokenOrThrow(token), { type, country }),
    enabled: !!token?.trim(),
  });
}

export function useUserStatistics(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "statistics", userId],
    queryFn: () => statisticsApi.getUserStatistics(tokenOrThrow(token), userId),
    enabled: !!token && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchUsers(query: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "users", "search", query],
    queryFn: () => statisticsApi.searchUsers(tokenOrThrow(token), query),
    enabled: !!token && query.length >= 2,
    staleTime: 60_000,
  });
}

export function useActivityLogs(params: ActivityLogParams = {}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "activity-logs", params],
    queryFn: () => activityLogsApi.listActivityLogs(tokenOrThrow(token), params),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useExportLogs() {
  const token = useAdminStore((s) => s.bearerToken);
  return useMutation({
    mutationFn: (params: ActivityLogParams) =>
      activityLogsApi.exportActivityLogs(tokenOrThrow(token), params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
