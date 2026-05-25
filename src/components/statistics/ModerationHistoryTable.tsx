import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ModerationAction {
  id: string;
  actionType: string;
  reason: string;
  handledBy: string;
  createdAt: string;
}

interface Props {
  history: ModerationAction[];
}

export function ModerationHistoryTable({ history }: Props) {
  const columns: ColumnsType<ModerationAction> = [
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "time",
      render: (val) => new Date(val).toLocaleDateString("en-US"),
    },
    {
      title: "Action",
      dataIndex: "actionType",
      key: "action",
      render: (val) => {
        let color = "default";
        if (val === "BAN_USER") color = "error";
        else if (val === "WARN_USER") color = "warning";
        else if (val === "DELETE_POST") color = "magenta";
        
        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (val) => (
        <span className="text-muted-foreground">
          {val.length > 50 ? `${val.slice(0, 50)}...` : val}
        </span>
      ),
    },
    {
      title: "Handled By",
      dataIndex: "handledBy",
      key: "handledBy",
    },
  ];

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Moderation History</h3>
      <Table
        dataSource={history}
        columns={columns}
        rowKey="id"
        bordered={false}
        pagination={false}
        locale={{ emptyText: "No moderation actions yet" }}
      />
    </div>
  );
}
