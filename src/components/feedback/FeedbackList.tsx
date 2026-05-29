"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useFeedbacks } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { normalizeItems } from "@/lib/list-utils";
import type { FeedbackResponse } from "@/lib/api/feedbacks";
import {
  Table,
  Tag,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Input,
  Select,
  Radio,
  Rate,
  Avatar,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  BugOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
  CommentOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface FeedbackListProps {
  pathPrefix: string;
}

export function FeedbackList({ pathPrefix }: FeedbackListProps) {
  // Query all feedbacks with a large size to allow full client-side search, filtering, and grouping
  const { data, isLoading, error, refetch } = useFeedbacks({ page: 0, size: 1000, sort: "createdAt,desc" });
  const list = useMemo(() => normalizeItems<FeedbackResponse>(data as any), [data]);
  const err = error as Error | null;

  // State filters
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<string>("date_desc");

  // Separate root feedbacks (threads initiated by users) and response feedbacks
  const { rootFeedbacks, repliesMap } = useMemo(() => {
    const roots: FeedbackResponse[] = [];
    const replies: Record<string, FeedbackResponse[]> = {};

    list.forEach((f) => {
      if (f.type === "ADMIN_RESPONSE" || f.parent_feedback) {
        const parentId = f.parent_feedback?.id;
        if (parentId) {
          if (!replies[parentId]) replies[parentId] = [];
          replies[parentId].push(f);
        }
      } else {
        roots.push(f);
      }
    });

    return { rootFeedbacks: roots, repliesMap: replies };
  }, [list]);

  // Compute metrics from root feedbacks
  const metrics = useMemo(() => {
    const stats = {
      total: rootFeedbacks.length,
      open: 0,
      bugReport: 0,
      suggestion: 0,
    };

    rootFeedbacks.forEach((f) => {
      if (f.status === "OPEN") stats.open++;
      if (f.type === "BUG_REPORT") stats.bugReport++;
      if (f.type === "SUGGESTION") stats.suggestion++;
    });

    return stats;
  }, [rootFeedbacks]);

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    let result = [...rootFeedbacks];

    // Filter by status tab
    if (selectedStatus !== "ALL") {
      result = result.filter((f) => f.status === selectedStatus);
    }

    // Filter by type select
    if (selectedType !== "ALL") {
      result = result.filter((f) => f.type === selectedType);
    }

    // Search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (f) =>
          f.title?.toLowerCase().includes(search) ||
          f.content?.toLowerCase().includes(search) ||
          f.sender?.fullName?.toLowerCase().includes(search) ||
          f.sender?.username?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === "date_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === "date_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === "rating_desc") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortOrder === "rating_asc") {
        return (a.rating || 0) - (b.rating || 0);
      }
      return 0;
    });

    return result;
  }, [rootFeedbacks, selectedStatus, selectedType, searchText, sortOrder]);

  const columns: ColumnsType<FeedbackResponse> = [
    {
      title: "Người gửi",
      key: "sender",
      width: 200,
      render: (_, f) => {
        const name = f.sender?.fullName || f.sender?.username || "Người dùng ẩn danh";
        const username = f.sender?.username ? `@${f.sender.username}` : `ID: ${f.userId?.substring(0, 8)}...`;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={f.sender?.avatarUrl}
              alt={name}
              className="border border-slate-200 shadow-sm"
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <Text className="font-semibold text-slate-800 truncate block" style={{ fontSize: 13 }}>
                {name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }} className="truncate block">
                {username}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Nội dung phản hồi",
      key: "content",
      render: (_, f) => {
        const threadReplies = repliesMap[f.id] || [];
        return (
          <div className="space-y-1 py-1 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="text-slate-800 text-sm">
                {f.title || "Không có tiêu đề"}
              </Text>
              {f.report && (
                <Tag color="red" bordered={false} className="flex items-center gap-1 py-0.5 px-2 rounded-full text-xs">
                  <SafetyOutlined /> Báo cáo vi phạm
                </Tag>
              )}
            </div>
            <Paragraph
              ellipsis={{ rows: 2 }}
              type="secondary"
              className="text-xs text-slate-500 m-0"
              style={{ margin: 0 }}
            >
              {f.content}
            </Paragraph>
            {threadReplies.length > 0 && (
              <div className="flex items-center gap-1 mt-1 text-sky-600" style={{ fontSize: 11 }}>
                <CommentOutlined />
                <span>Đã có {threadReplies.length} phản hồi từ Admin</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Phân loại",
      dataIndex: "type",
      key: "type",
      width: 140,
      render: (type) => {
        switch (type) {
          case "BUG_REPORT":
            return (
              <Tag color="error" className="rounded-full px-3 py-0.5 border-none font-medium flex items-center w-fit gap-1">
                <BugOutlined /> Báo lỗi
              </Tag>
            );
          case "SUGGESTION":
            return (
              <Tag color="warning" className="rounded-full px-3 py-0.5 border-none font-medium flex items-center w-fit gap-1">
                <BulbOutlined /> Góp ý
              </Tag>
            );
          case "REPORT_FEEDBACK":
            return (
              <Tag color="cyan" className="rounded-full px-3 py-0.5 border-none font-medium flex items-center w-fit gap-1">
                <SafetyOutlined /> Báo cáo
              </Tag>
            );
          default:
            return (
              <Tag color="default" className="rounded-full px-3 py-0.5 border-none font-medium flex items-center w-fit gap-1">
                Khác
              </Tag>
            );
        }
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 130,
      render: (rating) => (
        <Tooltip title={`Đánh giá: ${rating || 0} sao`}>
          <div>
            <Rate disabled value={rating || 0} style={{ fontSize: 12, color: "#faad14" }} />
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "processing";
        let label = "Đang chờ";
        let icon = <ClockCircleOutlined />;

        if (status === "RESOLVED") {
          color = "success";
          label = "Đã xử lý";
          icon = <CheckCircleOutlined />;
        } else if (status === "REPLIED") {
          color = "cyan";
          label = "Đã trả lời";
          icon = <CommentOutlined />;
        } else if (status === "SENT") {
          color = "warning";
          label = "Đã gửi";
          icon = <ArrowRightOutlined />;
        }

        return (
          <Tag color={color} className="rounded-full font-medium flex items-center w-fit gap-1 px-2.5 py-0.5 border-none">
            {icon}
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      width: 155,
      render: (val) => {
        if (!val) return "N/A";
        const date = new Date(val);
        return (
          <div className="flex flex-col text-xs text-slate-500">
            <span className="font-medium text-slate-700">{date.toLocaleDateString("vi-VN")}</span>
            <span>{date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 90,
      fixed: "right",
      render: (_, f) => (
        <Link href={`${pathPrefix}/${f.id}`}>
          <Button
            type="text"
            icon={<ArrowRightOutlined className="text-slate-400 group-hover:text-primary transition" />}
            className="group hover:bg-slate-100 rounded-full"
          />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }} className="text-slate-900">
          Phản hồi & Báo lỗi
        </Title>
        <Text className="text-slate-500 text-sm">
          Xem và quản lý các đóng góp ý kiến, báo lỗi hệ thống từ người dùng.
        </Text>
      </div>

      {/* Metrics Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition duration-300 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 text-xl font-semibold">
                <InboxOutlined />
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">Tất cả phản hồi</Text>
                <Title level={3} className="m-0 font-bold text-slate-800" style={{ margin: 0 }}>
                  {metrics.total}
                </Title>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition duration-300 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 text-xl font-semibold animate-pulse">
                <ClockCircleOutlined />
              </div>
              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">Đang chờ xử lý</Text>
                <Title level={3} className="m-0 font-bold text-slate-800" style={{ margin: 0 }}>
                  {metrics.open}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content Area */}
      <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100 p-0 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Segmented/Tabs */}
            <Radio.Group
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              buttonStyle="solid"
              className="flex flex-wrap gap-1 border-none"
            >
              <Radio.Button value="ALL" className="rounded-lg border-none hover:text-primary">
                Tất cả ({metrics.total})
              </Radio.Button>
              <Radio.Button value="OPEN" className="rounded-lg border-none hover:text-amber-600">
                Đang chờ ({metrics.open})
              </Radio.Button>
              <Radio.Button value="REPLIED" className="rounded-lg border-none hover:text-indigo-600">
                Đã trả lời
              </Radio.Button>
              <Radio.Button value="RESOLVED" className="rounded-lg border-none hover:text-emerald-600">
                Đã giải quyết
              </Radio.Button>
            </Radio.Group>

            {/* Quick Refresh */}
            <Button onClick={() => refetch()} loading={isLoading}>
              Tải lại danh sách
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <Input
                placeholder="Tìm theo tiêu đề, nội dung, người gửi..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="rounded-lg border-slate-200 hover:border-primary focus:border-primary py-2"
              />
            </div>

            {/* Type dropdown */}
            <div>
              <Select
                placeholder="Lọc loại phản hồi"
                className="w-full h-[40px] rounded-lg"
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={[
                  { value: "ALL", label: "Tất cả các loại" },
                  { value: "BUG_REPORT", label: "Báo lỗi hệ thống" },
                  { value: "SUGGESTION", label: "Góp ý cải tiến" },
                  { value: "REPORT_FEEDBACK", label: "Báo cáo nội dung" },
                  { value: "OTHER", label: "Khác" },
                ]}
              />
            </div>

            {/* Sort order dropdown */}
            <div>
              <Select
                placeholder="Sắp xếp"
                className="w-full h-[40px] rounded-lg"
                value={sortOrder}
                onChange={(val) => setSortOrder(val)}
                options={[
                  { value: "date_desc", label: "Mới nhất trước" },
                  { value: "date_asc", label: "Cũ nhất trước" },
                  { value: "rating_desc", label: "Đánh giá cao nhất" },
                  { value: "rating_asc", label: "Đánh giá thấp nhất" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table representation */}
        <QueryState isLoading={isLoading} error={err} isEmpty={filteredList.length === 0} emptyMessage="Không tìm thấy phản hồi nào trùng khớp với bộ lọc.">
          <div className="overflow-x-auto">
            <Table<FeedbackResponse>
              dataSource={filteredList}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                pageSizeOptions: ["15", "30", "50"],
                showTotal: (total) => `Tổng cộng ${total} phản hồi`,
                className: "px-6 py-4 border-t border-slate-100 m-0",
              }}
              className="feedback-table border-none"
              rowClassName={() => "hover:bg-slate-50 transition cursor-pointer"}
              onRow={(record) => ({
                onClick: (e) => {
                  // Prevent navigation if click is on action button directly
                  const target = e.target as HTMLElement;
                  if (!target.closest("button") && !target.closest("a")) {
                    window.location.href = `${pathPrefix}/${record.id}`;
                  }
                },
              })}
            />
          </div>
        </QueryState>
      </Card>
    </div>
  );
}
