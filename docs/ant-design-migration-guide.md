# Ant Design Migration Guide

Step-by-step guide for migrating existing pages from Tailwind CSS + React Hook Form to Ant Design v6.

## ⚡ Tailwind CSS Re-Integration (2026-05-20)

**Status:** ✅ Integrated

This project now uses **both** Ant Design and Tailwind CSS together:
- **Ant Design:** UI components (buttons, forms, tables, modals)
- **Tailwind CSS:** Utility classes (layout, spacing, responsive design)

**New Documentation:**
- [Tailwind + Ant Design Integration](/docs/tailwind-antd-integration.md)
- [Tailwind Usage Guide](/docs/tailwind-usage-guide.md)

**Quick Example:**
```tsx
import { Card, Button } from 'antd'

// Use Tailwind for layout, Ant Design for components
<div className="p-6 space-y-4">
  <Card>
    <div className="flex justify-between items-center">
      <h2>Title</h2>
      <Button type="primary">Action</Button>
    </div>
  </Card>
</div>
```

---

## Overview

**Status:** Phases 1-3 Complete, Phase 4 In Progress
- ✅ Foundation setup (Ant Design installed, theme configured)
- ✅ Layout architecture (AdminLayout with sidebar/header)
- ✅ Component patterns (reusable components created)
- 🔄 Page migration (reference example complete, systematic migration in progress)
- ✅ Tailwind CSS re-integrated (2026-05-20) for utility classes

## Migration Checklist (Per Page)

For each page to migrate:

1. [ ] Remove Tailwind utility classes
2. [ ] Remove React Hook Form imports and `useForm`
3. [ ] Remove Zod schemas (unless used for API types)
4. [ ] Replace with Ant Design components
5. [ ] Add Ant Design Form with validation rules
6. [ ] Use common patterns (PageHeader, FilterBar, TableActions)
7. [ ] Add loading states (Spin, Skeleton)
8. [ ] Wire up App.useApp() for notifications
9. [ ] Test functionality (CRUD operations)
10. [ ] Test responsive behavior (mobile/tablet/desktop)

## Reference Example: Dashboard Home Page

**Before (Tailwind):**
```tsx
import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li>
          <Link href="/dashboard/users" className="block rounded-xl border p-4">
            <span className="font-medium">Users</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
```

**After (Ant Design):**
```tsx
import { Card, Row, Col } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardOutlined, UserOutlined } from "@ant-design/icons";

export default function DashboardHomePage() {
  return (
    <>
      <PageHeader
        icon={<DashboardOutlined />}
        title="Dashboard"
        subtitle="Select a module to get started"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Link href="/dashboard/users">
            <Card hoverable>
              <UserOutlined style={{ fontSize: 24 }} />
              <div style={{ fontWeight: 600 }}>Users</div>
            </Card>
          </Link>
        </Col>
      </Row>
    </>
  );
}
```

## Common Migration Patterns

### 1. Layout & Spacing

**Before:**
```tsx
<div className="mx-auto max-w-3xl space-y-6 p-6">
```

**After:**
```tsx
<div style={{ maxWidth: 1200, margin: '0 auto' }}>
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
```

### 2. Typography

**Before:**
```tsx
<h1 className="text-2xl font-semibold">Title</h1>
<p className="text-muted-foreground">Description</p>
```

**After:**
```tsx
<Typography.Title level={2}>Title</Typography.Title>
<Typography.Text type="secondary">Description</Typography.Text>
```

Or use PageHeader:
```tsx
<PageHeader title="Title" subtitle="Description" />
```

### 3. Grid Layout

**Before:**
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>
```

**After:**
```tsx
<Row gutter={[16, 16]}>
  {items.map(item => (
    <Col key={item.id} xs={24} sm={12} lg={8}>
      {item.name}
    </Col>
  ))}
</Row>
```

### 4. Cards

**Before:**
```tsx
<div className="rounded-xl border border-border bg-card p-4">
  Content
</div>
```

**After:**
```tsx
<Card>
  Content
</Card>
```

### 5. Forms (React Hook Form → Ant Design Form)

**Before:**
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '' }
})

<form onSubmit={form.handleSubmit(onSubmit)}>
  <input {...form.register('name')} />
  <button type="submit">Submit</button>
</form>
```

**After:**
```tsx
const [form] = Form.useForm()

const handleSubmit = async (values) => {
  await apiCall(values)
  message.success('Saved successfully')
}

<Form form={form} onFinish={handleSubmit} layout="vertical">
  <Form.Item
    label="Name"
    name="name"
    rules={[{ required: true, message: 'Name is required' }]}
  >
    <Input placeholder="Enter name" />
  </Form.Item>
  <Button type="primary" htmlType="submit">Submit</Button>
</Form>
```

### 6. Tables

**Before:**
```tsx
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {data.map(row => (
      <tr key={row.id}>
        <td>{row.name}</td>
        <td>
          <button onClick={() => handleDelete(row.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```tsx
import { Table } from 'antd'
import { TableActions } from '@/components/common/TableActions'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <TableActions
        onEdit={() => handleEdit(record)}
        onDelete={() => handleDelete(record.id)}
      />
    ),
  },
]

<Table
  columns={columns}
  dataSource={data}
  loading={isLoading}
  rowKey="id"
  pagination={{ pageSize: 10 }}
/>
```

### 7. Modals & Dialogs

**Before:**
```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black/50">
    <div className="modal-content">
      <h2>Title</h2>
      <form>...</form>
    </div>
  </div>
)}
```

**After:**
```tsx
import { FormModal } from '@/components/common/FormModal'

<FormModal
  open={isOpen}
  onCancel={() => setIsOpen(false)}
  onSubmit={handleSubmit}
  title="Create Item"
  form={form}
>
  <Form.Item name="field">
    <Input />
  </Form.Item>
</FormModal>
```

### 8. Loading States

**Before:**
```tsx
{isLoading && <div className="animate-spin">Loading...</div>}
```

**After:**
```tsx
import { Spin, Skeleton } from 'antd'

// Inline loading
<Spin spinning={isLoading}>
  <Content />
</Spin>

// Page loading
if (isLoading) return <PageLoading />

// Skeleton placeholder
{isLoading ? <Skeleton active /> : <Content />}
```

### 9. Buttons

**Before:**
```tsx
<button className="rounded-lg bg-primary px-4 py-2 text-white">
  Submit
</button>
```

**After:**
```tsx
<Button type="primary">Submit</Button>
<Button>Cancel</Button>
<Button danger>Delete</Button>
<Button type="link">Link</Button>
```

### 10. Status Badges

**Before:**
```tsx
<span className="rounded bg-green-100 px-2 py-1 text-green-800">
  Active
</span>
```

**After:**
```tsx
import { StatusBadge } from '@/components/common/StatusBadge'
import { USER_STATUS_COLORS } from '@/constants/status-colors'

<StatusBadge status="ACTIVE" colorMap={USER_STATUS_COLORS} />
```

## Validation Rules (Zod → Ant Design)

### Basic Rules

| Zod | Ant Design |
|-----|------------|
| `z.string().min(3)` | `{ required: true, min: 3 }` |
| `z.string().email()` | `{ type: 'email' }` |
| `z.number().min(1).max(100)` | `{ type: 'number', min: 1, max: 100 }` |
| `z.string().regex(/^[A-Z]/)` | `{ pattern: /^[A-Z]/, message: '...' }` |

### Complex Validation

**Custom validator:**
```tsx
<Form.Item
  name="password"
  rules={[
    { required: true },
    {
      validator: (_, value) => {
        if (value && value.length < 8) {
          return Promise.reject('Password must be at least 8 characters')
        }
        return Promise.resolve()
      }
    }
  ]}
>
  <Input.Password />
</Form.Item>
```

**Dependent fields:**
```tsx
<Form.Item
  name="confirmPassword"
  dependencies={['password']}
  rules={[
    { required: true },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('password') === value) {
          return Promise.resolve()
        }
        return Promise.reject('Passwords do not match')
      }
    })
  ]}
>
  <Input.Password />
</Form.Item>
```

## Notifications & Messages

**Before:**
```tsx
import { toast } from '@/lib/toast'

toast.success('Saved!')
toast.error('Failed')
```

**After:**
```tsx
import { App } from 'antd'

const { message, modal } = App.useApp()

message.success('Saved successfully')
message.error('Operation failed')

modal.confirm({
  title: 'Confirm deletion',
  content: 'Are you sure?',
  onOk: () => handleDelete()
})
```

## Icons

**Before:**
```tsx
import { IconName } from 'lucide-react'

<IconName className="h-4 w-4" />
```

**After:**
```tsx
import { UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

<UserOutlined style={{ fontSize: 20, color: '#2563eb' }} />
```

## Responsive Design

Ant Design uses breakpoints: xs (< 576px), sm (≥ 576px), md (≥ 768px), lg (≥ 1024px), xl (≥ 1200px), xxl (≥ 1600px)

**Grid responsiveness:**
```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} lg={8}>
    {/* Full width on mobile, half on tablet, third on desktop */}
  </Col>
</Row>
```

**Conditional rendering:**
```tsx
import { Grid } from 'antd'

const { useBreakpoint } = Grid
const screens = useBreakpoint()

{screens.md ? <DesktopView /> : <MobileView />}
```

## Priority Order for Migration

1. **Dashboard Home** ✅ (Complete - reference example)
2. **Login Page** (Simple form, good starter)
3. **Users List** (CRUD example with table)
4. **User Detail** (Form with multiple fields)
5. **Roles Management** (Similar to users)
6. **Statistics Pages** (Charts integration)
7. **Reports/Moderation** (Complex tables)
8. **Business pages** (Locations, etc.)

## Testing Checklist

After migrating each page:

- [ ] Build succeeds (`npm run build`)
- [ ] Page renders without errors
- [ ] Forms submit correctly
- [ ] Validation works as expected
- [ ] Loading states appear during API calls
- [ ] Success/error messages display
- [ ] Table pagination works
- [ ] Actions (edit/delete) function correctly
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] No console errors or warnings

## Common Issues & Solutions

### Issue: Hydration mismatch
**Cause:** Server/client render mismatch
**Solution:** Use `'use client'` directive for client-only features

### Issue: Form not resetting after submit
**Cause:** Missing form.resetFields()
**Solution:** Call `form.resetFields()` in onFinish callback

### Issue: Table not updating after delete
**Cause:** React Query cache not invalidated
**Solution:** Call `queryClient.invalidateQueries()` after mutation

### Issue: Icons not rendering
**Cause:** Wrong import path
**Solution:** Import from `@ant-design/icons`, not `antd`

### Issue: Styles not applying in SSR
**Cause:** Missing AntdRegistry
**Solution:** Ensure `@ant-design/nextjs-registry` wraps app in layout

## Resources

- [Ant Design Components](https://ant.design/components/overview/)
- [Ant Design Form](https://ant.design/components/form/)
- [Ant Design Table](https://ant.design/components/table/)
- [Project Theme Config](/src/config/theme.ts)
- [Component Patterns](/src/components/common/README.md)
- [Status Color Constants](/src/constants/status-colors.ts)

## Next Steps

1. Continue migrating pages following the priority order
2. Test each page thoroughly before moving to the next
3. Document any new patterns discovered
4. Update this guide with additional examples as needed

---

**Last Updated:** 2026-05-20
**Phases Complete:** 1 (Foundation), 2 (Layout), 3 (Patterns), 4 (Partial)
