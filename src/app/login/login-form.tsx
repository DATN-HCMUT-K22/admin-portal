"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Form, Input, Button, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import * as authApi from "@/lib/api/auth";
import * as usersApi from "@/lib/api/users";
import { useAuth } from "@/providers/auth-provider";
import { useAdminStore } from "@/stores/admin-store";
import { getPostLoginRedirectPath } from "@/lib/auth/paths";

const { Title, Text } = Typography;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const setSession = useAdminStore((s) => s.setSession);
  const { isLoading: authLoading, user, hasAdmin, hasBa } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    const returnUrl = searchParams.get("returnUrl");
    const safeReturn =
      returnUrl &&
      returnUrl.startsWith("/") &&
      !returnUrl.startsWith("//") &&
      !returnUrl.startsWith("/login")
        ? returnUrl
        : null;

    if (hasAdmin || hasBa) {
      router.replace(safeReturn ?? getPostLoginRedirectPath(user.roles));
    } else {
      router.replace("/home");
    }
  }, [authLoading, user, hasAdmin, hasBa, router, searchParams]);

  async function onFinish(values: { username: string; password: string }) {
    setError(null);
    setSubmitting(true);
    try {
      const data = await authApi.login({
        username: values.username.trim(),
        password: values.password
      });
      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      const me = await usersApi.getMe();
      await qc.invalidateQueries({ queryKey: ["auth"] });
      const returnUrl = searchParams.get("returnUrl");
      const safeReturn =
        returnUrl &&
        returnUrl.startsWith("/") &&
        !returnUrl.startsWith("//") &&
        !returnUrl.startsWith("/login")
          ? returnUrl
          : null;
      const target = safeReturn ?? getPostLoginRedirectPath(me.roles);
      router.replace(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            Đăng nhập
          </Title>
          <Text type="secondary">
            TripJoy — cổng quản trị & kinh doanh
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              block
            >
              {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
