"use client";

import { useState } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { useModerateUser } from "@/hooks/use-admin-queries";
import type { UserAdminView } from "@/types/api";

interface Props {
  user: UserAdminView | null;
  open: boolean;
  onClose: () => void;
}

export function ModerateUserModal({ user, open, onClose }: Props) {
  const [form] = Form.useForm();
  const moderateMut = useModerateUser();
  const actionType = Form.useWatch("actionType", form);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      let payload: any = {
        user_id: user?.id,
        actionType: values.actionType,
        note: values.note,
      };

      if (values.actionType === "BAN_USER_TEMPORARY" && values.banDays) {
        const date = new Date();
        date.setDate(date.getDate() + values.banDays);
        payload.lockedUntil = date.toISOString();
      }

      await moderateMut.mutateAsync(payload);
      message.success("Đã xử lý kiểm duyệt thành công");
      form.resetFields();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <Modal
      title={`Kiểm duyệt người dùng: ${user?.username}`}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={moderateMut.isPending}
      okText="Xử lý"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ actionType: "WARN_USER", note: "" }}
      >
        <Form.Item
          name="actionType"
          label="Hành động"
          rules={[{ required: true, message: "Vui lòng chọn hành động" }]}
        >
          <Select
            options={[
              { value: "WARN_USER", label: "Cảnh cáo (WARN_USER)" },
              { value: "BAN_USER_TEMPORARY", label: "Khóa tạm thời (BAN_USER_TEMPORARY)" },
              { value: "BAN_USER_PERMANENT", label: "Khóa vĩnh viễn (BAN_USER_PERMANENT)" },
              { value: "UNLOCK_USER", label: "Mở khóa tài khoản (UNLOCK_USER)" },
            ]}
          />
        </Form.Item>

        {actionType === "BAN_USER_TEMPORARY" && (
          <Form.Item
            name="banDays"
            label="Số ngày khóa (1-365)"
            rules={[
              { required: true, message: "Vui lòng nhập số ngày" },
              {
                type: "number",
                min: 1,
                max: 365,
                transform: (val) => Number(val),
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số ngày..." />
          </Form.Item>
        )}

        <Form.Item
          name="note"
          label="Lý do / Ghi chú"
          rules={[
            { required: true, message: "Vui lòng nhập lý do kiểm duyệt" },
            { min: 5, message: "Lý do phải dài ít nhất 5 ký tự" },
          ]}
        >
          <Input.TextArea rows={3} placeholder="Nhập lý do..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
