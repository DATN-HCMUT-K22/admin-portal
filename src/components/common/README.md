# Common Component Patterns

Reusable Ant Design components and hooks for the admin dashboard.

## PageHeader

Page title with icon, subtitle, and action buttons.

```tsx
import { PageHeader } from '@/components/common/PageHeader'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

<PageHeader
  icon={<UserOutlined />}
  title="Users Management"
  subtitle="Manage admin users and permissions"
  extra={
    <Button type="primary" icon={<PlusOutlined />}>
      Add User
    </Button>
  }
/>
```

## StatusBadge

Colored status badges using predefined color mappings.

```tsx
import { StatusBadge } from '@/components/common/StatusBadge'
import { USER_STATUS_COLORS } from '@/constants/status-colors'

<StatusBadge
  status={user.status}
  colorMap={USER_STATUS_COLORS}
/>
```

## FilterBar

Responsive filter bar (inline on desktop, drawer on mobile).

```tsx
import { FilterBar } from '@/components/common/FilterBar'

<FilterBar onClear={handleClearFilters} activeFilterCount={2}>
  <FilterBar.Search
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ width: 200 }}
  />
  <FilterBar.Select
    placeholder="Status"
    value={status}
    onChange={setStatus}
    options={[
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
    ]}
  />
</FilterBar>
```

## TableActions

Action buttons for table rows (view, edit, delete with confirmation).

```tsx
import { TableActions } from '@/components/common/TableActions'

{
  title: 'Actions',
  key: 'actions',
  render: (_, record) => (
    <TableActions
      onView={() => router.push(`/dashboard/users/${record.id}`)}
      onEdit={() => handleEdit(record)}
      onDelete={() => handleDelete(record.id)}
      deleteConfirmTitle={`Delete user "${record.name}"?`}
    />
  ),
}
```

## LoadingStates

Loading indicators for different scenarios.

```tsx
import { PageLoading, CardSkeleton, TableSkeleton, ContentLoading } from '@/components/common/LoadingStates'

// Full page
if (isLoading) return <PageLoading />

// Card placeholder
{isLoading ? <CardSkeleton /> : <Card>{content}</Card>}

// Table with loading state
<Table loading={isLoading} dataSource={data} columns={columns} />

// Content section
<ContentLoading tip="Loading data..." />
```

## FormModal

Modal with form for create/edit operations.

```tsx
import { FormModal } from '@/components/common/FormModal'
import { Form, Input } from 'antd'

const [form] = Form.useForm()
const [open, setOpen] = useState(false)

<FormModal
  open={open}
  onCancel={() => setOpen(false)}
  onSubmit={handleSubmit}
  title="Create User"
  form={form}
  editMode={false}
>
  <Form.Item
    label="Name"
    name="name"
    rules={[{ required: true, message: 'Name is required' }]}
  >
    <Input placeholder="Enter name" />
  </Form.Item>
</FormModal>
```

## useDebounce Hook

Debounce search inputs to reduce API calls.

```tsx
import { useDebounce } from '@/hooks/useDebounce'
import { useState, useEffect } from 'react'

const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useEffect(() => {
  if (debouncedSearch) {
    // API call with debouncedSearch
  }
}, [debouncedSearch])
```

## Table Pattern Example

Complete CRUD table with all patterns combined.

```tsx
'use client'

import { Card, Table } from 'antd'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from '@/components/common/FilterBar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableActions } from '@/components/common/TableActions'
import { USER_STATUS_COLORS } from '@/constants/status-colors'

export default function UsersPage() {
  const { data, isLoading } = useQuery(['users'])

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <StatusBadge status={status} colorMap={USER_STATUS_COLORS} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <TableActions
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record.id)}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        icon={<UserOutlined />}
        title="Users"
        extra={<Button type="primary" icon={<PlusOutlined />}>Add User</Button>}
      />

      <Card>
        <FilterBar>
          <FilterBar.Search placeholder="Search users..." />
        </FilterBar>

        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  )
}
```
