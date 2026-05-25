# Phase 4: Page Migration

**Effort:** 12 hours  
**Priority:** Critical (Core feature delivery)  
**Complexity:** High (Most time-consuming)  
**Blocked by:** Phase 2 (Layout), Phase 3 (Patterns)

---

## Objectives

Migrate all existing dashboard pages from Tailwind + React Hook Form + Zod to Ant Design + Ant Design Form validation. Achieve feature parity while following the established component patterns.

---

## Migration Strategy

### Sequential Migration Order

1. **Login Page** (1.5h) - Simplest, good starter
2. **Dashboard Home** (1.5h) - Statistics cards
3. **Users Management** (2h) - Full CRUD example
4. **Roles Management** (2h) - Similar to users
5. **Statistics Pages** (2h) - Charts integration
6. **Reports/Moderation** (2h) - Complex tables
7. **Polish & Testing** (1h)

### Per-Page Checklist

For each page, follow this process:

1. ✅ Remove Tailwind classes
2. ✅ Remove React Hook Form imports
3. ✅ Remove Zod validation schemas
4. ✅ Replace with Ant Design components
5. ✅ Add Ant Design Form validation rules
6. ✅ Use common patterns (PageHeader, FilterBar, TableActions)
7. ✅ Add loading states
8. ✅ Wire up App.useApp() notifications
9. ✅ Test functionality (CRUD operations)
10. ✅ Test responsive behavior

---

## Tasks

### Task 4.1: Migrate Login Page (1.5 hours)

**Current File:** `src/app/login/login-form.tsx`

**Before (React Hook Form + Zod):**
```tsx
// Old code uses:
// - useForm from react-hook-form
// - zodResolver
// - Zod schema validation
// - Custom input components
```

**After (Ant Design Form):**

```tsx
'use client'

import { Form, Input, Button, Card, Typography, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const { Title, Text } = Typography

export default function LoginPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const router = useRouter()

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      // TODO: Call login API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API
      message.success('Login successful')
      router.push('/dashboard')
    } catch (error: any) {
      message.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Admin Panel
          </Title>
          <Text type="secondary">Sign in to continue</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Min 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
```

**Validation:**
- ✅ Form validates email format
- ✅ Password minimum 6 characters
- ✅ Loading state shows on submit
- ✅ Success message appears
- ✅ Redirects to dashboard on success
- ✅ Card centered with gradient background

---

### Task 4.2: Migrate Dashboard Home (1.5 hours)

**Current File:** `src/app/dashboard/page.tsx` or `src/app/home/page.tsx`

**After (Ant Design Cards):**

```tsx
'use client'

import { Row, Col, Card, Statistic, Space } from 'antd'
import { UserOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { PageLoading } from '@/components/common/LoadingStates'

export default function DashboardHome() {
  const { data, isLoading } = useQuery(['dashboard-stats'], fetchDashboardStats)

  if (isLoading) return <PageLoading />

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your admin panel" />

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={data?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Reports"
              value={data?.totalReports || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={data?.resolvedReports || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={data?.pendingReports || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Add charts if needed (keep existing Recharts integration) */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Activity Chart">
            {/* Recharts component */}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Violations Distribution">
            {/* Recharts component */}
          </Card>
        </Col>
      </Row>
    </>
  )
}
```

**Validation:**
- ✅ Statistics cards render with correct icons
- ✅ Responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)
- ✅ Loading state shows while fetching data
- ✅ Charts integrate with existing Recharts components

---

### Task 4.3: Migrate Users Management Page (2 hours)

**Current File:** `src/app/dashboard/system/users/page.tsx`

**After (Ant Design Table + Form):**

```tsx
'use client'

import { useState } from 'react'
import { Card, Table, Button, Form, Input, Switch, Tabs, Badge, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/common/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableActions } from '@/components/common/TableActions'
import { FormModal } from '@/components/common/FormModal'
import { useDebounce } from '@/hooks/useDebounce'
import { USER_STATUS_COLORS } from '@/constants/status-colors'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'

interface User {
  id: string
  name: string
  email: string
  status: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const queryClient = useQueryClient()

  // State
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [statusTab, setStatusTab] = useState('all')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>()
  
  const debouncedSearch = useDebounce(search, 300)

  // Queries
  const { data, isLoading } = useQuery(['users', statusTab, debouncedSearch, roleFilter], () =>
    fetchUsers({ status: statusTab, search: debouncedSearch, role: roleFilter })
  )

  // Mutations
  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      message.success('User created successfully')
    },
  })

  const updateMutation = useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      message.success('User updated successfully')
    },
  })

  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      message.success('User deleted successfully')
    },
  })

  // Handlers
  const handleSubmit = async (values: any) => {
    if (editMode && editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, ...values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditMode(true)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleClearFilters = () => {
    setSearch('')
    setRoleFilter(undefined)
  }

  // Table columns
  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} colorMap={USER_STATUS_COLORS} />,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <TableActions
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record.id)}
          deleteConfirmTitle={`Delete user "${record.name}"?`}
        />
      ),
    },
  ]

  const activeFilterCount = [search, roleFilter].filter(Boolean).length

  return (
    <>
      <PageHeader
        icon={<UserOutlined />}
        title="Users Management"
        subtitle="Manage admin users and permissions"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditMode(false)
              setEditingUser(null)
              setModalOpen(true)
            }}
          >
            Add User
          </Button>
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
        {/* Status Tabs */}
        <Tabs
          activeKey={statusTab}
          onChange={setStatusTab}
          items={[
            {
              key: 'all',
              label: <Badge count={data?.counts.all}>All</Badge>,
            },
            {
              key: 'ACTIVE',
              label: <Badge count={data?.counts.active} color="success">Active</Badge>,
            },
            {
              key: 'INACTIVE',
              label: <Badge count={data?.counts.inactive}>Inactive</Badge>,
            },
          ]}
          style={{ padding: '0 16px' }}
        />

        {/* Filter Bar */}
        <FilterBar onClear={handleClearFilters} activeFilterCount={activeFilterCount}>
          <FilterBar.Search
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <FilterBar.Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
            style={{ width: 150 }}
            options={[
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Moderator', value: 'MODERATOR' },
              { label: 'Viewer', value: 'VIEWER' },
            ]}
          />
        </FilterBar>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data?.users || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} users`,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <FormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editMode ? 'Edit User' : 'Create User'}
        form={form}
        editMode={editMode}
        initialValues={editingUser}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Name is required' },
            { min: 3, message: 'Min 3 characters' },
          ]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <FilterBar.Select
            placeholder="Select role"
            options={[
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Moderator', value: 'MODERATOR' },
              { label: 'Viewer', value: 'VIEWER' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </FormModal>
    </>
  )
}
```

**Validation:**
- ✅ Table renders with all columns
- ✅ Status tabs show correct counts
- ✅ Filter bar responsive (drawer on mobile)
- ✅ Debounced search delays 300ms
- ✅ Create modal opens with empty form
- ✅ Edit modal populates form with user data
- ✅ Delete shows confirmation popover
- ✅ CRUD operations work (create, update, delete)
- ✅ Success messages appear
- ✅ Table reloads after mutations

---

### Task 4.4: Migrate Roles Management Page (2 hours)

**Similar to Users page, adjust for roles data structure**

Key differences:
- Different columns (name, permissions, userCount)
- Different form fields (name, description, permissions checkboxes)
- No status tabs (all roles active)

**Reuse patterns from Users page:**
- Same PageHeader, FilterBar, TableActions
- Same FormModal structure
- Same React Query pattern

**Validation:**
- ✅ All CRUD operations work
- ✅ Permissions checkboxes save correctly
- ✅ Table sorts by name, userCount

---

### Task 4.5: Integrate Charts (Statistics Pages) (2 hours)

**Keep existing Recharts components, wrap in Ant Design Cards**

```tsx
import { Card, Row, Col, DatePicker, Select, Space } from 'antd'
import { ActivityChart } from '@/components/statistics/ActivityChart'
import { ViolationPieChart } from '@/components/statistics/ViolationPieChart'

export default function StatisticsPage() {
  return (
    <>
      <PageHeader title="Statistics" subtitle="Analytics and insights" />

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <DatePicker.RangePicker />
          <Select placeholder="Metric" style={{ width: 150 }} />
        </Space>
      </Card>

      {/* Charts */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Activity Over Time">
            <ActivityChart data={data} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Violations Distribution">
            <ViolationPieChart data={data} />
          </Card>
        </Col>
      </Row>
    </>
  )
}
```

**Validation:**
- ✅ Charts render inside Ant Design Cards
- ✅ Date range picker updates chart data
- ✅ Responsive grid (2 cols desktop, 1 col mobile)

---

### Task 4.6: Migrate Reports/Moderation Pages (2 hours)

**Similar to Users page, with additional columns:**
- Reporter info
- Reported user info
- Report reason
- Status (PENDING, REVIEWING, RESOLVED, REJECTED)
- Actions (View details, Approve, Reject)

**Add detail drawer for viewing report details**

```tsx
<Drawer
  title="Report Details"
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  width={600}
>
  <Descriptions column={1}>
    <Descriptions.Item label="Reporter">{report.reporter.name}</Descriptions.Item>
    <Descriptions.Item label="Reported User">{report.reportedUser.name}</Descriptions.Item>
    <Descriptions.Item label="Reason">{report.reason}</Descriptions.Item>
    <Descriptions.Item label="Status">
      <StatusBadge status={report.status} colorMap={REPORT_STATUS_COLORS} />
    </Descriptions.Item>
  </Descriptions>

  <Space style={{ marginTop: 24 }}>
    <Button type="primary" onClick={() => handleApprove(report.id)}>
      Approve
    </Button>
    <Button danger onClick={() => handleReject(report.id)}>
      Reject
    </Button>
  </Space>
</Drawer>
```

**Validation:**
- ✅ Drawer opens with report details
- ✅ Approve/Reject buttons work
- ✅ Status updates in table after action

---

### Task 4.7: Polish & Cross-Page Testing (1 hour)

**Global Checks:**
1. ✅ All pages use AdminLayout
2. ✅ All pages have PageHeader with icon + title
3. ✅ All forms use Ant Design validation (no Zod imports)
4. ✅ All tables have loading states
5. ✅ All mutations show success/error messages
6. ✅ All pages responsive (mobile, tablet, desktop)
7. ✅ Breadcrumbs update correctly on each page
8. ✅ Sidebar highlights current page

**Performance Checks:**
1. ✅ No console errors
2. ✅ No hydration warnings
3. ✅ Tables render quickly (< 1s)
4. ✅ Modals open/close smoothly
5. ✅ Filters don't cause jank

**Accessibility Checks:**
1. ✅ Buttons have aria-labels (built-in with Ant Design)
2. ✅ Forms keyboard navigable (tab through fields)
3. ✅ Tooltips readable
4. ✅ Focus states visible

---

## Phase 4 Validation Checklist

Before moving to Phase 5, verify:

- ✅ **Pages Migrated**
  - Login page (Ant Design Form + validation)
  - Dashboard home (Statistics cards)
  - Users management (Full CRUD)
  - Roles management (Full CRUD)
  - Statistics pages (Charts integration)
  - Reports/Moderation (Complex tables + drawer)

- ✅ **Features Working**
  - All CRUD operations (create, read, update, delete)
  - All forms validate correctly (required, email, min length, etc.)
  - All tables paginate, sort, filter
  - All modals open/close, reset properly
  - All notifications appear (success, error)

- ✅ **Dependencies Removed**
  - No `react-hook-form` imports
  - No `zod` imports
  - No `zodResolver` usage
  - No Tailwind classes (or very minimal)

- ✅ **Consistency**
  - All pages use PageHeader
  - All pages use FilterBar (if filters exist)
  - All pages use StatusBadge for status
  - All pages use TableActions for table actions
  - All pages use FormModal for forms
  - All pages use App.useApp() for notifications

- ✅ **Responsive**
  - All pages work on mobile (< 768px)
  - All pages work on tablet (768-1024px)
  - All pages work on desktop (> 1024px)
  - FilterBar switches to drawer on mobile
  - Tables scroll horizontally on mobile

- ✅ **Performance**
  - No console errors or warnings
  - Pages load in < 2s
  - Tables render smoothly
  - Modals open/close without jank

---

## Common Issues & Solutions

### Issue 1: Form not resetting after submit
**Cause:** Missing form.resetFields() or destroyOnClose  
**Solution:** Add destroyOnClose to Modal, call form.resetFields() in onCancel

### Issue 2: Table not reloading after mutation
**Cause:** React Query cache not invalidated  
**Solution:** Call queryClient.invalidateQueries(['users']) in mutation onSuccess

### Issue 3: Validation not showing errors
**Cause:** Form.Item name doesn't match field  
**Solution:** Verify Form.Item `name` prop matches the field name in validation rules

### Issue 4: Debounced search not working
**Cause:** Using `search` instead of `debouncedSearch` in query  
**Solution:** Pass `debouncedSearch` to query, not `search`

### Issue 5: Mobile table horizontal scroll broken
**Cause:** Table not wrapped in scrollable container  
**Solution:** Add scroll={{ x: 'max-content' }} to Table component

---

## Estimated Time Breakdown

| Task | Time | Cumulative |
|------|------|------------|
| 4.1 Login page | 1.5h | 1.5h |
| 4.2 Dashboard home | 1.5h | 3h |
| 4.3 Users management | 2h | 5h |
| 4.4 Roles management | 2h | 7h |
| 4.5 Statistics pages | 2h | 9h |
| 4.6 Reports/Moderation | 2h | 11h |
| 4.7 Polish & testing | 1h | **12h** |

---

## Next Steps

Once Phase 4 is complete and validated:
- ✅ Proceed to **Phase 5: Advanced Patterns** (bulk actions, RBAC, optimization)
- ✅ Commit changes: `git add . && git commit -m "feat: Phase 4 - Migrate all pages to Ant Design"`
- ✅ Test thoroughly: Create, edit, delete on each page
- ✅ Take screenshots for documentation

---

## References

- [Ant Design Form Component](https://ant.design/components/form)
- [Ant Design Table Component](https://ant.design/components/table)
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Project UI Rules - Page Layout](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md#3-page-layout-pattern-crud-pages)
