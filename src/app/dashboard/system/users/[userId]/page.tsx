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
  useModerateUser,
  useUserModerationHistory,
} from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { ActivityLogTabs, getTabActions } from "@/components/activity-logs/ActivityLogTabs";
import { LogTable } from "@/components/activity-logs/LogTable";
import { userRolesSchema, userStatusSchema, moderateUserSchema } from "@/lib/schemas/admin-forms";
import type { z } from "zod";
import type { ActivityTabKey } from "@/types/api";
import { Table, Tag, Card, Typography, Switch, Select, Input, Avatar, Space, Descriptions, Button, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Controller } from "react-hook-form";
import { useAuth } from "@/providers/auth-provider";

const { Title, Text } = Typography;

type StatusForm = z.infer<typeof userStatusSchema>;
type RolesForm = z.infer<typeof userRolesSchema>;
type ModerationForm = z.infer<typeof moderateUserSchema>;

const ROLE_OPTIONS = ["USER", "BUSINESS_ADMIN", "SYSTEM_ADMIN"];

export default function UserDetailPage() {
  const params = useParams();
  const userId = String(params.userId ?? "");
  const { user: currentUser } = useAuth();
  const isSystemAdmin = currentUser?.roles?.some(r => r.name === "SYSTEM_ADMIN");
  const isBusinessAdmin = currentUser?.roles?.some(r => r.name === "BUSINESS_ADMIN");

  // ── User data ──
  const { data: user, isLoading, error } = useUser(userId);
  const statusMut = useUpdateUserStatus(userId);
  const rolesMut = useUpdateUserRoles(userId);
  const moderateMut = useModerateUser();

  // ── Moderation History ──
  const { data: modHistory, isLoading: modHistoryLoading } = useUserModerationHistory(userId);

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
    values: user ? { isLocked: user.locked } : { isLocked: false },
  });

  const rolesForm = useForm<RolesForm>({
    resolver: zodResolver(userRolesSchema),
    values: {
      roles: user?.roles?.map((r) => r.name).join(", ") ?? "",
    },
  });

  const modForm = useForm<ModerationForm>({
    resolver: zodResolver(moderateUserSchema),
    values: {
      user_id: userId,
      actionType: "WARN_USER",
      note: "",
    },
  });

  function handleTabChange(tab: ActivityTabKey) {
    setActiveTab(tab);
    setLogPage(1);
  }

  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Title level={3} style={{ margin: 0 }}>Chi tiết người dùng</Title>

      <QueryState isLoading={isLoading} error={err}>
        {user && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* ── Profile card ── */}
            <Card>
              <Space align="start" size="large">
                <Avatar src={user.avatarUrl} size={64} style={{ backgroundColor: "#1890ff" }}>
                  {!user.avatarUrl && user.username[0]?.toUpperCase()}
                </Avatar>
                <div>
                  <Title level={4} style={{ margin: 0 }}>{user.username}</Title>
                  {user.fullName && <Text type="secondary">{user.fullName}</Text>}
                  <br />
                  <Text type="secondary">{user.email}</Text>
                  
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {user.roles.map((r) => (
                      <Tag 
                        key={r.name} 
                        color={r.name === "SYSTEM_ADMIN" ? "red" : r.name === "BUSINESS_ADMIN" ? "purple" : "default"}
                      >
                        {r.name}
                      </Tag>
                    ))}
                    {user.locked && <Tag color="warning">Locked</Tag>}
                    {user.deleted && <Tag>Deleted</Tag>}
                  </div>
                </div>
              </Space>
              
              <Descriptions size="small" column={{ xs: 1, sm: 2 }} style={{ marginTop: 24 }}>
                <Descriptions.Item label="Credits">
                  <Text strong>{user.credits}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email xác thực">
                  {user.emailVerified ? "✅" : "❌"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* ── Lock / Unlock ── */}
            {isSystemAdmin && (
              <Card title="Trạng thái tài khoản" size="small">
                <form
                  className="flex items-center gap-4"
                  onSubmit={statusForm.handleSubmit((v) =>
                    statusMut.mutateAsync(v).catch(() => undefined)
                  )}
                >
                  <Space>
                    <Controller
                      name="isLocked"
                      control={statusForm.control}
                      render={({ field }) => (
                        <Switch 
                          checked={field.value} 
                          onChange={field.onChange} 
                        />
                      )}
                    />
                    <Text>Khóa tài khoản này</Text>
                  </Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={statusMut.isPending}
                  >
                    Cập nhật
                  </Button>
                  {statusMut.isError && (
                    <Text type="danger">
                      {(statusMut.error as Error).message}
                    </Text>
                  )}
                  {statusMut.isSuccess && (
                    <Text type="success">✓ Đã lưu</Text>
                  )}
                </form>
              </Card>
            )}

            {/* ── Roles ── */}
            {isSystemAdmin && (
              <Card title="Quản lý vai trò" size="small">
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
                  <Controller
                    name="roles"
                    control={rolesForm.control}
                    render={({ field }) => (
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Chọn vai trò"
                        value={field.value ? field.value.split(",").map(s => s.trim()).filter(Boolean) : []}
                        onChange={(vals) => field.onChange(vals.join(", "))}
                        options={ROLE_OPTIONS.map(r => ({ label: r, value: r }))}
                      />
                    )}
                  />
                  
                  {rolesForm.formState.errors.roles && (
                    <Text type="danger" style={{ display: 'block' }}>
                      {rolesForm.formState.errors.roles.message}
                    </Text>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={rolesMut.isPending}
                    >
                      Cập nhật vai trò
                    </Button>
                    {rolesMut.isError && (
                      <Text type="danger">
                        {(rolesMut.error as Error).message}
                      </Text>
                    )}
                    {rolesMut.isSuccess && (
                      <Text type="success">✓ Đã cập nhật</Text>
                    )}
                  </div>
                </form>
              </Card>
            )}

            {/* ── Moderation Section ── */}
            {isBusinessAdmin && (
              <Card 
                title="Kiểm duyệt người dùng" 
                size="small" 
                style={{ borderLeft: "4px solid #faad14" }}
              >
                <form
                  className="space-y-4"
                  onSubmit={modForm.handleSubmit((v) =>
                    moderateMut.mutateAsync(v).then(() => {
                      modForm.reset({ ...v, note: "" });
                    }).catch(() => undefined)
                  )}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Hành động</label>
                      <Controller
                        name="actionType"
                        control={modForm.control}
                        render={({ field }) => (
                          <Select
                            style={{ width: '100%' }}
                            value={field.value}
                            onChange={field.onChange}
                            options={[
                              { value: "WARN_USER", label: "Cảnh cáo (WARN_USER)" },
                              { value: "BAN_USER", label: "Khóa tài khoản (BAN_USER)" },
                            ]}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Lý do / Ghi chú</label>
                      <Controller
                        name="note"
                        control={modForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Nhập lý do kiểm duyệt..."
                          />
                        )}
                      />
                      {modForm.formState.errors.note && (
                        <Text type="danger" className="text-xs">
                          {modForm.formState.errors.note.message}
                        </Text>
                      )}
                    </div>
                  </div>
                  {modForm.formState.errors.user_id && (
                    <Text type="danger" className="text-xs block">
                      {modForm.formState.errors.user_id.message}
                    </Text>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      type="primary"
                      danger
                      htmlType="submit"
                      loading={moderateMut.isPending}
                    >
                      Thực hiện kiểm duyệt
                    </Button>
                    {moderateMut.isError && (
                      <Text type="danger">
                        {(moderateMut.error as Error).message}
                      </Text>
                    )}
                    {moderateMut.isSuccess && (
                      <Text type="success">✓ Đã xử lý kiểm duyệt thành công.</Text>
                    )}
                  </div>
                </form>

                {/* Moderation History Table */}
                <div className="mt-8">
                  <Title level={5}>Lịch sử kiểm duyệt của người dùng</Title>
                  <Table
                    loading={modHistoryLoading}
                    dataSource={modHistory || []}
                    rowKey="id"
                    pagination={false}
                    bordered={false}
                    locale={{ emptyText: "Chưa có lịch sử kiểm duyệt" }}
                    columns={[
                      {
                        title: "Hành động",
                        dataIndex: "action_type",
                        key: "action",
                        render: (val) => (
                          <Tag color={val === "BAN_USER" ? "error" : "warning"}>
                            {val}
                          </Tag>
                        ),
                      },
                      {
                        title: "Lý do",
                        dataIndex: "note",
                        key: "note",
                        render: (val) => val || "-",
                      },
                      {
                        title: "Người xử lý",
                        key: "admin",
                        render: (_, item: any) => item.admin?.username || "-",
                      },
                      {
                        title: "Thời gian",
                        dataIndex: "created_at",
                        key: "time",
                        render: (val) => new Date(val).toLocaleString("vi-VN"),
                      },
                    ]}
                  />
                </div>
              </Card>
            )}

            {/* ── Activity Log ── */}
            {isSystemAdmin && (
              <Card title="Nhật ký hoạt động" size="small">
                <div className="space-y-4">
                  <ActivityLogTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                  {logLoading ? (
                    <div className="flex h-32 items-center justify-center">
                      <Spin size="large" />
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
              </Card>
            )}
          </Space>
        )}
      </QueryState>
    </div>
  );
}
