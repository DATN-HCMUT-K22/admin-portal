/** DTOs & enums theo Admin API Guide — cập nhật 24/05/2026 */

// ─── Role / Auth ──────────────────────────────────────────────────────────────


/** Role object trả về trong UserResponse.roles[] */
export interface PermissionResponse {
  name: string;
  description: string;
}

export interface RoleResponse {
  name: string;
  description?: string;
  permissions?: PermissionResponse[];
}

/** Alias dùng chỗ cũ cần backward-compat */
export type RoleRef = RoleResponse;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthLoginData {
  access_token: string;
  authenticated: boolean;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

/** Thông tin tóm tắt của user — dùng trong ActivityLog, ModerationAction */
export interface UserSimpleResponse {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/**
 * Full user shape — trả về từ GET /me và GET /users/{id}/admin-view
 * Thay thế UserAdminView cũ.
 */
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;     // "yyyy-MM-dd"
  credits: number;
  emailVerified: boolean;
  deleted: boolean;
  locked: boolean;
  roles: RoleResponse[];
  created_at: string;             // "yyyy-MM-dd'T'HH:mm:ss"
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** Alias cho /me endpoint */
export type UserMe = UserResponse;

/**
 * @deprecated Dùng UserResponse thay thế.
 * Giữ lại để tránh break các component chưa migrate.
 */
export interface UserAdminView {
  id: string;
  username: string;
  fullName: string | null;
  email?: string;
  roles: RoleResponse[];
  locked: boolean;
  deleted: boolean;
  credits: number;
  avatarUrl?: string | null;
}

// ─── Pagination (Spring Pageable) ─────────────────────────────────────────────

/** Spring Page<T> response format */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort?: { sorted: boolean; unsorted: boolean };
  };
  first?: boolean;
  last?: boolean;
  size?: number;
  number?: number;
}

/**
 * Unified paginated type — maps Spring Page để tiện dùng trong hooks.
 * Dùng `content` (mảng items) và `totalElements` (tổng số bản ghi).
 */
export type Paginated<T> = SpringPage<T>;

// ─── Activity Log ─────────────────────────────────────────────────────────────

export type ActivityAction =
  // Post
  | "POST_CREATED" | "POST_UPDATED" | "POST_DELETED"
  | "POST_LIKED"   | "POST_UNLIKED"
  | "POST_SAVED"   | "POST_UNSAVED" | "POST_SHARED"
  // Comment
  | "COMMENT_CREATED" | "COMMENT_UPDATED" | "COMMENT_DELETED"
  | "COMMENT_LIKED"   | "COMMENT_UNLIKED" | "COMMENT_REPLIED"
  // Group
  | "GROUP_CREATED"       | "GROUP_UPDATED"       | "GROUP_DELETED"
  | "GROUP_JOINED"        | "GROUP_LEFT"
  | "GROUP_MEMBER_ADDED"  | "GROUP_MEMBER_REMOVED"
  | "GROUP_ROLE_CHANGED"
  // Itinerary
  | "ITINERARY_CREATED" | "ITINERARY_UPDATED" | "ITINERARY_DELETED"
  | "ITINERARY_SHARED"  | "ITINERARY_LIKED"
  // Message
  | "MESSAGE_SENT" | "MESSAGE_DELETED" | "MESSAGE_LIKED"
  // Notification
  | "NOTIFICATION_CREATED" | "NOTIFICATION_SENT"
  | "NOTIFICATION_READ"    | "NOTIFICATION_DELETED"
  // User / Auth
  | "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTERED" | "USER_PROFILE_UPDATED";

export type EntityType =
  | "POST" | "COMMENT" | "GROUP" | "ITINERARY"
  | "MESSAGE" | "CONVERSATION" | "USER";

/** Tab groups map action prefix → tab label */
export type ActivityTabKey = "all" | "post" | "comment" | "group" | "itinerary" | "message" | "auth";

export const ACTIVITY_TAB_ACTIONS: Record<ActivityTabKey, ActivityAction[]> = {
  all: [],
  post: [
    "POST_CREATED", "POST_UPDATED", "POST_DELETED",
    "POST_LIKED", "POST_UNLIKED", "POST_SAVED", "POST_UNSAVED", "POST_SHARED",
  ],
  comment: [
    "COMMENT_CREATED", "COMMENT_UPDATED", "COMMENT_DELETED",
    "COMMENT_LIKED", "COMMENT_UNLIKED", "COMMENT_REPLIED",
  ],
  group: [
    "GROUP_CREATED", "GROUP_UPDATED", "GROUP_DELETED",
    "GROUP_JOINED", "GROUP_LEFT",
    "GROUP_MEMBER_ADDED", "GROUP_MEMBER_REMOVED", "GROUP_ROLE_CHANGED",
  ],
  itinerary: [
    "ITINERARY_CREATED", "ITINERARY_UPDATED", "ITINERARY_DELETED",
    "ITINERARY_SHARED", "ITINERARY_LIKED",
  ],
  message: ["MESSAGE_SENT", "MESSAGE_DELETED", "MESSAGE_LIKED"],
  auth: ["USER_LOGIN", "USER_LOGOUT", "USER_REGISTERED", "USER_PROFILE_UPDATED"],
};

export const ACTIVITY_TAB_LABELS: Record<ActivityTabKey, string> = {
  all: "Tất cả",
  post: "Bài viết",
  comment: "Bình luận",
  group: "Nhóm",
  itinerary: "Lịch trình",
  message: "Tin nhắn",
  auth: "Tài khoản",
};

/** ActivityLog response từ BE (snake_case cho timestamps & entity fields) */
export interface ActivityLog {
  id: string;
  user: UserSimpleResponse;
  action: ActivityAction;
  entity_type: EntityType | string | null;
  entity_id: string | null;
  metadata: string | null;        // JSON string, cần JSON.parse()
  ip_address: string | null;
  created_at: string;             // "yyyy-MM-dd'T'HH:mm:ss"
}

export interface ActivityLogParams {
  action?: ActivityAction | string;
  page?: number;
  size?: number;
  sort?: string;
}

// ─── User Management Requests ──────────────────────────────────────────────────

export interface UserStatusUpdateRequest {
  locked: boolean;
}

export interface UserRoleUpdateRequest {
  roles: string[];
}

export interface CreateUserWithRolesRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  roles: string[];
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export type ReportStatus = "PENDING" | "UNDER_REVIEW" | "PROCESSED" | "DISMISSED" | "ESCALATED";
export type ViolationType =
  | "SPAM" | "HARASSMENT" | "HATE_SPEECH" | "MISINFORMATION"
  | "INAPPROPRIATE_CONTENT" | "COPYRIGHT" | "IMPERSONATION" | "OTHER";
export type ContentType = "POST" | "COMMENT" | "USER";

export interface ReportDetail {
  id: string;
  reason: ViolationType;
  status: ReportStatus;
  description?: string;
  reportedBy: string;
  reporter: UserSimpleResponse;
  reported_user?: UserSimpleResponse;
  reportedEntityId: string;
  reportedEntityType: ContentType;
  reported_content_text?: string;
  reported_media_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface HandleReportPayload {
  decision: "DISMISS" | "PROCESS" | "ESCALATE";
  action?: | "WARN_USER" | "DELETE_CONTENT" | "BAN_USER_TEMPORARY"
    | "BAN_USER_PERMANENT" | "RESTORE_CONTENT" | "UNBAN_USER";
  reason: string;
  banDays?: number;
}

export interface HandleReportRequest {
  status: ReportStatus;
  description?: string;
  feedback_content?: string;
  moderation_action?: {
    user_id: string;
    actionType: string;
    note?: string;
  };
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export type ModerationActionType = "BAN_USER" | "WARN_USER" | "DELETE_POST";

/** Request gửi lên BE — user_id là snake_case theo API spec */
export interface ModerationActionRequest {
  user_id: string;
  actionType: ModerationActionType | string;
  note?: string;
}

/** Response từ BE — snake_case fields */
export interface ModerationActionResponse {
  id: string;
  moderated_user: UserSimpleResponse;
  admin: UserSimpleResponse;
  action_type: string;
  note: string | null;
  created_at: string;
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleWithPermissions {
  name: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface PermissionRequest {
  name: string;
  description: string;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface DailyTrendDto { date: string; count: number }
export interface TopReporterDto {
  user: { id: string; username: string; fullName: string };
  report_count: number;
}
export interface MostActiveUserDto {
  user: { id: string; username: string; fullName: string };
  post_count: number;
  comment_count: number;
}
export interface RecentErrorDto {
  timestamp: string;
  error_message: string;
  endpoint: string;
}

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

export interface ReportStatisticsResponse {
  total_reports: number;
  pending_reports: number;
  processed_reports: number;
  dismissed_reports: number;
  by_type: Record<ViolationType, number>;
  by_content_type: Record<ContentType, number>;
  avg_handling_time_hours: number;
  trend: DailyTrendDto[];
}

export interface AggregateUserStatisticsResponse {
  total_users: number;
  active_users: number;
  locked_users: number;
  deleted_users: number;
  new_users_this_month: number;
  growth_rate_percent: number;
  by_role: Record<string, number>;
  top_reporters: TopReporterDto[];
}

export interface ContentStatisticsResponse {
  total_posts: number;
  total_comments: number;
  posts_created_today: number;
  comments_created_today: number;
  deleted_posts: number;
  deleted_comments: number;
  avg_posts_per_user: number;
  most_active_users: MostActiveUserDto[];
}

export interface SystemHealthResponse {
  memory_usage_percent: number;
  cpu_usage_percent: number;
  active_sessions: number;
  error_count: number;
  avg_response_time_ms: number;
  recent_errors: RecentErrorDto[];
}
