"use client";

import { useState } from "react";
import type { ActivityLogParams } from "@/types/api";

interface Props {
  onFilterChange: (filters: ActivityLogParams) => void;
  onExport: () => void;
  isExporting?: boolean;
}

export function LogFilterBar({ onFilterChange, onExport, isExporting }: Props) {
  const [filters, setFilters] = useState<ActivityLogParams>({});

  const handleChange = (key: keyof ActivityLogParams, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Người dùng</label>
          <input
            type="text"
            value={filters.userId || ""}
            onChange={(e) => handleChange("userId", e.target.value)}
            placeholder="User ID hoặc username"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Action Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Hành động</label>
          <select
            value={filters.action || ""}
            onChange={(e) => handleChange("action", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="CREATE">Tạo mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
            <option value="LOGIN">Đăng nhập</option>
            <option value="LOGOUT">Đăng xuất</option>
          </select>
        </div>

        {/* Entity Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Loại đối tượng</label>
          <select
            value={filters.entityType || ""}
            onChange={(e) => handleChange("entityType", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="USER">Người dùng</option>
            <option value="POST">Bài viết</option>
            <option value="COMMENT">Bình luận</option>
            <option value="REPORT">Báo cáo</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="mb-2 block text-sm font-medium">Từ ngày</label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
        >
          Xóa bộ lọc
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isExporting ? "Đang xuất..." : "Xuất CSV"}
        </button>
      </div>
    </div>
  );
}
