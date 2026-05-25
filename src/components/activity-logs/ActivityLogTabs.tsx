"use client";

import {
  ACTIVITY_TAB_ACTIONS,
  ACTIVITY_TAB_LABELS,
  type ActivityTabKey,
} from "@/types/api";
import { Tabs } from "antd";

interface Props {
  activeTab: ActivityTabKey;
  onTabChange: (tab: ActivityTabKey) => void;
}

const TABS: ActivityTabKey[] = [
  "all",
  "post",
  "comment",
  "group",
  "itinerary",
  "message",
  "auth",
];

const TAB_ICONS: Record<ActivityTabKey, string> = {
  all: "◎",
  post: "📝",
  comment: "💬",
  group: "👥",
  itinerary: "🗺️",
  message: "✉️",
  auth: "🔐",
};

/** Lấy action đầu tiên của tab để truyền xuống API (single action filter) */
export function getTabActions(tab: ActivityTabKey): string | undefined {
  if (tab === "all") return undefined;
  return ACTIVITY_TAB_ACTIONS[tab][0]; // BE chỉ hỗ trợ 1 action tại 1 thời điểm
}

export function ActivityLogTabs({ activeTab, onTabChange }: Props) {
  const items = TABS.map((tab) => ({
    key: tab,
    label: (
      <span>
        <span style={{ marginRight: 8 }}>{TAB_ICONS[tab]}</span>
        {ACTIVITY_TAB_LABELS[tab]}
      </span>
    ),
  }));

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as ActivityTabKey)}
      items={items}
      style={{ marginBottom: 0 }}
    />
  );
}
