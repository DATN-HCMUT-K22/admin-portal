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
      message.success("User created successfully");
      reset();
      onClose();
    } catch (error: any) {
      message.error(error?.message || "Failed to create user");
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
      title="Create New User"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={loading}
      okText="Create"
      cancelText="Cancel"
      width={600}
    >
      <Form layout="vertical" className="mt-4">
        <Form.Item
          label="Username"
          validateStatus={errors.username ? "error" : ""}
          help={errors.username?.message}
          required
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Enter username" />}
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
            render={({ field }) => <Input {...field} type="email" placeholder="Enter email" />}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
          required
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => <Input.Password {...field} placeholder="Enter password" />}
          />
        </Form.Item>

        <Form.Item
          label="Full Name"
          validateStatus={errors.fullName ? "error" : ""}
          help={errors.fullName?.message}
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Enter full name (optional)" />}
          />
        </Form.Item>

        <Form.Item
          label="Roles"
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
                placeholder="Select roles (leave blank for normal user)"
                options={roleOptions}
                allowClear
              />
            )}
          />
          <Text type="secondary" className="text-xs mt-1 block">
            If roles are selected, the user will be created with the corresponding roles (API: /with-roles).
            If left blank, a default user will be created (API: /users).
          </Text>
        </Form.Item>
      </Form>
    </Modal>
  );
}
