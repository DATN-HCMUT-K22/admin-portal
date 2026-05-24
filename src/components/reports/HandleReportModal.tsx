"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleReportSchema, type HandleReportForm } from "@/lib/schemas/admin-forms";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HandleReportForm) => void;
  isPending?: boolean;
}

export function HandleReportModal({ isOpen, onClose, onSubmit, isPending }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<HandleReportForm>({
    resolver: zodResolver(handleReportSchema),
    defaultValues: {
      action: undefined,
      reason: "",
    },
  });

  const action = form.watch("action");

  const isDestructive = action === "DELETE_CONTENT" || action === "BAN_USER_TEMPORARY";

  const handleFormSubmit = (data: HandleReportForm) => {
    if (isDestructive) {
      setShowConfirm(true);
    } else {
      onSubmit(data);
    }
  };

  const resetAndClose = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Xử lý báo cáo</h2>
            <button onClick={resetAndClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>

          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Hành động</label>
                <select
                  {...form.register("action")}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                >
                  <option value="">-- Chọn hành động --</option>
                  <option value="DISMISS">Bỏ qua</option>
                  <option value="WARN_USER">Cảnh báo người dùng</option>
                  <option value="DELETE_CONTENT">Xóa nội dung</option>
                  <option value="BAN_USER_TEMPORARY">Khóa tạm thời (1-30 ngày)</option>
                </select>
                {form.formState.errors.action && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.action.message}</p>
                )}
              </div>

              {action === "BAN_USER_TEMPORARY" && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Số ngày khóa (1-30):</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    {...form.register("banDays", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-border px-4 py-2"
                    placeholder="7"
                  />
                  {form.formState.errors.banDays && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.banDays.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Lý do</label>
                <textarea
                  {...form.register("reason")}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Nhập lý do chi tiết cho quyết định này..."
                />
                {form.formState.errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.reason.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 rounded-lg border border-border px-4 py-2 font-medium transition hover:bg-accent"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Destructive action confirmation */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => form.handleSubmit(onSubmit)()}
        title="Xác nhận hành động"
        description={
          <>
            <p className="mb-2">Hành động này không thể hoàn tác:</p>
            <ul className="list-disc space-y-1 pl-5">
              {action === "DELETE_CONTENT" && (
                <li>Nội dung sẽ bị xóa vĩnh viễn</li>
              )}
              {action === "BAN_USER_TEMPORARY" && (
                <li>Người dùng sẽ bị khóa tạm thời</li>
              )}
            </ul>
          </>
        }
        variant="danger"
        confirmLabel="Tôi hiểu, tiếp tục"
      />
    </>
  );
}
