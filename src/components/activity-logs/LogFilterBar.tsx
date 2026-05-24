"use client";

import { useState } from "react";
import type { ActivityAction, ActivityLogParams } from "@/types/api";

interface Props {
  onFilterChange: (filters: ActivityLogParams) => void;
  /** Actions available cho tab hiện tại — nếu rỗng thì show tất cả */
  allowedActions?: ActivityAction[];
}

/** Nhãn thân thiện cho từng action */
const ACTION_LABELS: Partial<Record<ActivityAction, string>> = {
  POST_CREATED: "Tạo bài viết",
  POST_UPDATED: "Sửa bài viết",
  POST_DELETED: "Xóa bài viết",
  POST_LIKED: "Thích bài viết",
  POST_UNLIKED: "Bỏ thích",
  POST_SAVED: "Lưu bài viết",
  POST_SHARED: "Chia sẻ",
  COMMENT_CREATED: "Tạo bình luận",
  COMMENT_UPDATED: "Sửa bình luận",
  COMMENT_DELETED: "Xóa bình luận",
  COMMENT_LIKED: "Thích bình luận",
  COMMENT_REPLIED: "Trả lời",
  GROUP_CREATED: "Tạo nhóm",
  GROUP_UPDATED: "Cập nhật nhóm",
  GROUP_DELETED: "Xóa nhóm",
  GROUP_JOINED: "Tham gia nhóm",
  GROUP_LEFT: "Rời nhóm",
  GROUP_MEMBER_ADDED: "Thêm thành viên",
  GROUP_MEMBER_REMOVED: "Xóa thành viên",
  GROUP_ROLE_CHANGED: "Đổi vai trò nhóm",
  ITINERARY_CREATED: "Tạo lịch trình",
  ITINERARY_UPDATED: "Cập nhật lịch trình",
  ITINERARY_DELETED: "Xóa lịch trình",
  ITINERARY_SHARED: "Chia sẻ lịch trình",
  ITINERARY_LIKED: "Thích lịch trình",
  MESSAGE_SENT: "Gửi tin nhắn",
  MESSAGE_DELETED: "Xóa tin nhắn",
  MESSAGE_LIKED: "Thích tin nhắn",
  USER_LOGIN: "Đăng nhập",
  USER_LOGOUT: "Đăng xuất",
  USER_REGISTERED: "Đăng ký",
  USER_PROFILE_UPDATED: "Cập nhật hồ sơ",
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS) as ActivityAction[];

export function LogFilterBar({ onFilterChange, allowedActions }: Props) {
  const [action, setAction] = useState<string>("");

  const actions = allowedActions?.length ? allowedActions : ALL_ACTIONS;

  function handleActionChange(val: string) {
    setAction(val);
    onFilterChange({ action: (val as ActivityAction) || undefined });
  }

  function handleClear() {
    setAction("");
    onFilterChange({});
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Action filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Lọc theo hành động
        </label>
        <select
          id="log-filter-action"
          value={action}
          onChange={(e) => handleActionChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả hành động</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] ?? a}
            </option>
          ))}
        </select>
      </div>

      {action && (
        <button
          onClick={handleClear}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent"
        >
          Xóa lọc
        </button>
      )}
    </div>
  );
}
