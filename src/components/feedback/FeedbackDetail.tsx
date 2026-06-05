"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useFeedback, useFeedbacks, useRespondToFeedback } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { normalizeItems } from "@/lib/list-utils";
import type { FeedbackResponse } from "@/lib/api/feedbacks";
import {
  Card,
  Descriptions,
  Tag,
  Form,
  Input,
  Select,
  Button,
  Typography,
  Alert,
  Space,
  Avatar,
  Divider,
  Timeline,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  BugOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  SafetyOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface FeedbackDetailProps {
  pathPrefix: string;
}

export function FeedbackDetail({ pathPrefix }: FeedbackDetailProps) {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const [form] = Form.useForm();

  // Load the current feedback details
  const { data, isLoading, error } = useFeedback(id);
  const respondMut = useRespondToFeedback(id);
  const err = error as Error | null;

  // Load all feedbacks to filter replies on the client-side
  const { data: allData } = useFeedbacks({ page: 0, size: 1000, sort: "createdAt,desc" });
  const allList = useMemo(() => normalizeItems<FeedbackResponse>(allData as any), [allData]);

  // Compute replies that belong to this feedback thread (chronological order)
  const replies = useMemo(() => {
    if (!id || !allList.length) return [];
    return allList
      .filter((f) => f.type === "ADMIN_RESPONSE" && f.parent_feedback?.id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [allList, id]);

  const handleFinish = async (values: any) => {
    try {
      await respondMut.mutateAsync(values);
      message.success("Response sent and status updated successfully!");
      form.resetFields(["description"]);
    } catch (e: any) {
      message.error(e.message || "Failed to send response");
    }
  };

  // Determine metadata color/label for types
  const typeTag = (type: string) => {
    switch (type) {
      case "BUG_REPORT":
        return <Tag color="error" className="rounded-full px-3 py-0.5 border-none font-medium"><BugOutlined /> Bug</Tag>;
      case "SUGGESTION":
        return <Tag color="warning" className="rounded-full px-3 py-0.5 border-none font-medium"><BulbOutlined /> Suggestion</Tag>;
      case "REPORT_FEEDBACK":
        return <Tag color="cyan" className="rounded-full px-3 py-0.5 border-none font-medium"><SafetyOutlined /> Report</Tag>;
      default:
        return <Tag color="default" className="rounded-full px-3 py-0.5 border-none font-medium">Other</Tag>;
    }
  };

  // Determine metadata color/label for statuses
  const statusTag = (status: string) => {
    let color = "processing";
    let label = "Pending";
    if (status === "RESOLVED") {
      color = "success";
      label = "Resolved";
    } else if (status === "REPLIED") {
      color = "cyan";
      label = "Replied";
    } else if (status === "SENT") {
      color = "warning";
      label = "Sent";
    }
    return <Tag color={color} className="rounded-full px-3 py-0.5 border-none font-medium">{label}</Tag>;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(pathPrefix)}
          className="rounded-full flex items-center justify-center border-slate-200"
        />
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700 }} className="text-slate-800">
            Feedback Details
          </Title>
          <Text className="text-slate-500 text-xs">
            Manage and resolve user feedback.
          </Text>
        </div>
      </div>

      <QueryState isLoading={isLoading} error={err}>
        {data && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            
            {/* Header Status Card */}
            <Card bordered={false} className="shadow-sm rounded-2xl border border-slate-100 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    size={56}
                    src={data.sender?.avatarUrl}
                    className="border-2 border-slate-100 shadow-sm"
                  >
                    {data.sender?.fullName?.charAt(0).toUpperCase() || <UserOutlined />}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Title level={4} className="m-0 font-bold text-slate-800" style={{ margin: 0 }}>
                        {data.sender?.fullName || "Anonymous User"}
                      </Title>
                      {data.sender?.username && (
                        <Text type="secondary" className="text-sm">
                          @{data.sender.username}
                        </Text>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {typeTag(data.type)}
                      {statusTag(data.status)}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Sent at: {new Date(data.created_at).toLocaleString("vi-VN")}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content Details */}
            <Card title="Detailed Content" bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
              <Descriptions column={1} bordered={false} layout="vertical" className="feedback-descriptions">
                <Descriptions.Item label={<span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Title</span>}>
                  <Text className="text-slate-800 font-semibold text-lg">{data.title || "No Title"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="font-semibold text-slate-400 uppercase tracking-wider text-xs">Feedback Content</span>}>
                  <Paragraph className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                    {data.content || "No detailed content."}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Associated Report Card (If exists) */}
            {data.report && (
              <Card
                title={
                  <div className="flex items-center gap-2 text-rose-600">
                    <SafetyOutlined />
                    <span>Related Violation Report</span>
                  </div>
                }
                bordered={false}
                className="shadow-sm rounded-2xl border border-rose-100 bg-rose-50/20"
              >
                <div className="space-y-4">
                  <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} className="bg-white rounded-xl overflow-hidden border border-rose-100">
                    <Descriptions.Item label="Report ID">
                      <Text code>{data.report.id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={data.report.status === "PROCESSED" ? "success" : "warning"}>
                        {data.report.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Violation Type">
                      <Text className="font-semibold">{data.report.report_type || "N/A"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Content Type">
                      <Tag>{data.report.content_type || "N/A"}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Reporter">
                      {data.report.reporter ? (
                        <Text strong>{data.report.reporter.fullName} (@{data.report.reporter.username})</Text>
                      ) : (
                        <Text type="secondary">Anonymous</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reported Entity">
                      {data.report.reported_user ? (
                        <Text strong className="text-rose-600">{data.report.reported_user.fullName} (@{data.report.reported_user.username})</Text>
                      ) : (
                        <Text type="secondary">None</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Violation Content" span={2}>
                      <Paragraph className="text-slate-600 m-0 py-1" style={{ margin: 0 }}>
                        {data.report.reported_content_text || "No text content"}
                      </Paragraph>
                      {data.report.reported_media_url && (
                        <div className="mt-2">
                          <Text type="secondary" className="block text-xs mb-1">Attached media:</Text>
                          <a href={data.report.reported_media_url} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={data.report.reported_media_url}
                              alt="Reported attachment"
                              className="max-h-40 rounded-lg border border-slate-200 hover:opacity-90 transition cursor-zoom-in"
                            />
                          </a>
                        </div>
                      )}
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="flex justify-end">
                    {/* Link to reports handler: determine prefix dashboard/moderation or dashboard/business */}
                    <Link href={`${pathPrefix.includes("moderation") ? "/dashboard/moderation" : "/dashboard/business"}/reports/${data.report.id}`}>
                      <Button type="primary" danger icon={<FileTextOutlined />}>
                        Go to report handling page
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Conversation History (Thread) */}
            <Card title="Conversation History & Responses" bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
              {replies.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CommentOutlined className="text-slate-300 text-3xl mb-2" />
                  <p className="text-slate-400 text-sm m-0">No responses sent to user by Admin yet.</p>
                </div>
              ) : (
                <Timeline mode="left" className="pt-4 feedback-timeline">
                  {replies.map((reply) => {
                    const date = new Date(reply.created_at);
                    const isSystemAdmin = reply.sender?.username === "sys_admin";
                    return (
                      <Timeline.Item
                        key={reply.id}
                        color="blue"
                        label={
                          <div className="flex flex-col text-right pr-2">
                            <span className="font-semibold text-slate-700 text-xs">
                              {reply.sender?.fullName || reply.sender?.username || "Administrator"}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {date.toLocaleDateString("vi-VN")} {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        }
                      >
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm relative ml-2 max-w-2xl">
                          <div className="absolute top-3 right-3">
                            <Tag color="cyan" className="rounded-full px-2 py-0.2 border-none text-[10px] uppercase font-bold">
                              Status: {reply.status}
                            </Tag>
                          </div>
                          <Paragraph className="text-slate-700 m-0 leading-relaxed pr-20" style={{ margin: 0 }}>
                            {reply.content}
                          </Paragraph>
                        </div>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              )}
            </Card>

            {/* Submit Response Form */}
            <Card title="Respond to User" bordered={false} className="shadow-sm rounded-2xl border border-slate-100">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ status: "REPLIED", description: "" }}
              >
                <Form.Item
                  label={<span className="font-semibold text-slate-700 text-sm">New Status</span>}
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select
                    className="h-[40px]"
                    options={[
                      { value: "REPLIED", label: "REPLIED" },
                      { value: "RESOLVED", label: "RESOLVED" },
                      { value: "OPEN", label: "OPEN (Keep as Pending)" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-semibold text-slate-700 text-sm">Response Content</span>}
                  name="description"
                  rules={[{ required: true, message: "Please enter the response to send to the user" }]}
                >
                  <Input.TextArea
                    rows={5}
                    placeholder="Enter response to user... This response will be shown directly on the user's device."
                    className="rounded-xl border-slate-200 focus:border-primary hover:border-primary p-3"
                  />
                </Form.Item>

                {respondMut.isError && (
                  <Form.Item>
                    <Alert message={(respondMut.error as Error).message} type="error" showIcon />
                  </Form.Item>
                )}

                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    onClick={() => {
                      form.resetFields(["description"]);
                    }}
                    className="rounded-lg h-[40px] px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={respondMut.isPending}
                    className="rounded-lg h-[40px] px-6"
                  >
                    Send Response
                  </Button>
                </div>
              </Form>
            </Card>
          </Space>
        )}
      </QueryState>
    </div>
  );
}
