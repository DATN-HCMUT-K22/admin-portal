"use client";

import { useState } from "react";
import type { ContentType, ReportStatus } from "@/types/api";

interface Props {
  onFilterChange: (filters: { contentType?: ContentType; status?: ReportStatus }) => void;
}

const contentTypes: { value: ContentType; label: string }[] = [
  { value: "POST", label: "Post" },
  { value: "COMMENT", label: "Comment" },
  { value: "USER", label: "User" },
];

const statuses: { value: ReportStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "PROCESSED", label: "Processed" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ESCALATED", label: "Escalated" },
];

export function ReportFilterBar({ onFilterChange }: Props) {
  const [activeTab, setActiveTab] = useState<ContentType | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | undefined>();

  const handleTabChange = (type: ContentType | undefined) => {
    setActiveTab(type);
    onFilterChange({ contentType: type, status: selectedStatus });
  };

  const handleStatusChange = (status: ReportStatus | undefined) => {
    setSelectedStatus(status);
    onFilterChange({ contentType: activeTab, status });
  };

  return (
    <div className="space-y-4">
      {/* Content Type Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => handleTabChange(undefined)}
          className={`px-4 py-2 font-medium transition ${
            !activeTab
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {contentTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleTabChange(type.value)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === type.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Trạng thái:</label>
        <select
          value={selectedStatus || ""}
          onChange={(e) => handleStatusChange((e.target.value as ReportStatus) || undefined)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
