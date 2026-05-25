"use client";

import Link from "next/link";
import type { UserAdminView } from "@/types/api";
import { Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Props {
  users: UserAdminView[];
  showActions?: boolean;
}

export function UserTable({ users, showActions = true }: Props) {
  const columns: ColumnsType<UserAdminView> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => text ?? "—",
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: UserAdminView) => {
        if (record.deleted) return <Tag>Deleted</Tag>;
        if (record.locked) return <Tag color="warning">Locked</Tag>;
        return <Tag color="success">Active</Tag>;
      },
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
    },
    ...(showActions
      ? [
          {
            title: "",
            key: "action",
            align: "right" as const,
            render: (_: any, record: UserAdminView) => (
              <Link href={`/dashboard/system/users/${record.id}`}>
                <Button type="link" size="small">
                  Details
                </Button>
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table
      dataSource={users}
      columns={columns}
      rowKey="id"
      bordered={false}
      pagination={false}
      locale={{ emptyText: "No data" }}
    />
  );
}
