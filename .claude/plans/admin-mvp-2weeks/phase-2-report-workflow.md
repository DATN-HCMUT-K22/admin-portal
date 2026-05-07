# Phase 2: Enhanced Report Handling Workflow

**Timeline:** Days 3-4 (2 days)  
**Priority:** HIGH  
**Files:** `/dashboard/moderation/reports/[reportId]/page.tsx`, `src/lib/schemas/admin-forms.ts`

---

## Current State

**Existing:** Basic form with status input + description textarea  
**Problem:** No decision tree, no action buttons, not user-friendly

---

## Goal: Simplified 4-Action Workflow

```
Report Detail Display
├─ Reporter: @user123
├─ Reported: Post #456 "content preview..."
├─ Violation Type: SPAM
├─ Status: PENDING
└─ Created: 2h ago

Action Buttons:
┌──────────┬──────────┬──────────┬───────────┐
│ Dismiss  │ Warning  │ Delete   │ Ban User  │
└──────────┴──────────┴──────────┴───────────┘
     ↓          ↓          ↓           ↓
  (reason)   (reason)   (reason)  (days+reason)
```

---

## Step 1: Update Schema

**File:** `src/lib/schemas/admin-forms.ts`

```typescript
export const handleReportSchema = z.object({
  action: z.enum(['DISMISS', 'WARN_USER', 'DELETE_CONTENT', 'BAN_USER_TEMPORARY']),
  reason: z.string().min(10, 'Lý do phải có ít nhất 10 ký tự'),
  banDays: z.number().min(1).max(30).optional(),
}).refine(
  (data) => data.action !== 'BAN_USER_TEMPORARY' || data.banDays,
  { message: 'Phải nhập số ngày ban', path: ['banDays'] }
);

export type HandleReportForm = z.infer<typeof handleReportSchema>;
```

---

## Step 2: Redesign Page Component

**File:** `src/app/dashboard/moderation/reports/[reportId]/page.tsx`

```tsx
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
  
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);
  const handleMutation = useHandleReport(reportId);

  const form = useForm<HandleReportForm>({
    resolver: zodResolver(handleReportSchema),
  });

  const onActionClick = (action: HandleReportForm['action']) => {
    setSelectedAction(action);
    form.setValue('action', action);
  };

  const onSubmit = (data: HandleReportForm) => {
    setShowConfirm(true);
  };

  const onConfirm = () => {
    const data = form.getValues();
    handleMutation.mutate(
      { status: data.action === 'DISMISS' ? 'DISMISSED' : 'PROCESSED', description: data.reason },
      {
        onSuccess: () => {
          alert('Đã xử lý báo cáo');
          router.push('/dashboard/moderation/reports');
        },
        onError: (e) => alert((e as Error).message),
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Chi tiết báo cáo</h1>

      <QueryState isLoading={isLoading} error={error as Error | null}>
        {report && (
          <div className="space-y-6">
            {/* Report Detail Card */}
            <div className="rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID: {report.id}</span>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  {report.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người báo cáo</p>
                <p className="font-medium">@{report.reporter.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loại vi phạm</p>
                <p className="font-medium">{report.violationType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nội dung bị báo cáo</p>
                <p className="text-sm">{report.reportedEntity.content || 'N/A'}</p>
              </div>
              {report.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Mô tả</p>
                  <p className="text-sm">{report.description}</p>
                </div>
              )}
            </div>

            {/* Action Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h2 className="font-medium">Xử lý báo cáo</h2>
              
              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <button
                  type="button"
                  onClick={() => onActionClick('DISMISS')}
                  className={`rounded-lg border-2 p-4 text-center transition ${
                    selectedAction === 'DISMISS'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-lg">❌</div>
                  <div className="mt-1 text-sm font-medium">Bỏ qua</div>
                </button>

                <button
                  type="button"
                  onClick={() => onActionClick('WARN_USER')}
                  className={`rounded-lg border-2 p-4 text-center transition ${
                    selectedAction === 'WARN_USER'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-border hover:border-amber-300'
                  }`}
                >
                  <div className="text-lg">⚠️</div>
                  <div className="mt-1 text-sm font-medium">Cảnh báo</div>
                </button>

                <button
                  type="button"
                  onClick={() => onActionClick('DELETE_CONTENT')}
                  className={`rounded-lg border-2 p-4 text-center transition ${
                    selectedAction === 'DELETE_CONTENT'
                      ? 'border-red-500 bg-red-50'
                      : 'border-border hover:border-red-300'
                  }`}
                >
                  <div className="text-lg">🗑️</div>
                  <div className="mt-1 text-sm font-medium">Xóa nội dung</div>
                </button>

                <button
                  type="button"
                  onClick={() => onActionClick('BAN_USER_TEMPORARY')}
                  className={`rounded-lg border-2 p-4 text-center transition ${
                    selectedAction === 'BAN_USER_TEMPORARY'
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border hover:border-destructive/50'
                  }`}
                >
                  <div className="text-lg">🚫</div>
                  <div className="mt-1 text-sm font-medium">Cấm tài khoản</div>
                </button>
              </div>

              {/* Conditional: Ban Days Input */}
              {selectedAction === 'BAN_USER_TEMPORARY' && (
                <div>
                  <label className="text-sm font-medium">Số ngày cấm (1-30)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    {...form.register('banDays', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                  {form.formState.errors.banDays && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.banDays.message}
                    </p>
                  )}
                </div>
              )}

              {/* Reason Textarea */}
              {selectedAction && (
                <div>
                  <label className="text-sm font-medium">Lý do *</label>
                  <textarea
                    {...form.register('reason')}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
                    placeholder="Giải thích lý do xử lý..."
                  />
                  {form.formState.errors.reason && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.reason.message}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {selectedAction && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border border-border px-4 py-2 text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={handleMutation.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                  >
                    {handleMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </QueryState>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          title="Xác nhận xử lý"
          message={`Bạn có chắc muốn ${
            selectedAction === 'DISMISS'
              ? 'bỏ qua'
              : selectedAction === 'WARN_USER'
              ? 'cảnh báo người dùng'
              : selectedAction === 'DELETE_CONTENT'
              ? 'xóa nội dung'
              : 'cấm tài khoản'
          }?`}
          onConfirm={() => {
            setShowConfirm(false);
            onConfirm();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
```

---

## Step 3: Test Workflow

1. Navigate to `/dashboard/moderation/reports`
2. Click "Xử lý" on any report
3. Click each action button → verify correct styling
4. Fill reason → click "Xác nhận"
5. Verify confirmation modal appears
6. Confirm → verify API called
7. Check redirect to report list
8. Verify report status updated

---

## Success Criteria

- [ ] 4 action buttons render with correct icons/colors
- [ ] Ban days input shows only for BAN_USER_TEMPORARY
- [ ] Form validation works (reason min 10 chars, banDays 1-30)
- [ ] Confirmation modal prevents accidental actions
- [ ] Success redirects to report list
- [ ] Report list shows updated status
