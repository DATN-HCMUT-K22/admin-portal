import { Modal, Input, Select, Form, Typography, message } from "antd";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/lib/schemas/admin-forms";
import { useCreateUserWithRoles, useCreateNormalUser, useRoles } from "@/hooks/use-admin-queries";
import type { z } from "zod";

const { Text } = Typography;

type CreateUserForm = z.infer<typeof createUserSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateUserModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const createWithRolesMut = useCreateUserWithRoles();
  const createNormalMut = useCreateNormalUser();
  const { data: rolesData } = useRoles();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      roles: [],
    },
  });

  const onSubmit = async (values: CreateUserForm) => {
    setLoading(true);
    try {
      if (values.roles && values.roles.length > 0) {
        await createWithRolesMut.mutateAsync({
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          roles: values.roles,
        });
      } else {
        await createNormalMut.mutateAsync({
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName,
        });
      }
      message.success("Tạo người dùng thành công");
      reset();
      onClose();
    } catch (error: any) {
      message.error(error?.message || "Tạo người dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const roleOptions = rolesData?.map((r) => ({
    label: r.name,
    value: r.name,
  })) || [];

  return (
    <Modal
      title="Tạo Người Dùng Mới"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      width={600}
    >
      <Form layout="vertical" className="mt-4">
        <Form.Item
          label="Tên đăng nhập (Username)"
          validateStatus={errors.username ? "error" : ""}
          help={errors.username?.message}
          required
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nhập tên đăng nhập" />}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
          required
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} type="email" placeholder="Nhập email" />}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
          required
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => <Input.Password {...field} placeholder="Nhập mật khẩu" />}
          />
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          validateStatus={errors.fullName ? "error" : ""}
          help={errors.fullName?.message}
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Nhập họ và tên (tùy chọn)" />}
          />
        </Form.Item>

        <Form.Item
          label="Vai trò (Roles)"
          validateStatus={errors.roles ? "error" : ""}
          help={errors.roles?.message}
        >
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                placeholder="Chọn vai trò (để trống sẽ tạo user bình thường)"
                options={roleOptions}
                allowClear
              />
            )}
          />
          <Text type="secondary" className="text-xs mt-1 block">
            Nếu chọn vai trò, người dùng sẽ được tạo kèm các vai trò tương ứng (API: /with-roles).
            Nếu để trống, sẽ tạo user mặc định (API: /users).
          </Text>
        </Form.Item>
      </Form>
    </Modal>
  );
}
