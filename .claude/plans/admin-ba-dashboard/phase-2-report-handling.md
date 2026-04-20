# Phase 2: Report Handling Workflow

**Duration:** 3-4 days  
**Status:** ✅ COMPLETE  
**Goal:** BA can process reports with moderation actions

---

## Objectives

- Build 3-step modal for handling reports
- Implement confirmation dialogs for destructive actions
- Enhance report detail page with full information
- Add optimistic updates for better UX

---

## Tasks

### 1. Add Form Schema

**File:** `src/lib/schemas/admin-forms.ts`

```typescript
export const handleReportSchema = z.object({
  decision: z.enum(['DISMISS', 'PROCESS', 'ESCALATE'], {
    required_error: 'Vui lòng chọn quyết định',
  }),
  action: z.enum([
    'WARN_USER',
    'DELETE_CONTENT',
    'BAN_USER_TEMPORARY',
    'BAN_USER_PERMANENT',
    'RESTORE_CONTENT',
    'UNBAN_USER',
  ]).optional(),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
  banDays: z.number().min(1).max(30).optional(), // For BAN_USER_TEMPORARY
});

export type HandleReportForm = z.infer<typeof handleReportSchema>;
```

### 2. Update API Client

**File:** `src/lib/api/reports.ts`

```typescript
interface HandleReportPayload {
  decision: 'DISMISS' | 'PROCESS' | 'ESCALATE';
  action?: 'WARN_USER' | 'DELETE_CONTENT' | 'BAN_USER_TEMPORARY' 
    | 'BAN_USER_PERMANENT' | 'RESTORE_CONTENT' | 'UNBAN_USER';
  reason: string;
  banDays?: number;
}

export async function handleReport(
  token: string, 
  reportId: string, 
  payload: HandleReportPayload
) {
  return apiFetch(`/api/v1/reports/${reportId}/handle`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
```

### 3. Create Confirm Modal Component

**File:** `src/components/common/ConfirmModal.tsx`

```typescript
"use client";

import { type ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "default",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold">{title}</h2>
        <div className="mb-6 text-sm text-muted-foreground">{description}</div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. Create Handle Report Modal

**File:** `src/components/reports/HandleReportModal.tsx`

```typescript
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const form = useForm<HandleReportForm>({
    resolver: zodResolver(handleReportSchema),
    defaultValues: {
      decision: undefined,
      action: undefined,
      reason: "",
    },
  });

  const decision = form.watch("decision");
  const action = form.watch("action");

  const isDestructive = action === "BAN_USER_PERMANENT" || action === "DELETE_CONTENT";

  const handleFormSubmit = (data: HandleReportForm) => {
    if (isDestructive) {
      setShowConfirm(true);
    } else {
      onSubmit(data);
    }
  };

  const resetAndClose = () => {
    form.reset();
    setStep(1);
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

          {/* Progress indicator */}
          <div className="mb-6 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Step 1: Decision */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">Bước 1: Chọn quyết định</h3>
                <div className="space-y-3">
                  {[
                    { value: "DISMISS", label: "Bỏ qua", desc: "Báo cáo không hợp lệ" },
                    { value: "PROCESS", label: "Xử lý", desc: "Thực hiện hành động kiểm duyệt" },
                    { value: "ESCALATE", label: "Leo thang", desc: "Chuyển cho admin xử lý" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition hover:bg-accent/50"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...form.register("decision")}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-sm text-muted-foreground">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {form.formState.errors.decision && (
                  <p className="text-sm text-red-600">{form.formState.errors.decision.message}</p>
                )}
                <button
                  type="button"
                  onClick={() => decision && setStep(2)}
                  disabled={!decision}
                  className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {/* Step 2: Action (only if PROCESS) */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  Bước 2: {decision === "PROCESS" ? "Chọn hành động" : "Xác nhận"}
                </h3>
                
                {decision === "PROCESS" ? (
                  <>
                    <select
                      {...form.register("action")}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2"
                    >
                      <option value="">-- Chọn hành động --</option>
                      <option value="WARN_USER">Cảnh báo người dùng</option>
                      <option value="DELETE_CONTENT">Xóa nội dung</option>
                      <option value="BAN_USER_TEMPORARY">Khóa tạm thời (1-30 ngày)</option>
                      <option value="BAN_USER_PERMANENT">Khóa vĩnh viễn</option>
                      <option value="RESTORE_CONTENT">Khôi phục nội dung</option>
                      <option value="UNBAN_USER">Mở khóa người dùng</option>
                    </select>

                    {action === "BAN_USER_TEMPORARY" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Số ngày khóa (1-30):</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          {...form.register("banDays", { valueAsNumber: true })}
                          className="w-full rounded-lg border border-border px-4 py-2"
                          placeholder="7"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {decision === "DISMISS" 
                      ? "Báo cáo sẽ được đánh dấu là đã bỏ qua." 
                      : "Báo cáo sẽ được chuyển cho admin xử lý."}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-lg border border-border px-4 py-2 font-medium transition hover:bg-accent"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={decision === "PROCESS" && !action}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Reason */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium">Bước 3: Lý do</h3>
                <textarea
                  {...form.register("reason")}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Nhập lý do chi tiết cho quyết định này..."
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-600">{form.formState.errors.reason.message}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-lg border border-border px-4 py-2 font-medium transition hover:bg-accent"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isPending ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            )}
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
            <ul className="list-disc pl-5 space-y-1">
              {action === "BAN_USER_PERMANENT" && (
                <li>Người dùng sẽ bị khóa vĩnh viễn</li>
              )}
              {action === "DELETE_CONTENT" && (
                <li>Nội dung sẽ bị xóa vĩnh viễn</li>
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
```

### 5. Update Report Detail Page

**File:** `src/app/dashboard/business/reports/[reportId]/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { use } from "react";
import { useReport, useHandleReport } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { HandleReportModal } from "@/components/reports/HandleReportModal";
import type { HandleReportForm } from "@/lib/schemas/admin-forms";

export default function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);
  const handleMutation = useHandleReport(reportId);

  const handleSubmit = (data: HandleReportForm) => {
    handleMutation.mutate(data, {
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
```

---

## Verification

After completing Phase 2, verify:

- [ ] "Xử lý báo cáo" button appears on pending reports
- [ ] Modal opens with 3 steps
- [ ] Step 1: Can select decision (Dismiss/Process/Escalate)
- [ ] Step 2: If Process, shows action dropdown
- [ ] Step 2: If Dismiss/Escalate, shows confirmation text
- [ ] Step 3: Reason textarea requires 10+ characters
- [ ] Destructive actions (Ban Permanent, Delete) show confirmation dialog
- [ ] Submitting updates report status
- [ ] Report list refreshes automatically
- [ ] Success/error alerts display correctly

---

## Files Modified

- ✏️ `src/lib/schemas/admin-forms.ts` - Add handleReportSchema
- ✏️ `src/lib/api/reports.ts` - Add handleReport function
- ➕ `src/components/common/ConfirmModal.tsx`
- ➕ `src/components/reports/HandleReportModal.tsx`
- ✏️ `src/app/dashboard/business/reports/[reportId]/page.tsx`

---

**Next:** [Phase 3 - User Statistics Dashboard](./phase-3-user-statistics.md)
