"use client";

import Link from "next/link";
import { useFeedbacks } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { normalizeItems } from "@/lib/list-utils";
import type { FeedbackItem } from "@/lib/api/feedbacks";
import { Table, Tag, Typography, Button } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

export default function BusinessFeedbacksPage() {
  const { data, isLoading, error } = useFeedbacks();
  const list = normalizeItems<FeedbackItem>(data as any);
  const err = error as Error | null;

  const columns: ColumnsType<FeedbackItem> = [
    {
      title: "Tiêu đề",
      key: "title",
      render: (_, f) => <Typography.Text strong>{f.title || `Feedback #${f.id.split("-")[0]}`}</Typography.Text>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (val) => <Tag>{val || "N/A"}</Tag>,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (val) => <Tag color="gold">⭐ {val || 0}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        if (status === "RESOLVED") color = "success";
        else if (status === "REJECTED") color = "error";
        return <Tag color={color}>{status || "PENDING"}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, f) => (
        <Link href={`/dashboard/business/feedbacks/${f.id}`}>
          <Button type="link" size="small">Chi tiết</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Title level={4} style={{ margin: 0 }}>Phản hồi người dùng</Title>
      <QueryState isLoading={isLoading} error={err}>
        <Table<FeedbackItem>
          dataSource={list}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </QueryState>
    </div>
  );
}
