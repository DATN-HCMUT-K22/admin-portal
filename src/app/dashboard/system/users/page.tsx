"use client";

import { useState, useMemo } from "react";
import { useUsers } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserActivityLogDrawer } from "@/components/activity-logs/UserActivityLogDrawer";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { useAuth } from "@/providers/auth-provider";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import { Table, Input, Select, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UserResponse } from "@/types/api";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function UsersPage() {
  const { user } = useAuth();
  const isSystemAdmin = user?.roles?.some(r => r.name === "SYSTEM_ADMIN");

  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [drawerUser, setDrawerUser] = useState<{ id: string; username: string } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const q = useDebounce(searchInput, 400);

  const { data, isLoading, error } = useUsers(page, q || undefined);
  const list: UserResponse[] = data?.content ?? [];
  const err = error as Error | null;

  // Local filtering for status and role since API doesn't support them directly yet
  const filteredList = useMemo(() => {
    return list.filter((u) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "DELETED" && !u.deleted) return false;
        if (statusFilter === "LOCKED" && (u.deleted || !u.locked)) return false;
        if (statusFilter === "ACTIVE" && (u.deleted || u.locked)) return false;
      }
      if (roleFilter !== "ALL") {
        if (!u.roles.some((r) => r.name === roleFilter)) return false;
      }
      return true;
    });
  }, [list, statusFilter, roleFilter]);

  function handleSearch(val: string) {
    setSearchInput(val);
    setPage(1);
  }

  const columns: ColumnsType<UserResponse> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="text-muted-foreground">{text ?? "—"}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-xs text-muted-foreground">{text}</span>,
    },
    {
      title: "Roles",
      key: "roles",
      render: (_, record) => (
        <Space wrap>
          {record.roles.map((r) => {
            let color = "default";
            if (r.name === "SYSTEM_ADMIN") color = "volcano";
            if (r.name === "BUSINESS_ADMIN") color = "purple";
            return (
              <Tag color={color} key={r.name}>
                {r.name}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        if (record.deleted) return <Tag>Deleted</Tag>;
        if (record.locked) return <Tag color="warning">Locked</Tag>;
        return <Tag color="success">Active</Tag>;
      },
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      render: (val) => <span className="tabular-nums">{val}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          {isSystemAdmin && (
            <Button
              type="link"
              size="small"
              onClick={() => setDrawerUser({ id: record.id, username: record.username })}
            >
              Activity
            </Button>
          )}
          {isSystemAdmin && (
            <Link href={`/dashboard/system/users/${record.id}`}>
              <Button type="link" size="small">
                Details
              </Button>
            </Link>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          {data?.totalElements != null && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.totalElements.toLocaleString()} accounts
            </p>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          {isSystemAdmin && (
            <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create User
            </Button>
          )}
          <Select
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setPage(1); }}
            style={{ width: 150 }}
            options={[
              { value: "ALL", label: "All Roles" },
              { value: "SYSTEM_ADMIN", label: "System Admin" },
              { value: "BUSINESS_ADMIN", label: "Business Admin" },
              { value: "USER", label: "User" },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            style={{ width: 130 }}
            options={[
              { value: "ALL", label: "All Status" },
              { value: "ACTIVE", label: "Active" },
              { value: "LOCKED", label: "Locked" },
              { value: "DELETED", label: "Deleted" },
            ]}
          />
          <Input.Search
            placeholder="Search username or email..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        </div>
      </div>

      <QueryState isLoading={isLoading} error={err}>
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey="id"
          bordered={false}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.totalElements || 0,
            onChange: setPage,
            showSizeChanger: false,
          }}
        />
      </QueryState>

      {/* User Activity Log Drawer */}
      {drawerUser && (
        <UserActivityLogDrawer
          userId={drawerUser.id}
          username={drawerUser.username}
          onClose={() => setDrawerUser(null)}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
