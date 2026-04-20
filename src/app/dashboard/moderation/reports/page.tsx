"use client";

import Link from "next/link";
import { useReports } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { normalizeItems } from "@/lib/list-utils";
import type { ReportListItem } from "@/lib/api/reports";

export default function ReportsPage() {
  const { data, isLoading, error } = useReports();
  const list = normalizeItems(
    data as ReportListItem[] | { items: ReportListItem[] } | undefined
  );
  const err = error as Error | null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Báo cáo</h1>
      <QueryState isLoading={isLoading} error={err}>
        <ul className="space-y-2">
          {list.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div>
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                {r.status != null && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    — {String(r.status)}
                  </span>
                )}
              </div>
              <Link
                href={`/dashboard/moderation/reports/${r.id}`}
                className="text-sm font-medium underline"
              >
                Xử lý
              </Link>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Không có báo cáo.</p>
        )}
      </QueryState>
    </div>
  );
}
