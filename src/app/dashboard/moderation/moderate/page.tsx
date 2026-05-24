"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModerateUser } from "@/hooks/use-admin-queries";
import { moderateUserSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";

type Form = z.infer<typeof moderateUserSchema>;

export default function ModerateUserPage() {
  const mut = useModerateUser();
  const form = useForm<Form>({
    resolver: zodResolver(moderateUserSchema),
    defaultValues: {
      user_id: "",
      actionType: "WARN_USER",
      note: "",
    },
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Điều phối người dùng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cảnh báo hoặc khóa tài khoản người dùng (WARN_USER / BAN_USER).
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((v) =>
          mut.mutateAsync(v).catch(() => undefined)
        )}
      >
        <div>
          <label className="mb-1 block text-sm font-medium">User ID (UUID)</label>
          <input
            {...form.register("user_id")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          />
          {form.formState.errors.user_id && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.user_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Hành động</label>
          <select
            {...form.register("actionType")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="WARN_USER">WARN_USER</option>
            <option value="BAN_USER">BAN_USER</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú</label>
          <textarea
            {...form.register("note")}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          {form.formState.errors.note && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.note.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
        >
          {mut.isPending ? "Đang gửi…" : "Thực hiện"}
        </button>
        {mut.isError && (
          <p className="text-sm text-destructive">
            {(mut.error as Error).message}
          </p>
        )}
        {mut.isSuccess && (
          <p className="text-sm text-primary">Đã gửi yêu cầu.</p>
        )}
      </form>
    </div>
  );
}
