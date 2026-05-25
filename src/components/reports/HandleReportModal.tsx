"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleReportSchema, type HandleReportForm } from "@/lib/schemas/admin-forms";
import { Modal, Form, Select, Input, Button, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HandleReportForm) => void;
  isPending?: boolean;
}

export function HandleReportModal({ isOpen, onClose, onSubmit, isPending }: Props) {
  const form = useForm<HandleReportForm>({
    resolver: zodResolver(handleReportSchema),
    defaultValues: {
      action: undefined,
      reason: "",
    },
  });

  const action = form.watch("action");
  const isDestructive = action === "DELETE_CONTENT" || action === "BAN_USER_TEMPORARY";

  const handleFormSubmit = (data: HandleReportForm) => {
    if (isDestructive) {
      confirm({
        title: "Xác nhận hành động",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>Hành động này không thể hoàn tác:</p>
            <ul style={{ paddingLeft: 20 }}>
              {action === "DELETE_CONTENT" && <li>Nội dung sẽ bị xóa vĩnh viễn</li>}
              {action === "BAN_USER_TEMPORARY" && <li>Người dùng sẽ bị khóa tạm thời</li>}
            </ul>
          </div>
        ),
        okText: "Tôi hiểu, tiếp tục",
        okType: "danger",
        cancelText: "Hủy",
        onOk: () => {
          onSubmit(data);
        },
      });
    } else {
      onSubmit(data);
    }
  };

  const resetAndClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      title="Xử lý báo cáo"
      open={isOpen}
      onCancel={resetAndClose}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={form.handleSubmit(handleFormSubmit)} style={{ marginTop: 16 }}>
        <Form.Item label="Hành động" validateStatus={form.formState.errors.action ? 'error' : ''} help={form.formState.errors.action?.message}>
          <Controller
            name="action"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="-- Chọn hành động --"
                options={[
                  { value: "DISMISS", label: "Bỏ qua" },
                  { value: "WARN_USER", label: "Cảnh báo người dùng" },
                  { value: "DELETE_CONTENT", label: "Xóa nội dung" },
                  { value: "BAN_USER_TEMPORARY", label: "Khóa tạm thời (1-30 ngày)" },
                ]}
              />
            )}
          />
        </Form.Item>

        {action === "BAN_USER_TEMPORARY" && (
          <Form.Item label="Số ngày khóa (1-30)" validateStatus={form.formState.errors.banDays ? 'error' : ''} help={form.formState.errors.banDays?.message}>
            <Controller
              name="banDays"
              control={form.control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  max={30}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
          </Form.Item>
        )}

        <Form.Item label="Lý do" validateStatus={form.formState.errors.reason ? 'error' : ''} help={form.formState.errors.reason?.message}>
          <Controller
            name="reason"
            control={form.control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={4}
                placeholder="Nhập lý do chi tiết cho quyết định này..."
              />
            )}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={resetAndClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Xác nhận
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
