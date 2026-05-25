"use client";

import { useUsers } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserTable } from "@/components/users/UserTable";
import type { UserAdminView } from "@/types/api";
import { Typography } from "antd";

const { Title, Text } = Typography;

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
      <div>
        <Title level={4} style={{ margin: 0 }}>Danh sách người dùng</Title>
        <Text type="secondary">Chế độ xem chỉ đọc</Text>
      </div>

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <UserTable users={users} showActions={false} />
      </QueryState>
    </div>
  );
}
