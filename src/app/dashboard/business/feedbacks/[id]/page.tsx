"use client";

import { useParams } from "next/navigation";
import { useFeedback, useRespondToFeedback } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { Card, Descriptions, Tag, Form, Input, Select, Button, Typography, Alert, Space } from "antd";

const { Title, Text } = Typography;

export default function BusinessFeedbackDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  const { data, isLoading, error } = useFeedback(id);
  const respondMut = useRespondToFeedback(id);
  const err = error as Error | null;
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    try {
      await respondMut.mutateAsync(values);
    } catch {
      // Handled by mutation state
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Title level={4} style={{ margin: 0 }}>Chi tiết phản hồi</Title>
      
      <QueryState isLoading={isLoading} error={err}>
        {data && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card>
              <Descriptions title={data.title || "Không có tiêu đề"} bordered column={2} size="small">
                <Descriptions.Item label="Loại">
                  <Tag>{data.type || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                  <Tag color="gold">⭐ {data.rating || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={data.status === 'RESOLVED' ? 'success' : data.status === 'REJECTED' ? 'error' : 'blue'}>
                    {data.status || "PENDING"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Người gửi">
                  <Text code>{data.userId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung" span={2}>
                  {data.content || "Không có nội dung"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Phản hồi người dùng">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ status: "REPLIED", description: "" }}
              >
                <Form.Item label="Trạng thái cập nhật" name="status" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { value: "PENDING", label: "PENDING (Đang chờ)" },
                      { value: "REPLIED", label: "REPLIED (Đã trả lời)" },
                      { value: "RESOLVED", label: "RESOLVED (Đã giải quyết)" },
                      { value: "REJECTED", label: "REJECTED (Từ chối)" },
                    ]}
                  />
                </Form.Item>
                
                <Form.Item 
                  label="Nội dung trả lời" 
                  name="description" 
                  rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                >
                  <Input.TextArea rows={4} placeholder="Nhập nội dung phản hồi tới người dùng..." />
                </Form.Item>

                {respondMut.isError && (
                  <Form.Item>
                    <Alert message={(respondMut.error as Error).message} type="error" showIcon />
                  </Form.Item>
                )}
                {respondMut.isSuccess && (
                  <Form.Item>
                    <Alert message="Đã gửi phản hồi thành công" type="success" showIcon />
                  </Form.Item>
                )}

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" loading={respondMut.isPending}>
                    {respondMut.isPending ? "Đang gửi..." : "Gửi phản hồi"}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        )}
      </QueryState>
    </div>
  );
}
