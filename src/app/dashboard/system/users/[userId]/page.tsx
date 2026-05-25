"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUpdateUserRoles,
  useUpdateUserStatus,
  useUser,
  useUserActivityLogs,
} from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ActivityLogTabs, getTabActions } from "@/components/activity-logs/ActivityLogTabs";
import { LogTable } from "@/components/activity-logs/LogTable";
import { userRolesSchema, userStatusSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";
import type { ActivityTabKey } from "@/types/api";

type StatusForm = z.infer<typeof userStatusSchema>;
type RolesForm = z.infer<typeof userRolesSchema>;

const ROLE_OPTIONS = ["USER", "BUSINESS_ADMIN", "SYSTEM_ADMIN"];

export default function UserDetailPage() {
  const params = useParams();
  const userId = String(params.userId ?? "");

  // ── User data ──
  const { data: user, isLoading, error } = useUser(userId);
  const statusMut = useUpdateUserStatus(userId);
  const rolesMut = useUpdateUserRoles(userId);

  // ── Activity Log ──
  const [activeTab, setActiveTab] = useState<ActivityTabKey>("all");
  const [logPage, setLogPage] = useState(1);
  const actionFilter = getTabActions(activeTab);
  const { data: logData, isLoading: logLoading } = useUserActivityLogs(userId, {
    action: actionFilter,
    page: logPage,
    size: 20,
    sort: "createdAt,desc",
  });

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

  function handleTabChange(tab: ActivityTabKey) {
    setActiveTab(tab);
    setLogPage(1);
  }

  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-xl font-semibold">Chi tiết người dùng</h1>

      <QueryState isLoading={isLoading} error={err}>
        {user && (
          <>
            {/* ── Profile card ── */}
            <div className="flex items-start gap-5 rounded-xl border border-border p-5">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <p className="text-lg font-semibold">{user.username}</p>
                {user.fullName && (
                  <p className="text-muted-foreground">{user.fullName}</p>
                )}
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {user.roles.map((r) => (
                    <span
                      key={r.name}
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        r.name === "SYSTEM_ADMIN"
                          ? "bg-red-500/10 text-red-600"
                          : r.name === "BUSINESS_ADMIN"
                          ? "bg-violet-500/10 text-violet-600"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {r.name}
                    </span>
                  ))}
                  {user.isLocked && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
                      Đang khóa
                    </span>
                  )}
                  {user.isDeleted && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Đã xóa
                    </span>
                  )}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Credits</dt>
                <dd className="font-medium tabular-nums">{user.credits}</dd>
                <dt className="text-muted-foreground">Email xác thực</dt>
                <dd>{user.isEmailVerified ? "✅" : "❌"}</dd>
                <dt className="text-muted-foreground">Ngày tạo</dt>
                <dd className="text-xs">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </dd>
              </dl>
            </div>

            {/* ── Lock / Unlock ── */}
            <section className="rounded-xl border border-border p-5">
              <h2 className="mb-4 font-semibold">Khóa / Mở khóa tài khoản</h2>
              <form
                className="flex flex-wrap items-center gap-4"
                onSubmit={statusForm.handleSubmit((v) =>
                  statusMut.mutateAsync(v).catch(() => undefined)
                )}
              >
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    {...statusForm.register("isLocked")}
                  />
                  Khóa tài khoản này
                </label>
                <button
                  type="submit"
                  disabled={statusMut.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                >
                  {statusMut.isPending ? "Đang lưu…" : "Cập nhật"}
                </button>
                {statusMut.isError && (
                  <span className="text-sm text-destructive">
                    {(statusMut.error as Error).message}
                  </span>
                )}
                {statusMut.isSuccess && (
                  <span className="text-sm text-emerald-600">✓ Đã lưu</span>
                )}
              </form>
            </section>

            {/* ── Roles ── */}
            <section className="rounded-xl border border-border p-5">
              <h2 className="mb-4 font-semibold">Quản lý vai trò</h2>
              <form
                className="space-y-4"
                onSubmit={rolesForm.handleSubmit((v) =>
                  rolesMut.mutateAsync({
                    roles: v.roles
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                )}
              >
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const current = rolesForm
                      .watch("roles")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const active = current.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          const next = active
                            ? current.filter((r) => r !== role)
                            : [...current, role];
                          rolesForm.setValue("roles", next.join(", "));
                        }}
                        className={[
                          "rounded-full px-3 py-1 text-sm font-medium transition",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "border border-border hover:bg-accent",
                        ].join(" ")}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
                <input
                  {...rolesForm.register("roles")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="USER, BUSINESS_ADMIN, SYSTEM_ADMIN"
                />
                {rolesForm.formState.errors.roles && (
                  <p className="text-sm text-destructive">
                    {rolesForm.formState.errors.roles.message}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={rolesMut.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                  >
                    {rolesMut.isPending ? "Đang lưu…" : "Cập nhật vai trò"}
                  </button>
                  {rolesMut.isError && (
                    <p className="text-sm text-destructive">
                      {(rolesMut.error as Error).message}
                    </p>
                  )}
                  {rolesMut.isSuccess && (
                    <p className="text-sm text-emerald-600">✓ Đã cập nhật</p>
                  )}
                </div>
              </form>
            </section>

            {/* ── Activity Log ── */}
            <section className="rounded-xl border border-border p-5">
              <h2 className="mb-4 font-semibold">Nhật ký hoạt động</h2>
              <div className="space-y-4">
                <ActivityLogTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
                {logLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <LogTable
                    logs={logData?.content ?? []}
                    totalElements={logData?.totalElements}
                    page={logPage}
                    onPageChange={setLogPage}
                    hideUser
                  />
                )}
              </div>
            </section>
          </>
        )}
      </QueryState>
    </div>
  );
}
