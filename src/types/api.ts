/** DTOs & enums theo Admin API Guide */

export type OperationalStatus =
  | "OPERATIONAL"
  | "CLOSED_PERMANENTLY"
  | "CLOSED_TEMPORARILY";

export type LocationType = "POI" | string;

export interface RoleRef {
  name: string;
}

/** Phản hồi đăng nhập — theo authentication.md */
export interface AuthLoginData {
  token: string;
  authenticated: boolean;
  refreshToken?: string;
}

export interface UserAdminView {
  id: string;
  username: string;
  fullName: string;
  roles: RoleRef[];
  isLocked: boolean;
  isDeleted: boolean;
  credits: number;
}

/** GET /api/v1/users/me — cùng shape với profile admin */
export type UserMe = UserAdminView;

export interface Paginated<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface UserStatusUpdateRequest {
  isLocked: boolean;
}

export interface UserRoleUpdateRequest {
  roles: string[];
}

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleWithPermissions extends RoleRequest {
  id?: string;
}

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'PROCESSED' | 'DISMISSED' | 'ESCALATED';
export type ViolationType = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'MISINFORMATION'
  | 'INAPPROPRIATE_CONTENT' | 'COPYRIGHT' | 'IMPERSONATION' | 'OTHER';
export type ContentType = 'POST' | 'COMMENT' | 'USER';

export interface ReportDetail {
  id: string;
  contentType: ContentType;
  violationType: ViolationType;
  status: ReportStatus;
  reporter: { id: string; username: string };
  reportedEntity: { id: string; content?: string; userId?: string };
  createdAt: string;
  handledAt?: string;
  handledBy?: { username: string };
  description?: string;
}

export interface HandleReportPayload {
  decision: 'DISMISS' | 'PROCESS' | 'ESCALATE';
  action?: 'WARN_USER' | 'DELETE_CONTENT' | 'BAN_USER_TEMPORARY'
    | 'BAN_USER_PERMANENT' | 'RESTORE_CONTENT' | 'UNBAN_USER';
  reason: string;
  banDays?: number;
}

export interface HandleReportRequest {
  status: ReportStatus;
  description: string;
}

export type ModerationActionType = "BAN_USER" | "WARN_USER";

export interface ModerationActionRequest {
  userId: string;
  actionType: ModerationActionType;
  note: string;
}

export interface LocationBusinessMetadata {
  name: string;
  location_type: LocationType;
  is_verified: boolean;
  operational_status: OperationalStatus;
  rating?: number;
  user_ratings_total?: number;
  hotline?: string;
  website?: string;
  opening_hours?: string | Record<string, unknown>;
}

export type AdministrativeType = "COUNTRY" | "PROVINCE";

export interface UserStatistics {
  userId: string;
  username: string;
  fullName: string;
  activity: {
    totalPosts: number;
    totalComments: number;
    likesReceived: number;
    lastActive: string;
    avgPostsPerWeek: number;
  };
  violations: {
    reportsReceived: number;
    confirmedViolations: number;
    warnings: number;
  };
  timeline: Array<{ date: string; posts: number; comments: number }>;
  moderationHistory: Array<{
    id: string;
    actionType: string;
    reason: string;
    handledBy: string;
    createdAt: string;
  }>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

export interface ActivityLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
