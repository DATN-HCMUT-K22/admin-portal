"use client";

import {
  ACTIVITY_TAB_ACTIONS,
  ACTIVITY_TAB_LABELS,
  type ActivityTabKey,
} from "@/types/api";

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
  return (
    <div className="flex flex-wrap gap-1 border-b border-border pb-0">
      {TABS.map((tab) => (
        <button
          key={tab}
          id={`activity-tab-${tab}`}
          onClick={() => onTabChange(tab)}
          className={[
            "flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all",
            activeTab === tab
              ? "border-b-2 border-primary bg-primary/5 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          ].join(" ")}
        >
          <span>{TAB_ICONS[tab]}</span>
          <span>{ACTIVITY_TAB_LABELS[tab]}</span>
        </button>
      ))}
    </div>
  );
}
