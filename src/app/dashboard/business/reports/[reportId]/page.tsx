"use client";

import { useState } from "react";
import { use } from "react";
import { useReport, useHandleReport } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import type { HandleReportForm } from "@/lib/schemas/admin-forms";
import type { HandleReportRequest } from "@/types/api";
import { HandleReportModal } from "@/components/reports/HandleReportModal";
import { Card, Descriptions, Tag, Typography, Button, Space } from "antd";

const { Title, Text, Paragraph } = Typography;

export default function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: report, isLoading, error } = useReport(reportId);
  const handleMutation = useHandleReport(reportId);

  const handleSubmit = (data: HandleReportForm) => {
    const payload: HandleReportRequest = {
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

    handleMutation.mutate(payload, {
      onSuccess: () => {
        setModalOpen(false);
      },
      onError: (err) => {
        // error handled by mutation
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={4} style={{ margin: 0 }}>Chi tiết báo cáo</Title>
        {report && report.status === "PENDING" && (
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Xử lý báo cáo
          </Button>
        )}
      </div>

      <QueryState isLoading={isLoading} error={error as Error | null}>
        {report && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Báo cáo: </Text>
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
                  <Text strong>@{report.reporter.username}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                  {new Date(report.created_at).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Loại vi phạm">
                  {report.reason}
                </Descriptions.Item>
                <Descriptions.Item label="Loại nội dung">
                  {report.reportedEntityType}
                </Descriptions.Item>
                {report.description && (
                  <Descriptions.Item label="Mô tả báo cáo" span={2}>
                    {report.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {report.reported_content_text && (
              <Card title="Nội dung bị báo cáo">
                <Paragraph style={{ margin: 0, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                  {report.reported_content_text}
                </Paragraph>
              </Card>
            )}
          </Space>
        )}
      </QueryState>

      <HandleReportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isPending={handleMutation.isPending}
      />
    </div>
  );
}
