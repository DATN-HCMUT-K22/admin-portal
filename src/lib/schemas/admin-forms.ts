import { z } from "zod";

// Form khóa / mở khóa tài khoản
export const userStatusSchema = z.object({
  isLocked: z.boolean(),
});

export const userRolesSchema = z.object({
  roles: z.string().min(1, "Nhập ít nhất một role, cách nhau bởi dấu phẩy"),
});

export const createUserSchema = z.object({
  username: z.string().min(4, "Tên đăng nhập tối thiểu 4 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  fullName: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

export const roleCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  permissions: z.string().min(1, "Danh sách permission, cách nhau bởi dấu phẩy"),
});

/**
 * Simplified report handling schema for MVP.
 * Single action selection with optional ban duration.
 */
export const handleReportSchema = z.object({
  action: z.enum(['DISMISS', 'WARN_USER', 'DELETE_CONTENT', 'BAN_USER_TEMPORARY']).refine(
    (val) => val !== undefined,
    { message: 'Vui lòng chọn hành động' }
  ),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
  banDays: z.number().int().min(1).max(30).optional(),
}).refine(
  (data) => {
    // Require banDays if action is BAN_USER_TEMPORARY
    if (data.action === 'BAN_USER_TEMPORARY') {
      return data.banDays !== undefined && data.banDays > 0;
    }
    return true;
  },
  {
    message: 'Phải nhập số ngày ban (1-30)',
    path: ['banDays'],
  }
);

export type HandleReportForm = z.infer<typeof handleReportSchema>;

export const moderateUserSchema = z.object({
  user_id: z.string().min(1, "ID không hợp lệ"),
  actionType: z.enum(["BAN_USER", "WARN_USER", "DELETE_POST"]),
  note: z.string().optional(),
  banDays: z.number().int().min(1).max(365).optional(),
}).refine(
  (data) => {
    if (data.actionType === 'BAN_USER') {
      return data.banDays !== undefined && data.banDays > 0;
    }
    return true;
  },
  {
    message: 'Phải nhập số ngày ban (lớn hơn 0) nếu chọn Khóa tài khoản',
    path: ['banDays'],
  }
);

