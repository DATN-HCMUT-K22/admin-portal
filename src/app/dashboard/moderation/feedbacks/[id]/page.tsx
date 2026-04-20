"use client";

import { useParams } from "next/navigation";
import { useFeedback } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";

export default function FeedbackDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  const { data, isLoading, error } = useFeedback(id);
  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Chi tiết phản hồi</h1>
      <QueryState isLoading={isLoading} error={err}>
        {data && (
          <pre className="overflow-auto rounded-xl border border-border bg-muted p-4 text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </QueryState>
    </div>
  );
}
