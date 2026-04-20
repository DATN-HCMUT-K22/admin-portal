"use client";

import { useUsers } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserTable } from "@/components/users/UserTable";
import type { UserAdminView } from "@/types/api";

function normalizeItems<T>(data: T[] | { items: T[] } | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.items || [];
}

export default function BusinessUsersPage() {
  const { data, isLoading, error } = useUsers(1);
  const users = normalizeItems(
    data as UserAdminView[] | { items: UserAdminView[] } | undefined
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Danh sách người dùng</h1>
      <p className="text-sm text-muted-foreground">Chế độ xem chỉ đọc</p>

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <UserTable users={users} showActions={false} />
      </QueryState>
    </div>
  );
}
