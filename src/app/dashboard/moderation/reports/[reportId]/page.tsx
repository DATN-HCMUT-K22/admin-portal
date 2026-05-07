"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHandleReport, useReport } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { handleReportSchema, type HandleReportForm } from "@/lib/schemas/admin-forms";
import { ConfirmModal } from "@/components/common/ConfirmModal";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = String(params.reportId ?? "");

  const [selectedAction, setSelectedAction] = useState<HandleReportForm['action'] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);
  const handleMutation = useHandleReport(reportId);

  const form = useForm<HandleReportForm>({
    resolver: zodResolver(handleReportSchema),
  });

  const onActionClick = (action: HandleReportForm['action']) => {
    setSelectedAction(action);
    form.setValue('action', action);
    form.clearErrors();
  };

  const onSubmit = (data: HandleReportForm) => {
    setShowConfirm(true);
  };

  const onConfirm = () => {
    const data = form.getValues();
    const status = data.action === 'DISMISS' ? 'DISMISSED' : 'PROCESSED';
    const description = data.reason || '';

    handleMutation.mutate(
      { status, description },
      {
        onSuccess: () => {
          router.push('/dashboard/moderation/reports');
        },
        onError: (e) => {
          // Error is shown via mutation state
          console.error('Handle report error:', e);
        },
      }
    );
  };

  const getActionLabel = (action: string) => {
    const labels = {
      DISMISS: 'Bỏ qua',
      WARN_USER: 'Cảnh báo',
      DELETE_CONTENT: 'Xóa nội dung',
      BAN_USER_TEMPORARY: 'Ban tạm thời',
    };
    return labels[action as keyof typeof labels] || action;
  };

  const getConfirmMessage = () => {
    if (!selectedAction) return '';

    const messages = {
      DISMISS: 'Bỏ qua báo cáo này. Không có hành động nào được thực hiện.',
      WARN_USER: 'Cảnh báo người dùng vi phạm. Hành động này sẽ được ghi lại.',
      DELETE_CONTENT: 'Xóa nội dung vi phạm. Hành động này không thể hoàn tác.',
      BAN_USER_TEMPORARY: 'Ban tạm thời người dùng trong ' + (form.getValues('banDays') || 0) + ' ngày.',
    };

    return messages[selectedAction];
  };

  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chi tiết báo cáo</h1>
        <button
          onClick={() => router.push('/dashboard/moderation/reports')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Quay lại
        </button>
      </div>

      <QueryState isLoading={isLoading} error={err}>
        {report && (
          <div className="space-y-6">
            {/* Report Detail Card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ID báo cáo</p>
                  <p className="font-mono text-sm">{report.id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  report.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : report.status === 'PROCESSED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {report.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Người báo cáo</p>
                  <p className="font-medium">@{report.reporter.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại vi phạm</p>
                  <p className="font-medium">{report.violationType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại nội dung</p>
                  <p className="font-medium">{report.contentType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">
                    {new Date(report.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {report.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Mô tả</p>
                  <p className="mt-1 text-sm">{report.description}</p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-2">Nội dung bị báo cáo</p>
                <p className="text-sm">{report.reportedEntity.content || 'Không có nội dung'}</p>
              </div>
            </div>

            {/* Action Form */}
            {report.status === 'PENDING' && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h2 className="mb-4 font-semibold text-lg">Xử lý báo cáo</h2>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
                    <button
                      type="button"
                      onClick={() => onActionClick('DISMISS')}
                      className={`rounded-lg border-2 p-4 text-center transition ${
                        selectedAction === 'DISMISS'
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">❌</div>
                      <div className="text-sm font-medium">Bỏ qua</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onActionClick('WARN_USER')}
                      className={`rounded-lg border-2 p-4 text-center transition ${
                        selectedAction === 'WARN_USER'
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                          : 'border-border hover:border-amber-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">⚠️</div>
                      <div className="text-sm font-medium">Cảnh báo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onActionClick('DELETE_CONTENT')}
                      className={`rounded-lg border-2 p-4 text-center transition ${
                        selectedAction === 'DELETE_CONTENT'
                          ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                          : 'border-border hover:border-red-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">🗑️</div>
                      <div className="text-sm font-medium">Xóa nội dung</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onActionClick('BAN_USER_TEMPORARY')}
                      className={`rounded-lg border-2 p-4 text-center transition ${
                        selectedAction === 'BAN_USER_TEMPORARY'
                          ? 'border-destructive bg-destructive/10 ring-2 ring-destructive/20'
                          : 'border-border hover:border-destructive/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">🚫</div>
                      <div className="text-sm font-medium">Ban tạm thời</div>
                    </button>
                  </div>

                  {form.formState.errors.action && (
                    <p className="text-sm text-destructive mb-2">
                      {form.formState.errors.action.message}
                    </p>
                  )}
                </div>

                {/* Ban Days Input (conditional) */}
                {selectedAction === 'BAN_USER_TEMPORARY' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số ngày ban (1-30)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      {...form.register('banDays', { valueAsNumber: true })}
                      className="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Nhập số ngày"
                    />
                    {form.formState.errors.banDays && (
                      <p className="mt-1 text-sm text-destructive">
                        {form.formState.errors.banDays.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Reason Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lý do chi tiết <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    {...form.register('reason')}
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Nhập lý do chi tiết cho quyết định này (tối thiểu 10 ký tự)"
                  />
                  {form.formState.errors.reason && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/moderation/reports')}
                    className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition hover:bg-accent"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={handleMutation.isPending || !selectedAction}
                    className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {handleMutation.isPending ? "Đang xử lý..." : "Xác nhận xử lý"}
                  </button>
                </div>

                {handleMutation.isError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-800">
                      Lỗi: {(handleMutation.error as Error).message}
                    </p>
                  </div>
                )}
              </form>
            )}

            {report.status !== 'PENDING' && (
              <div className="rounded-lg border border-border bg-muted p-6 text-center">
                <p className="text-muted-foreground">
                  Báo cáo này đã được xử lý
                </p>
                {report.handledBy && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Xử lý bởi: @{report.handledBy.username}
                  </p>
                )}
                {report.handledAt && (
                  <p className="text-sm text-muted-foreground">
                    Vào lúc: {new Date(report.handledAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </QueryState>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onConfirm}
        title={`Xác nhận ${selectedAction ? getActionLabel(selectedAction) : ''}`}
        description={getConfirmMessage()}
        variant={selectedAction === 'DELETE_CONTENT' || selectedAction === 'BAN_USER_TEMPORARY' ? 'danger' : 'default'}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
      />
    </div>
  );
}
