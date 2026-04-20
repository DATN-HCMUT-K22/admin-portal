"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHandleReport, useReport } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { handleReportSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";

type Form = z.infer<typeof handleReportSchema>;

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = String(params.reportId ?? "");

  const { data: report, isLoading, error } = useReport(reportId);
  const mut = useHandleReport(reportId);

  const form = useForm<Form>({
    resolver: zodResolver(handleReportSchema),
    defaultValues: {
      status: "PROCESSED",
      description: "",
    },
  });

  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Chi tiết báo cáo</h1>
      <QueryState isLoading={isLoading} error={err}>
        {report && (
          <pre className="max-h-64 overflow-auto rounded-xl border border-border bg-muted p-4 text-xs">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </QueryState>

      <section>
        <h2 className="mb-3 font-medium">Xử lý báo cáo</h2>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((v) =>
            mut.mutateAsync(v).catch(() => undefined)
          )}
        >
          <input
            {...form.register("status")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="PROCESSED"
          />
          <textarea
            {...form.register("description")}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Ghi chú nội bộ"
          />
          {form.formState.errors.status && (
            <p className="text-sm text-destructive">
              {form.formState.errors.status.message}
            </p>
          )}
          <button
            type="submit"
            disabled={mut.isPending || !reportId}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            {mut.isPending ? "Đang gửi…" : "Gửi xử lý"}
          </button>
          {mut.isError && (
            <p className="text-sm text-destructive">
              {(mut.error as Error).message}
            </p>
          )}
          {mut.isSuccess && (
            <p className="text-sm text-primary">Đã cập nhật.</p>
          )}
        </form>
      </section>
    </div>
  );
}
