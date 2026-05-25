"use client";

import Link from "next/link";
import { useReports } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { normalizeItems } from "@/lib/list-utils";
import type { ReportDetail } from "@/types/api";
import { Table, Tag, Typography, Button } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

export default function ReportsPage() {
  const { data, isLoading, error } = useReports();
  const list = normalizeItems<ReportDetail>(data as any);
  const err = error as Error | null;

  const columns: ColumnsType<ReportDetail> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Typography.Text code>{text.split("-")[0]}...</Typography.Text>,
    },
    {
      title: "Loại vi phạm",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Loại nội dung",
      dataIndex: "reportedEntityType",
      key: "reportedEntityType",
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
        <Link href={`/dashboard/moderation/reports/${record.id}`}>
          <Button type="link" size="small">
            Xử lý
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Title level={4} style={{ margin: 0 }}>Báo cáo vi phạm</Title>
      <QueryState isLoading={isLoading} error={err}>
        <Table<ReportDetail>
          dataSource={list}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </QueryState>
    </div>
  );
}
