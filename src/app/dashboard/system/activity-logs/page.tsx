"use client";

import { useState } from "react";
import { useActivityLogs, useExportLogs } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { LogFilterBar } from "@/components/activity-logs/LogFilterBar";
import { LogTable } from "@/components/activity-logs/LogTable";
import type { ActivityLogParams } from "@/types/api";

export default function ActivityLogsPage() {
  const [filters, setFilters] = useState<ActivityLogParams>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useActivityLogs({ ...filters, page, pageSize: 20 });
  const exportMutation = useExportLogs();

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nhật ký hoạt động</h1>
      </div>

      <LogFilterBar
        onFilterChange={setFilters}
        onExport={handleExport}
        isExporting={exportMutation.isPending}
      />

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <LogTable
          logs={data?.items || []}
          total={data?.total}
          page={page}
          onPageChange={setPage}
        />
      </QueryState>
    </div>
  );
}
