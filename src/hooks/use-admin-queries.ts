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
  ActivityLogParams,
  CreateUserWithRolesRequest,
  HandleReportRequest,
  LocationBusinessMetadata,
  ModerationActionRequest,
  RoleRequest,
  UserRoleUpdateRequest,
  UserStatusUpdateRequest,
} from "@/types/api";

const TWELVE_H_MS = 12 * 60 * 60 * 1000;

// ─── Users ────────────────────────────────────────────────────────────────────

export function useUsers(page = 1, q?: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.users(page, q),
    queryFn: () => usersApi.listUsers({ page, pageSize: 20, q }),
    enabled: !!token?.trim(),
  });
}

export function useUser(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: () => usersApi.getUser(userId),
    enabled: !!token?.trim() && !!userId,
    staleTime: TWELVE_H_MS,
  });
}

export function useUpdateUserStatus(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserStatusUpdateRequest) =>
      usersApi.updateUserStatus(userId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserRoles(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserRoleUpdateRequest) =>
      usersApi.updateUserRoles(userId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useCreateUserWithRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserWithRolesRequest) =>
      usersApi.createUserWithRoles(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export function useRoles() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.roles(),
    queryFn: () => rolesApi.listRoles(),
    enabled: !!token?.trim(),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RoleRequest) => rolesApi.createRole(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.roles() });
    },
  });
}

export function usePermissions() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.permissions(),
    queryFn: () => rolesApi.listPermissions(),
    enabled: !!token?.trim(),
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function useReports(params?: reportsApi.ReportListParams) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.reports(params),
    queryFn: () => reportsApi.listReports(params),
    enabled: !!token?.trim(),
    staleTime: 60_000,
  });
}

export function useReport(reportId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.report(reportId),
    queryFn: () => reportsApi.getReport(reportId),
    enabled: !!token?.trim() && !!reportId,
  });
}

export function useHandleReport(reportId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HandleReportRequest) =>
      reportsApi.handleReport(reportId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admin.report(reportId) });
      void qc.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export function useModerateUser() {
  return useMutation({
    mutationFn: (body: ModerationActionRequest) =>
      moderationApi.moderateUser(body),
  });
}

export function useModerationActions(params?: {
  userId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "moderation-actions", params],
    queryFn: () => moderationApi.listModerationActions(params),
    enabled: !!token?.trim(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useUserModerationHistory(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "moderation-actions", "user", userId],
    queryFn: () => moderationApi.getUserModerationHistory(userId),
    enabled: !!token?.trim() && !!userId,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

// ─── Feedbacks ────────────────────────────────────────────────────────────────

export function useFeedbacks() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.feedbacks(),
    queryFn: () => feedbacksApi.listFeedbacks(),
    enabled: !!token?.trim(),
  });
}

export function useFeedback(id: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.feedback(id),
    queryFn: () => feedbacksApi.getFeedback(id),
    enabled: !!token?.trim() && !!id,
  });
}

// ─── Locations ────────────────────────────────────────────────────────────────

export function useCreateLocation() {
  return useMutation({
    mutationFn: (body: Partial<LocationBusinessMetadata> & Record<string, unknown>) =>
      locationsApi.createLocation(body),
  });
}

export function useUpdateLocation(id: string) {
  return useMutation({
    mutationFn: (body: Partial<LocationBusinessMetadata> & Record<string, unknown>) =>
      locationsApi.updateLocation(id, body),
  });
}

export function useDeleteLocation() {
  return useMutation({
    mutationFn: (id: string) => locationsApi.deleteLocation(id),
  });
}

export function useAdministrative(type?: string, country?: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: queryKeys.admin.administrative(type, country),
    queryFn: () => locationsApi.listAdministrative({ type, country }),
    enabled: !!token?.trim(),
  });
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export function useUserStatistics(userId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "statistics", userId],
    queryFn: () => statisticsApi.getUserStatistics(userId),
    enabled: !!token && !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useSearchUsers(query: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "users", "search", query],
    queryFn: () => statisticsApi.searchUsers(query),
    enabled: !!token && query.length >= 2,
    staleTime: 60_000,
  });
}

export function useReportStatistics(params?: { startDate?: string; endDate?: string }) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "stats", "reports", params],
    queryFn: () => statisticsApi.getReportStatistics(params),
    enabled: !!token?.trim(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useAggregateUserStatistics() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "stats", "users"],
    queryFn: () => statisticsApi.getAggregateUserStatistics(),
    enabled: !!token?.trim(),
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useContentStatistics(params?: { startDate?: string; endDate?: string }) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "stats", "content", params],
    queryFn: () => statisticsApi.getContentStatistics(params),
    enabled: !!token?.trim(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useSystemHealth() {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "stats", "system-health"],
    queryFn: () => statisticsApi.getSystemHealth(),
    enabled: !!token?.trim(),
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 1,
  });
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

/**
 * [SYSTEM_ADMIN] Lấy tất cả activity logs hệ thống.
 */
export function useActivityLogs(params: ActivityLogParams = {}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "activity-logs", "all", params],
    queryFn: () => activityLogsApi.listActivityLogs(params),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/**
 * [Authenticated] Lấy activity log của bản thân.
 */
export function useMyActivityLogs(params: ActivityLogParams = {}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["activity-logs", "me", params],
    queryFn: () => activityLogsApi.listMyActivityLogs(params),
    enabled: !!token,
    staleTime: 60_000,
  });
}

/**
 * [SYSTEM_ADMIN] Lấy activity log của một user cụ thể.
 */
export function useUserActivityLogs(userId: string, params: ActivityLogParams = {}) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "activity-logs", "user", userId, params],
    queryFn: () => activityLogsApi.getUserActivityLogs(userId, params),
    enabled: !!token && !!userId,
    staleTime: 60_000,
  });
}

/**
 * [SYSTEM_ADMIN] Lấy audit trail của một entity cụ thể.
 */
export function useEntityAuditTrail(entityType: string, entityId: string) {
  const token = useAdminStore((s) => s.bearerToken);
  return useQuery({
    queryKey: ["admin", "activity-logs", "entity", entityType, entityId],
    queryFn: () => activityLogsApi.getEntityAuditTrail(entityType, entityId),
    enabled: !!token && !!entityType && !!entityId,
    staleTime: 5 * 60_000,
  });
}
