"use client";

import { useState } from "react";
import { useReports } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import type { ContentType, ReportStatus, ReportDetail } from "@/types/api";
import { Table, Tag, Typography, Button, Select, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { normalizeItems } from "@/lib/list-utils";

const { Title } = Typography;

export default function ReportsPage() {
  const [filters, setFilters] = useState<{
    contentType?: ContentType;
    status?: ReportStatus;
  }>({});

  const { data, isLoading, error } = useReports(filters);
  const reports = normalizeItems<ReportDetail>(data as any);

  const columns: ColumnsType<ReportDetail> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Typography.Text code>{text.split("-")[0]}...</Typography.Text>,
    },
    {
      title: "Nội dung",
      dataIndex: "reportedEntityType",
      key: "reportedEntityType",
    },
    {
      title: "Vi phạm",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "PENDING") color = "warning";
        else if (status === "PROCESSED") color = "success";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (val) => new Date(val).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Link href={`/dashboard/business/reports/${record.id}`}>
          <Button type="link" size="small">
            Xử lý
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={4} style={{ margin: 0 }}>Quản lý báo cáo</Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          value={filters.status}
          onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
          style={{ width: 150 }}
          options={[
            { value: "PENDING", label: "Chờ xử lý" },
            { value: "PROCESSED", label: "Đã xử lý" },
            { value: "DISMISSED", label: "Bỏ qua" },
          ]}
        />
        <Select
          allowClear
          placeholder="Lọc loại nội dung"
          value={filters.contentType}
          onChange={(val) => setFilters(prev => ({ ...prev, contentType: val }))}
          style={{ width: 150 }}
          options={[
            { value: "POST", label: "Bài viết" },
            { value: "COMMENT", label: "Bình luận" },
            { value: "ITINERARY", label: "Lịch trình" },
            { value: "USER", label: "Người dùng" },
          ]}
        />
      </Space>

      <QueryState isLoading={isLoading} error={error as Error | null}>
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </QueryState>
    </div>
  );
}
