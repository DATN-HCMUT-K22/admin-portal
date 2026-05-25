"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHandleReport, useReport } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { handleReportSchema, type HandleReportForm } from "@/lib/schemas/admin-forms";
import { Card, Descriptions, Tag, Button, Input, Form, Typography, Space, Modal, Alert, Row, Col, Result } from "antd";
import { ExclamationCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = String(params.reportId ?? "");

  const [selectedAction, setSelectedAction] = useState<HandleReportForm['action'] | null>(null);

  const { data: report, isLoading, error } = useReport(reportId);
  const handleMutation = useHandleReport(reportId);

  const form = useForm<HandleReportForm>({
    resolver: zodResolver(handleReportSchema),
  });

  const onActionClick = (action: HandleReportForm['action']) => {
    setSelectedAction(action);
    form.setValue('action', action);
    form.clearErrors('action');
  };

  const onSubmit = (data: HandleReportForm) => {
    const getActionLabel = (action: string) => {
      const labels = {
        DISMISS: 'Bỏ qua',
        WARN_USER: 'Cảnh báo',
        DELETE_CONTENT: 'Xóa nội dung',
        BAN_USER_TEMPORARY: 'Ban tạm thời',
      };
      return labels[action as keyof typeof labels] || action;
    };

    const getConfirmMessage = () => {
      const messages = {
        DISMISS: 'Bỏ qua báo cáo này. Không có hành động nào được thực hiện.',
        WARN_USER: 'Cảnh báo người dùng vi phạm. Hành động này sẽ được ghi lại.',
        DELETE_CONTENT: 'Xóa nội dung vi phạm. Hành động này không thể hoàn tác.',
        BAN_USER_TEMPORARY: `Ban tạm thời người dùng trong ${data.banDays || 0} ngày.`,
      };
      return messages[data.action];
    };

    confirm({
      title: `Xác nhận ${getActionLabel(data.action)}`,
      icon: <ExclamationCircleOutlined />,
      content: getConfirmMessage(),
      okText: 'Xác nhận',
      okType: data.action === 'DELETE_CONTENT' || data.action === 'BAN_USER_TEMPORARY' ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk() {
        const payload: any = {
          status: data.action === 'DISMISS' ? 'DISMISSED' : 'PROCESSED',
          description: data.reason || '',
        };

        if (data.action !== 'DISMISS' && report?.reported_user?.id) {
          payload.moderation_action = {
            user_id: report.reported_user.id,
            actionType: data.action,
            note: data.reason || '',
          };
          payload.feedback_content = "Cảm ơn bạn đã báo cáo. Chúng tôi đã xử lý vi phạm.";
        } else if (data.action === 'DISMISS') {
          payload.feedback_content = "Cảm ơn bạn đã báo cáo. Chúng tôi đã xem xét và không thấy vi phạm.";
        }

        handleMutation.mutate(
          payload,
          {
            onSuccess: () => {
              router.push('/dashboard/moderation/reports');
            },
            onError: (e) => {
              console.error('Handle report error:', e);
            },
          }
        );
      },
    });
  };

  const err = error as Error | null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Title level={4} style={{ margin: 0 }}>Chi tiết báo cáo</Title>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/dashboard/moderation/reports')}
        >
          Quay lại
        </Button>
      </div>

      <QueryState isLoading={isLoading} error={err}>
        {report && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">ID báo cáo: </Text>
                <Text code>{report.id}</Text>
                <Tag 
                  color={
                    report.status === 'PENDING' ? 'warning' :
                    report.status === 'PROCESSED' ? 'success' : 'default'
                  }
                  style={{ marginLeft: 8 }}
                >
                  {report.status}
                </Tag>
              </div>

              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Người báo cáo">
                  <Text strong>@{report.reporter?.username || report.reportedBy}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  {report.created_at ? new Date(report.created_at).toLocaleString('vi-VN') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Loại vi phạm">
                  {report.reason}
                </Descriptions.Item>
                <Descriptions.Item label="Loại nội dung">
                  {report.reportedEntityType}
                </Descriptions.Item>
                {report.description && (
                  <Descriptions.Item label="Mô tả" span={2}>
                    {report.description}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Nội dung bị báo cáo</Text>
                <Paragraph style={{ margin: 0 }}>
                  {report.reported_content_text || 'Không có nội dung text.'}
                </Paragraph>
                {report.reported_media_url && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Media đính kèm: </Text>
                    <a href={report.reported_media_url} target="_blank" rel="noopener noreferrer">Xem media</a>
                  </div>
                )}
                {report.reported_user && (
                   <div style={{ marginTop: 8 }}>
                     <Text type="secondary">Người bị báo cáo: </Text>
                     <Text strong>@{report.reported_user.username}</Text>
                   </div>
                )}
              </div>
            </Card>

            {report.status === 'PENDING' && (
              <Card title="Xử lý báo cáo">
                <Form layout="vertical" onFinish={form.handleSubmit(onSubmit)}>
                  <Form.Item 
                    validateStatus={form.formState.errors.action ? 'error' : ''}
                    help={form.formState.errors.action?.message}
                  >
                    <Row gutter={[12, 12]}>
                      {[
                        { key: 'DISMISS', icon: '❌', label: 'Bỏ qua', color: 'default' },
                        { key: 'WARN_USER', icon: '⚠️', label: 'Cảnh báo', color: 'warning' },
                        { key: 'DELETE_CONTENT', icon: '🗑️', label: 'Xóa nội dung', color: 'danger' },
                        { key: 'BAN_USER_TEMPORARY', icon: '🚫', label: 'Ban tạm thời', color: 'danger' },
                      ].map((act) => (
                        <Col span={12} md={6} key={act.key}>
                          <Card 
                            hoverable
                            onClick={() => onActionClick(act.key as HandleReportForm['action'])}
                            style={{ 
                              textAlign: 'center', 
                              borderColor: selectedAction === act.key ? '#1890ff' : undefined,
                              borderWidth: selectedAction === act.key ? 2 : 1,
                              backgroundColor: selectedAction === act.key ? '#e6f7ff' : undefined
                            }}
                            styles={{ body: { padding: 16 } }}
                          >
                            <div style={{ fontSize: 24, marginBottom: 8 }}>{act.icon}</div>
                            <Text strong>{act.label}</Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Form.Item>

                  {selectedAction === 'BAN_USER_TEMPORARY' && (
                    <Form.Item 
                      label="Số ngày ban (1-30)"
                      validateStatus={form.formState.errors.banDays ? 'error' : ''}
                      help={form.formState.errors.banDays?.message}
                    >
                      <Controller
                        name="banDays"
                        control={form.control}
                        render={({ field }) => (
                          <Input 
                            type="number" 
                            min={1} 
                            max={30} 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                            style={{ maxWidth: 200 }} 
                          />
                        )}
                      />
                    </Form.Item>
                  )}

                  <Form.Item 
                    label={<>Lý do chi tiết <span style={{ color: 'red', marginLeft: 4 }}>*</span></>}
                    validateStatus={form.formState.errors.reason ? 'error' : ''}
                    help={form.formState.errors.reason?.message}
                  >
                    <Controller
                      name="reason"
                      control={form.control}
                      render={({ field }) => (
                        <Input.TextArea 
                          {...field} 
                          rows={4} 
                          placeholder="Nhập lý do chi tiết cho quyết định này (tối thiểu 10 ký tự)" 
                        />
                      )}
                    />
                  </Form.Item>

                  {handleMutation.isError && (
                    <Form.Item>
                      <Alert message={(handleMutation.error as Error).message} type="error" showIcon />
                    </Form.Item>
                  )}

                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Space>
                      <Button onClick={() => router.push('/dashboard/moderation/reports')}>Hủy</Button>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        disabled={!selectedAction}
                        loading={handleMutation.isPending}
                      >
                        Xác nhận xử lý
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            )}

            {report.status !== 'PENDING' && (
              <Card>
                <Result
                  status="info"
                  title="Báo cáo này đã được xử lý"
                  subTitle={
                    <Space direction="vertical">
                      {report.updated_at && <Text>Cập nhật lần cuối vào lúc: {new Date(report.updated_at).toLocaleString('vi-VN')}</Text>}
                    </Space>
                  }
                />
              </Card>
            )}
          </Space>
        )}
      </QueryState>
    </div>
  );
}
