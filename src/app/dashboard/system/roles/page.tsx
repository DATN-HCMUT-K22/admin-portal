"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRole, usePermissions, useRoles } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { roleCreateSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";
import type { RoleWithPermissions } from "@/types/api";
import { normalizeItems } from "@/lib/list-utils";

type RoleForm = z.infer<typeof roleCreateSchema>;

export default function RolesPage() {
  const { data: roles, isLoading: loadingRoles, error: errRoles } = useRoles();
  const { data: perms, isLoading: loadingPerms, error: errPerms } =
    usePermissions();
  const createMut = useCreateRole();

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: "",
    },
  });

  const roleList = Array.isArray(roles) ? roles : [];
  const permList = Array.isArray(perms)
    ? (perms as (string | { name: string })[])
    : [];
  const permStrings = permList.map((p) =>
    typeof p === "string" ? p : (p as { name: string }).name
  );

  const loadError = (errRoles ?? errPerms) as Error | null;
  const loading = loadingRoles || loadingPerms;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Vai trò & quyền</h1>
      </div>

      <section>
        <h2 className="mb-3 font-medium">Tạo role</h2>
        <form
          className="max-w-lg space-y-3"
          onSubmit={form.handleSubmit((v) =>
            createMut.mutateAsync({
              name: v.name,
              description: v.description,
              permissions: v.permissions
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          )}
        >
          <input
            {...form.register("name")}
            placeholder="Tên role"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            {...form.register("description")}
            placeholder="Mô tả"
            rows={2}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            {...form.register("permissions")}
            placeholder="permission1, permission2"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
          {form.formState.errors.permissions && (
            <p className="text-sm text-destructive">
              {form.formState.errors.permissions.message}
            </p>
          )}
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            {createMut.isPending ? "Đang tạo…" : "Tạo role"}
          </button>
          {createMut.isError && (
            <p className="text-sm text-destructive">
              {(createMut.error as Error).message}
            </p>
          )}
          {createMut.isSuccess && (
            <p className="text-sm text-primary">Đã tạo.</p>
          )}
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-medium">Danh sách permission</h2>
        <QueryState isLoading={loading} error={loadError}>
          <ul className="flex flex-wrap gap-2">
            {permStrings.map((p) => (
              <li
                key={p}
                className="rounded-md bg-muted px-2 py-1 font-mono text-xs"
              >
                {p}
              </li>
            ))}
          </ul>
          {permStrings.length === 0 && (
            <p className="text-sm text-muted-foreground">Không có dữ liệu.</p>
          )}
        </QueryState>
      </section>

      <section>
        <h2 className="mb-3 font-medium">Các role hiện có</h2>
        <QueryState isLoading={loadingRoles} error={errRoles as Error | null}>
          <ul className="space-y-3">
            {roleList.map((r: RoleWithPermissions) => (
              <li
                key={r.name + (r.id ?? "")}
                className="rounded-xl border border-border p-4"
              >
                <p className="font-medium">{r.name}</p>
                {r.description && (
                  <p className="text-sm text-muted-foreground">
                    {r.description}
                  </p>
                )}
                {Array.isArray(r.permissions) && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {r.permissions.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </QueryState>
      </section>
    </div>
  );
}
