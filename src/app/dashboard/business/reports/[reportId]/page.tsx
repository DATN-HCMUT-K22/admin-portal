"use client";

import { useState } from "react";
import { use } from "react";
import { useReport, useHandleReport } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { HandleReportModal } from "@/components/reports/HandleReportModal";
import type { HandleReportForm } from "@/lib/schemas/admin-forms";
import type { HandleReportRequest } from "@/types/api";

export default function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);
  const handleMutation = useHandleReport(reportId);

  const handleSubmit = (data: HandleReportForm) => {
    handleMutation.mutate(data as unknown as HandleReportRequest, {
      onSuccess: () => {
        setModalOpen(false);
        alert("Xử lý báo cáo thành công!");
      },
      onError: (err) => {
        alert(`Lỗi: ${err instanceof Error ? err.message : "Không xác định"}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chi tiết báo cáo</h1>
        {report && report.status === "PENDING" && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90"
          >
            Xử lý báo cáo
          </button>
        )}
      </div>

      <QueryState isLoading={isLoading} error={error as Error | null}>
        {report && (
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-border p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Báo cáo #{report.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <ReportStatusBadge status={report.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Loại nội dung</p>
                  <p className="font-medium">{report.contentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Loại vi phạm</p>
                  <p className="font-medium">{report.violationType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người báo cáo</p>
                  <p className="font-medium">{report.reporter.username}</p>
                </div>
                {report.handledBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Người xử lý</p>
                    <p className="font-medium">{report.handledBy.username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reported Content */}
            {report.reportedEntity.content && (
              <div className="rounded-xl border border-border p-6">
                <h3 className="mb-3 font-semibold">Nội dung bị báo cáo</h3>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">{report.reportedEntity.content}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {report.description && (
              <div className="rounded-xl border border-border p-6">
                <h3 className="mb-3 font-semibold">Mô tả báo cáo</h3>
                <p className="text-sm">{report.description}</p>
              </div>
            )}
          </div>
        )}
      </QueryState>

      <HandleReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isPending={handleMutation.isPending}
      />
    </div>
  );
}
