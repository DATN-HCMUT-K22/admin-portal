import type { ActivityLog } from "@/types/api";
import { Modal, Descriptions, Avatar, Space, Typography, Tag } from "antd";

const { Text } = Typography;

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
}

function parseMetadata(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function LogDetailModal({ log, onClose }: Props) {
  if (!log) return null;

  const metadata = parseMetadata(log.metadata);

  return (
    <Modal
      title="Chi tiết Activity Log"
      open={!!log}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 16 }}>
        <Space align="center" size="middle" style={{ padding: "12px 16px", background: "#f5f5f5", borderRadius: 8, width: "100%" }}>
          {log.user.avatarUrl ? (
            <Avatar src={log.user.avatarUrl} size="large" />
          ) : (
            <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
              {log.user.username[0]?.toUpperCase()}
            </Avatar>
          )}
          <div>
            <Text strong style={{ display: "block" }}>{log.user.username}</Text>
            {log.user.fullName && <Text type="secondary">{log.user.fullName}</Text>}
          </div>
        </Space>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="ID Log" span={2}>
            <Text code>{log.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Hành động">
            <Tag color="blue">{log.action}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian">
            {new Date(log.created_at).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="IP Address" span={2}>
            <Text code>{log.ip_address ?? "—"}</Text>
          </Descriptions.Item>
          {log.entity_type && (
            <Descriptions.Item label="Loại đối tượng">
              {log.entity_type}
            </Descriptions.Item>
          )}
          {log.entity_id && (
            <Descriptions.Item label="ID đối tượng">
              <Text code>{log.entity_id}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        {metadata && (
          <div>
            <Text strong type="secondary" style={{ display: "block", marginBottom: 8 }}>
              Metadata
            </Text>
            <pre style={{ margin: 0, padding: 16, background: "#f5f5f5", borderRadius: 8, overflowX: "auto", fontSize: 12 }}>
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )}
      </Space>
    </Modal>
  );
}
