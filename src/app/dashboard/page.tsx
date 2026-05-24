"use client";

import Link from "next/link";
import { Card, Row, Col, Typography, Statistic, Spin, Alert, Space } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  WarningOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useReportStatistics,
  useAggregateUserStatistics,
  useContentStatistics,
  useSystemHealth,
} from "@/hooks/use-admin-queries";

const { Text } = Typography;

/**
 * StatCard component với error handling
 */
function StatCard({
  title,
  value,
  loading,
  error,
  icon,
  color = "#2563eb",
}: {
  title: string;
  value?: number;
  loading?: boolean;
  error?: Error | null;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }}>
        {icon && <div style={{ fontSize: 24, color }}>{icon}</div>}
        {loading ? (
          <Spin size="small" />
        ) : error ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            N/A
          </Text>
        ) : (
          <Statistic title={title} value={value ?? 0} />
        )}
      </Space>
    </Card>
  );
}

export default function DashboardHomePage() {
  // Fetch analytics data (sẽ fail gracefully nếu API chưa có)
  const { data: reportStats, isLoading: loadingReports, error: errorReports } = useReportStatistics();
  const { data: userStats, isLoading: loadingUsers, error: errorUsers } = useAggregateUserStatistics();
  const { data: contentStats, isLoading: loadingContent, error: errorContent } = useContentStatistics();
  const { data: systemHealth, isLoading: loadingHealth, error: errorHealth } = useSystemHealth();

  // Kiểm tra nếu tất cả analytics APIs đều fail → hiển thị warning
  const allAnalyticsFailed = errorReports && errorUsers && errorContent && errorHealth;

  return (
    <>
      <PageHeader
        icon={<DashboardOutlined />}
        title="Bảng điều khiển"
        subtitle="Tổng quan hệ thống và analytics"
      />

      {/* Warning nếu analytics APIs chưa implement */}
      {allAnalyticsFailed && (
        <Alert
          message="Analytics APIs chưa khả dụng"
          description="Các endpoint /api/v1/admin/stats/* có thể chưa được implement ở backend. Dashboard sẽ hiển thị N/A cho các metrics."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Analytics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Report Statistics */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Reports"
            value={reportStats?.total_reports}
            loading={loadingReports}
            error={errorReports}
            icon={<FileTextOutlined />}
            color="#2563eb"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Reports Đang Chờ"
            value={reportStats?.pending_reports}
            loading={loadingReports}
            error={errorReports}
            icon={<WarningOutlined />}
            color="#f59e0b"
          />
        </Col>

        {/* User Statistics */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Người Dùng"
            value={userStats?.total_users}
            loading={loadingUsers}
            error={errorUsers}
            icon={<TeamOutlined />}
            color="#10b981"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Người Dùng Active"
            value={userStats?.active_users}
            loading={loadingUsers}
            error={errorUsers}
            icon={<SafetyOutlined />}
            color="#8b5cf6"
          />
        </Col>

        {/* Content Statistics */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Posts"
            value={contentStats?.total_posts}
            loading={loadingContent}
            error={errorContent}
            icon={<FileTextOutlined />}
            color="#06b6d4"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Comments"
            value={contentStats?.total_comments}
            loading={loadingContent}
            error={errorContent}
            icon={<FileTextOutlined />}
            color="#ec4899"
          />
        </Col>

        {/* System Health */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="CPU Usage (%)"
            value={systemHealth?.cpu_usage_percent}
            loading={loadingHealth}
            error={errorHealth}
            icon={<DashboardOutlined />}
            color="#ef4444"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Memory Usage (%)"
            value={systemHealth?.memory_usage_percent}
            loading={loadingHealth}
            error={errorHealth}
            icon={<DashboardOutlined />}
            color="#f97316"
          />
        </Col>
      </Row>

      {/* Quick Navigation Cards */}
      <Text strong style={{ fontSize: 16, marginBottom: 12, display: "block" }}>
        Truy cập nhanh
      </Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Link href="/dashboard/system/users" style={{ textDecoration: "none" }}>
            <Card hoverable style={{ height: "100%" }}>
              <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                <UserOutlined style={{ fontSize: 24, color: "#2563eb" }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Người dùng</div>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Danh sách & khóa/mở, gán role
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12}>
          <Link href="/dashboard/business/locations" style={{ textDecoration: "none" }}>
            <Card hoverable style={{ height: "100%" }}>
              <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                <ShopOutlined style={{ fontSize: 24, color: "#2563eb" }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Địa điểm</div>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Tạo và chỉnh sửa địa điểm
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12}>
          <Link href="/dashboard/moderation/reports" style={{ textDecoration: "none" }}>
            <Card hoverable style={{ height: "100%" }}>
              <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                <FileTextOutlined style={{ fontSize: 24, color: "#2563eb" }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Reports</div>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Xử lý báo cáo vi phạm
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </Col>

        <Col xs={24} sm={12}>
          <Link href="/dashboard/system/activity-logs" style={{ textDecoration: "none" }}>
            <Card hoverable style={{ height: "100%" }}>
              <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                <SafetyOutlined style={{ fontSize: 24, color: "#2563eb" }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Activity Logs</div>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Lịch sử hoạt động hệ thống
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </Col>
      </Row>
    </>
  );
}
