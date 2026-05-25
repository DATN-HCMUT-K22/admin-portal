"use client";

import { useState } from "react";
import Link from "next/link";
import { useModerationActions } from "@/hooks/use-admin-queries";
import { Table, Select, Typography, Tag, Space, Input } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { Search } = Input;

export default function ModerationHistoryPage() {
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const { data, isLoading, error } = useModerationActions({
    page,
    pageSize: 20,
    actionType: actionType || undefined,
    userId: userId || undefined,
  });

  const list = data?.content || [];
  const err = error as Error | null;

  const columns: ColumnsType<any> = [
    {
      title: "Người dùng bị phạt",
      key: "user",
      render: (_, item) => (
        <Link href={`/dashboard/system/users/${item.moderated_user?.id}`}>
          <Typography.Link>
            {item.moderated_user?.username || item.moderated_user?.id || "N/A"}
          </Typography.Link>
        </Link>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action_type",
      key: "action_type",
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
      render: (_, item) => item.admin?.username || "-",
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (val) => new Date(val).toLocaleString("vi-VN"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={4} style={{ margin: 0 }}>Lịch sử kiểm duyệt</Title>
          <Text type="secondary">Theo dõi các hành động xử lý vi phạm</Text>
        </div>
        <Space size="middle" wrap>
          <Search
            placeholder="Tìm theo User ID..."
            allowClear
            onSearch={(value) => {
              setUserId(value);
              setPage(1);
            }}
            style={{ width: 250 }}
          />
          <Select
            value={actionType}
            onChange={(val) => {
              setActionType(val);
              setPage(1);
            }}
            style={{ width: 250 }}
            options={[
              { value: "", label: "Tất cả hành động" },
              { value: "WARN_USER", label: "WARN_USER (Cảnh cáo)" },
              { value: "BAN_USER", label: "BAN_USER (Khóa)" },
              { value: "DELETE_POST", label: "DELETE_POST (Xóa bài)" },
            ]}
          />
        </Space>
      </div>

      <Table
        loading={isLoading}
        dataSource={list}
        columns={columns}
        rowKey="id"
        pagination={{
          current: data?.pageable?.pageNumber !== undefined ? data.pageable.pageNumber + 1 : page,
          pageSize: 20,
          total: data?.totalElements || 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
        locale={{
          emptyText: err?.message?.includes("404") || err?.message?.includes("not found")
            ? "Tính năng đang được phát triển (API trả về 404)." 
            : "Không có dữ liệu kiểm duyệt."
        }}
      />
    </div>
  );
}
