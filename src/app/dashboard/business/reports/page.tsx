"use client";

import { useState } from "react";
import { useReports } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ReportFilterBar } from "@/components/reports/ReportFilterBar";
import { ReportCard } from "@/components/reports/ReportCard";
import type { ContentType, ReportStatus, ReportDetail } from "@/types/api";

function normalizeItems<T>(data: T[] | { items: T[] } | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items || [];
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<{
    contentType?: ContentType;
    status?: ReportStatus;
  }>({});

  const { data, isLoading, error } = useReports(filters);
  const reports = normalizeItems(data as ReportDetail[] | { items: ReportDetail[] } | undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Quản lý báo cáo</h1>

      <ReportFilterBar onFilterChange={setFilters} />

      <QueryState isLoading={isLoading} error={error as Error | null}>
        {reports.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Không có báo cáo nào.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
