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
  POST_CREATED: "Create post",
  POST_UPDATED: "Update post",
  POST_DELETED: "Delete post",
  POST_LIKED: "Like post",
  POST_UNLIKED: "Unlike post",
  POST_SAVED: "Save post",
  POST_SHARED: "Share post",
  COMMENT_CREATED: "Create comment",
  COMMENT_UPDATED: "Update comment",
  COMMENT_DELETED: "Delete comment",
  COMMENT_LIKED: "Like comment",
  COMMENT_REPLIED: "Reply to comment",
  GROUP_CREATED: "Create group",
  GROUP_UPDATED: "Update group",
  GROUP_DELETED: "Delete group",
  GROUP_JOINED: "Join group",
  GROUP_LEFT: "Leave group",
  GROUP_MEMBER_ADDED: "Add member",
  GROUP_MEMBER_REMOVED: "Remove member",
  GROUP_ROLE_CHANGED: "Change role",
  ITINERARY_CREATED: "Create itinerary",
  ITINERARY_UPDATED: "Update itinerary",
  ITINERARY_DELETED: "Delete itinerary",
  ITINERARY_SHARED: "Share itinerary",
  ITINERARY_LIKED: "Like itinerary",
  MESSAGE_SENT: "Send message",
  MESSAGE_DELETED: "Delete message",
  MESSAGE_LIKED: "Like message",
  USER_LOGIN: "Login",
  USER_LOGOUT: "Logout",
  USER_REGISTERED: "Register",
  USER_PROFILE_UPDATED: "Update profile",
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
          <option value="">All actions</option>
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
