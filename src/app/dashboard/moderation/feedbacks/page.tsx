"use client";

import Link from "next/link";
import { useFeedbacks } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { normalizeItems } from "@/lib/list-utils";
import type { FeedbackItem } from "@/lib/api/feedbacks";

export default function FeedbacksPage() {
  const { data, isLoading, error } = useFeedbacks();
  const list = normalizeItems(
    data as FeedbackItem[] | { items: FeedbackItem[] } | undefined
  );
  const err = error as Error | null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Phản hồi người dùng</h1>
      <QueryState isLoading={isLoading} error={err}>
        <ul className="space-y-2">
          {list.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <span className="font-mono text-xs">{f.id}</span>
              <Link
                href={`/dashboard/moderation/feedbacks/${f.id}`}
                className="text-sm font-medium underline"
              >
                Chi tiết
              </Link>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Không có phản hồi.</p>
        )}
      </QueryState>
    </div>
  );
}
