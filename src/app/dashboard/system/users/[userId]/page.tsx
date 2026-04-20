"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUpdateUserRoles,
  useUpdateUserStatus,
  useUser,
} from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { userRolesSchema, userStatusSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";

type StatusForm = z.infer<typeof userStatusSchema>;
type RolesForm = z.infer<typeof userRolesSchema>;

export default function UserDetailPage() {
  const params = useParams();
  const userId = String(params.userId ?? "");

  const { data: user, isLoading, error } = useUser(userId);
  const statusMut = useUpdateUserStatus(userId);
  const rolesMut = useUpdateUserRoles(userId);

  const statusForm = useForm<StatusForm>({
    resolver: zodResolver(userStatusSchema),
    values: user ? { isLocked: user.isLocked } : { isLocked: false },
  });

  const rolesForm = useForm<RolesForm>({
    resolver: zodResolver(userRolesSchema),
    values: {
      roles: user?.roles?.map((r) => r.name).join(", ") ?? "",
    },
  });

  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-xl font-semibold">Chi tiết người dùng</h1>
      <QueryState isLoading={isLoading} error={err}>
        {user && (
          <>
            <dl className="grid gap-2 rounded-xl border border-border p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-mono text-xs">{user.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Username</dt>
                <dd>{user.username}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Họ tên</dt>
                <dd>{user.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Credits</dt>
                <dd>{user.credits}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Đã xóa</dt>
                <dd>{user.isDeleted ? "Có" : "Không"}</dd>
              </div>
            </dl>

            <section>
              <h2 className="mb-3 font-medium">Khóa / mở khóa</h2>
              <form
                className="flex flex-wrap items-end gap-4"
                onSubmit={statusForm.handleSubmit((v) =>
                  statusMut.mutateAsync(v).catch(() => undefined)
                )}
              >
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...statusForm.register("isLocked")}
                  />
                  Đang khóa
                </label>
                <button
                  type="submit"
                  disabled={statusMut.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                >
                  {statusMut.isPending ? "Đang gửi…" : "Cập nhật trạng thái"}
                </button>
                {statusMut.isError && (
                  <span className="text-sm text-destructive">
                    {(statusMut.error as Error).message}
                  </span>
                )}
                {statusMut.isSuccess && (
                  <span className="text-sm text-primary">Đã lưu.</span>
                )}
              </form>
            </section>

            <section>
              <h2 className="mb-3 font-medium">Gán role</h2>
              <form
                className="space-y-3"
                onSubmit={rolesForm.handleSubmit((v) =>
                  rolesMut.mutateAsync({
                    roles: v.roles
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                )}
              >
                <input
                  {...rolesForm.register("roles")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="ADMIN, MODERATOR"
                />
                {rolesForm.formState.errors.roles && (
                  <p className="text-sm text-destructive">
                    {rolesForm.formState.errors.roles.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={rolesMut.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                >
                  {rolesMut.isPending ? "Đang gửi…" : "Cập nhật role"}
                </button>
                {rolesMut.isError && (
                  <p className="text-sm text-destructive">
                    {(rolesMut.error as Error).message}
                  </p>
                )}
              </form>
            </section>
          </>
        )}
      </QueryState>
    </div>
  );
}
