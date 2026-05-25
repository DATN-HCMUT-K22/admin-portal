"use client";

import { useState } from "react";
import type { ActivityLog } from "@/types/api";
import { LogDetailModal } from "./LogDetailModal";
import { Table, Tag, Avatar, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Props {
  logs: ActivityLog[];
  totalElements?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  /** Ẩn cột "Người dùng" khi đang xem log của 1 user cụ thể */
  hideUser?: boolean;
}

const ACTION_BADGE_COLOR: Record<string, string> = {
  CREATED: "success",
  UPDATED: "processing",
  DELETED: "error",
  LIKED: "magenta",
  JOINED: "purple",
  LOGIN: "cyan",
  LOGOUT: "default",
  SENT: "orange",
};

function actionBadgeColor(action: string): string {
  const verb = action.split("_").pop() ?? "";
  return ACTION_BADGE_COLOR[verb] ?? "default";
}

export function LogTable({
  logs,
  totalElements = 0,
  page = 1,
  onPageChange,
  hideUser = false,
}: Props) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const columns: ColumnsType<ActivityLog> = [
    {
      title: "Time",
      dataIndex: "created_at",
      key: "time",
      render: (val) => <span className="text-xs text-muted-foreground">{new Date(val).toLocaleString("en-US")}</span>,
    },
    ...(hideUser ? [] : [
      {
        title: "User",
        key: "user",
        render: (_: any, record: ActivityLog) => (
          <Space>
            {record.user.avatarUrl ? (
              <Avatar src={record.user.avatarUrl} size="small" />
            ) : (
              <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                {record.user.username[0]?.toUpperCase()}
              </Avatar>
            )}
            <span className="font-medium">{record.user.username}</span>
          </Space>
        ),
      }
    ]),
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (val) => (
        <Tag color={actionBadgeColor(val)}>
          {val}
        </Tag>
      ),
    },
    {
      title: "Entity",
      key: "entity",
      render: (_: any, record: ActivityLog) => {
        if (record.entity_type) {
          return (
            <Space size="small">
              <span className="font-medium">{record.entity_type}</span>
              {record.entity_id && (
                <span className="text-muted-foreground text-xs">#{record.entity_id.slice(0, 8)}</span>
              )}
            </Space>
          );
        }
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      title: "IP",
      dataIndex: "ip_address",
      key: "ip",
      render: (val) => <span className="font-mono text-xs text-muted-foreground">{val ?? "—"}</span>,
    },
    {
      title: "Action",
      key: "details",
      align: "right",
      render: (_: any, record: ActivityLog) => (
        <Button type="link" size="small" onClick={() => setSelectedLog(record)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={logs}
        columns={columns}
        rowKey="id"
        bordered={false}
        pagination={
          onPageChange
            ? {
                current: page,
                pageSize: 20,
                total: totalElements,
                onChange: onPageChange,
                showSizeChanger: false,
              }
            : false
        }
      />
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
