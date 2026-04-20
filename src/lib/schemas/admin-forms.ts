import { z } from "zod";

export const userStatusSchema = z.object({
  isLocked: z.boolean(),
});

export const userRolesSchema = z.object({
  roles: z.string().min(1, "Nhập ít nhất một role, cách nhau bởi dấu phẩy"),
});

export const roleCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  permissions: z.string().min(1, "Danh sách permission, cách nhau bởi dấu phẩy"),
});

export const handleReportSchema = z.object({
  decision: z.enum(['DISMISS', 'PROCESS', 'ESCALATE']).refine((val) => val !== undefined, {
    message: 'Vui lòng chọn quyết định',
  }),
  action: z.enum([
    'WARN_USER',
    'DELETE_CONTENT',
    'BAN_USER_TEMPORARY',
    'BAN_USER_PERMANENT',
    'RESTORE_CONTENT',
    'UNBAN_USER',
  ]).optional(),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
  banDays: z.number().min(1).max(30).optional(),
});

export type HandleReportForm = z.infer<typeof handleReportSchema>;

export const moderateUserSchema = z.object({
  userId: z.string().uuid("UUID không hợp lệ"),
  actionType: z.enum(["BAN_USER", "WARN_USER"]),
  note: z.string().min(1),
});

export const locationUpsertSchema = z.object({
  name: z.string().min(1),
  location_type: z.string().min(1),
  is_verified: z.boolean(),
  operational_status: z.enum([
    "OPERATIONAL",
    "CLOSED_PERMANENTLY",
    "CLOSED_TEMPORARILY",
  ]),
  /** Chuỗi từ input; chuyển sang số khi gửi API */
  rating: z.string().optional(),
  user_ratings_total: z.string().optional(),
  hotline: z.string().optional(),
  website: z.string().optional(),
  opening_hours: z.string().optional(),
});
