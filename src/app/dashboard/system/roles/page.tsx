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

const formatEnum = (text: string) => {
  if (!text) return "";
  return text.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

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
          title="Access Denied"
          subTitle="Only ADMINs can manage roles and permissions."
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
      message.success("Role created successfully");
    } catch (e: any) {
      message.error(e.message || "Failed to create role");
    }
  };

  const handleDeleteRole = async (name: string) => {
    try {
      await deleteRoleMut.mutateAsync(name);
      message.success("Role deleted");
    } catch (e: any) {
      message.error(e.message || "Failed to delete role");
    }
  };

  const handleCreatePerm = async (values: { name: string; description: string }) => {
    try {
      await createPermMut.mutateAsync({
        name: values.name,
        description: values.description || "",
      });
      permForm.resetFields();
      message.success("Permission created successfully");
    } catch (e: any) {
      message.error(e.message || "Failed to create permission");
    }
  };

  const handleDeletePerm = async (name: string) => {
    try {
      await deletePermMut.mutateAsync(name);
      message.success("Permission deleted");
    } catch (e: any) {
      message.error(e.message || "Failed to delete permission");
    }
  };

  // --- Columns ---

  const roleColumns: ColumnsType<RoleWithPermissions> = [
    {
      title: "Role",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{formatEnum(text)}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms: PermissionResponse[]) => (
        <Space wrap>
          {perms?.map((p) => (
            <Tag color="blue" key={p.name}>
              {formatEnum(p.name)}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete Role"
          description="Are you sure you want to delete this role? This may affect current users."
          onConfirm={() => handleDeleteRole(record.name)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: deleteRoleMut.isPending }}
        >
          <Button danger type="link" size="small">Delete</Button>
        </Popconfirm>
      ),
    }
  ];

  const permColumns: ColumnsType<PermissionResponse> = [
    {
      title: "Permission",
      dataIndex: "name",
      key: "name",
      render: (text) => <Tag color="purple">{formatEnum(text)}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete Permission"
          description="Deleting this permission may affect roles currently using it. Continue?"
          onConfirm={() => handleDeletePerm(record.name)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: deletePermMut.isPending }}
        >
          <Button danger type="link" size="small">Delete</Button>
        </Popconfirm>
      ),
    }
  ];

  // --- UI Items ---

  const roleTab = (
    <div className="space-y-6">
      <Card title="Create New Role" size="small">
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleCreateRole}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Role Name (e.g. MODERATOR)"
            name="name"
            rules={[{ required: true, message: "Please enter role name" }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea placeholder="Detailed description" rows={2} />
          </Form.Item>
          
          <Form.Item
            label="Permissions"
            name="permissions"
            rules={[{ required: true, message: "Please select at least 1 permission" }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select permissions"
              options={permList.map(p => ({ label: formatEnum(p.name), value: p.name }))}
              loading={loadingPerms}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createRoleMut.isPending}>
              {createRoleMut.isPending ? "Creating..." : "Create Role"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Roles List" size="small" styles={{ body: { padding: 0 } }}>
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
      <Card title="Create New Permission" size="small">
        <Form
          form={permForm}
          layout="vertical"
          onFinish={handleCreatePerm}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="Permission Name (e.g. MODERATE_COMMENTS)"
            name="name"
            rules={[{ required: true, message: "Please enter permission name" }]}
          >
            <Input placeholder="Enter permission name" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea placeholder="Detailed description" rows={2} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createPermMut.isPending}>
              {createPermMut.isPending ? "Creating..." : "Create Permission"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Permissions List" size="small" styles={{ body: { padding: 0 } }}>
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
      <Title level={4} style={{ margin: 0 }}>Roles & Permissions Management</Title>
      
      <Tabs
        defaultActiveKey="roles"
        items={[
          {
            key: "roles",
            label: "Roles",
            children: roleTab,
          },
          {
            key: "permissions",
            label: "Permissions",
            children: permTab,
          },
        ]}
      />
    </div>
  );
}
