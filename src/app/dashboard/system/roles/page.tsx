"use client";

import { 
  useCreateRole, 
  useDeleteRole,
  usePermissions, 
  useRoles,
  useCreatePermission,
  useDeletePermission
} from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { usePermissions as usePermissionCheck } from "@/components/auth/PermissionGate";
import type { RoleWithPermissions, PermissionResponse } from "@/types/api";
import { Form, Input, Button, Card, Table, Tag, Space, Alert, Typography, Result, Tabs, Popconfirm, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title, Paragraph } = Typography;

export default function RolesPage() {
  const { isAdmin } = usePermissionCheck();
  
  // Queries
  const { data: roles, isLoading: loadingRoles, error: errRoles } = useRoles();
  const { data: perms, isLoading: loadingPerms, error: errPerms } = usePermissions();
  
  // Mutations
  const createRoleMut = useCreateRole();
  const deleteRoleMut = useDeleteRole();
  const createPermMut = useCreatePermission();
  const deletePermMut = useDeletePermission();
  
  // Forms
  const [roleForm] = Form.useForm();
  const [permForm] = Form.useForm();

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Result
          status="403"
          title="Không có quyền truy cập"
          subTitle="Chỉ ADMIN mới có thể quản lý vai trò và quyền hạn."
        />
      </div>
    );
  }

  const roleList = Array.isArray(roles) ? roles : [];
  const permList = Array.isArray(perms) ? perms : [];

  // --- Handlers ---

  const handleCreateRole = async (values: { name: string; description: string; permissions: string[] }) => {
    try {
      await createRoleMut.mutateAsync({
        name: values.name,
        description: values.description || "",
        permissions: values.permissions || [],
      });
      roleForm.resetFields();
      message.success("Tạo vai trò thành công");
    } catch (e: any) {
      message.error(e.message || "Lỗi khi tạo vai trò");
    }
  };

  const handleDeleteRole = async (name: string) => {
    try {
      await deleteRoleMut.mutateAsync(name);
      message.success("Đã xóa vai trò");
    } catch (e: any) {
      message.error(e.message || "Lỗi khi xóa vai trò");
    }
  };

  const handleCreatePerm = async (values: { name: string; description: string }) => {
    try {
      await createPermMut.mutateAsync({
        name: values.name,
        description: values.description || "",
      });
      permForm.resetFields();
      message.success("Tạo quyền hạn thành công");
    } catch (e: any) {
      message.error(e.message || "Lỗi khi tạo quyền hạn");
    }
  };

  const handleDeletePerm = async (name: string) => {
    try {
      await deletePermMut.mutateAsync(name);
      message.success("Đã xóa quyền hạn");
    } catch (e: any) {
      message.error(e.message || "Lỗi khi xóa quyền hạn");
    }
  };

  // --- Columns ---

  const roleColumns: ColumnsType<RoleWithPermissions> = [
    {
      title: "Vai trò",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quyền hạn",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms: PermissionResponse[]) => (
        <Space wrap>
          {perms?.map((p) => (
            <Tag color="blue" key={p.name}>
              {p.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Xóa vai trò"
          description="Bạn có chắc chắn muốn xóa vai trò này? Việc này có thể ảnh hưởng đến người dùng hiện tại."
          onConfirm={() => handleDeleteRole(record.name)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: deleteRoleMut.isPending }}
        >
          <Button danger type="link" size="small">Xóa</Button>
        </Popconfirm>
      ),
    }
  ];

  const permColumns: ColumnsType<PermissionResponse> = [
    {
      title: "Quyền hạn",
      dataIndex: "name",
      key: "name",
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Xóa quyền hạn"
          description="Xóa quyền hạn này có thể ảnh hưởng đến các vai trò đang sử dụng nó. Tiếp tục?"
          onConfirm={() => handleDeletePerm(record.name)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, loading: deletePermMut.isPending }}
        >
          <Button danger type="link" size="small">Xóa</Button>
        </Popconfirm>
      ),
    }
  ];

  // --- UI Items ---

  const roleTab = (
    <div className="space-y-6">
      <Card title="Tạo Vai Trò Mới" size="small">
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleCreateRole}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Tên vai trò (VD: MODERATOR)"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
          >
            <Input placeholder="Nhập tên vai trò" />
          </Form.Item>
          
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea placeholder="Mô tả chi tiết" rows={2} />
          </Form.Item>
          
          <Form.Item
            label="Quyền hạn"
            name="permissions"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 quyền hạn" }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn các quyền hạn"
              options={permList.map(p => ({ label: p.name, value: p.name }))}
              loading={loadingPerms}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createRoleMut.isPending}>
              {createRoleMut.isPending ? "Đang tạo…" : "Tạo vai trò"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Danh sách Vai Trò" size="small" styles={{ body: { padding: 0 } }}>
        <QueryState isLoading={loadingRoles} error={errRoles as Error | null}>
          <Table
            dataSource={roleList}
            columns={roleColumns}
            rowKey="name"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          />
        </QueryState>
      </Card>
    </div>
  );

  const permTab = (
    <div className="space-y-6">
      <Card title="Tạo Quyền Hạn Mới" size="small">
        <Form
          form={permForm}
          layout="vertical"
          onFinish={handleCreatePerm}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Tên quyền hạn (VD: MODERATE_COMMENTS)"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên quyền hạn" }]}
          >
            <Input placeholder="Nhập tên quyền hạn" />
          </Form.Item>
          
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea placeholder="Mô tả chi tiết" rows={2} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createPermMut.isPending}>
              {createPermMut.isPending ? "Đang tạo…" : "Tạo quyền hạn"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Danh sách Quyền Hạn" size="small" styles={{ body: { padding: 0 } }}>
        <QueryState isLoading={loadingPerms} error={errPerms as Error | null}>
          <Table
            dataSource={permList}
            columns={permColumns}
            rowKey="name"
            pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          />
        </QueryState>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Title level={4} style={{ margin: 0 }}>Quản lý Vai trò & Quyền hạn</Title>
      
      <Tabs
        defaultActiveKey="roles"
        items={[
          {
            key: "roles",
            label: "Vai Trò (Roles)",
            children: roleTab,
          },
          {
            key: "permissions",
            label: "Quyền Hạn (Permissions)",
            children: permTab,
          },
        ]}
      />
    </div>
  );
}
