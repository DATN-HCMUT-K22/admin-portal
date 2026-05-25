# Phase 3: Component Patterns

**Effort:** 8 hours  
**Priority:** High (Blocks Phase 4 page migration)  
**Complexity:** Medium  
**Blocked by:** Phase 1  
**Can parallel with:** Phase 2 (some overlap possible)

---

## Objectives

Create reusable component patterns and hooks that will be used across all dashboard pages. These patterns follow the UI rules document and establish consistency.

---

## Tasks

### Task 3.1: Create PageHeader Component (45 min)

Create `src/components/common/PageHeader.tsx`:

```tsx
import { Space, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Title } = Typography

interface PageHeaderProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  extra?: ReactNode
}

export function PageHeader({ icon, title, subtitle, extra }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        padding: '16px 0',
      }}
    >
      <Space size="middle">
        {icon && <span style={{ fontSize: 24, color: '#2563eb' }}>{icon}</span>}
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              {subtitle}
            </Typography.Text>
          )}
        </div>
      </Space>
      {extra && <div>{extra}</div>}
    </div>
  )
}
```

**Usage Example:**
```tsx
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

**Validation:**
- ✅ Renders icon + title + subtitle
- ✅ Extra actions render on right side
- ✅ Responsive layout (wraps on mobile)
- ✅ Proper spacing and typography

---

### Task 3.2: Create StatusBadge Component (30 min)

Create `src/components/common/StatusBadge.tsx`:

```tsx
import { Tag } from 'antd'
import { STATUS_LABELS } from '@/constants/status-colors'

interface StatusBadgeProps {
  status: string
  colorMap: Record<string, string>
  showLabel?: boolean
}

export function StatusBadge({ 
  status, 
  colorMap,
  showLabel = true 
}: StatusBadgeProps) {
  const color = colorMap[status] || 'default'
  const label = showLabel ? (STATUS_LABELS[status] || status) : status
  
  return (
    <Tag color={color} style={{ borderRadius: 6, padding: '2px 12px' }}>
      {label}
    </Tag>
  )
}
```

**Usage Example:**
```tsx
import { USER_STATUS_COLORS } from '@/constants/status-colors'

<StatusBadge 
  status={user.status} 
  colorMap={USER_STATUS_COLORS} 
/>
```

**Validation:**
- ✅ Accepts any status + colorMap
- ✅ Shows correct color for each status
- ✅ Uses labels from STATUS_LABELS constant
- ✅ Handles unknown status gracefully (default color)

---

### Task 3.3: Create useDebounce Hook (30 min)

Create `src/hooks/useDebounce.ts`:

```typescript
import { useEffect, useState } from 'react'

/**
 * Debounce hook for search inputs
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 * 
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 * 
 * useEffect(() => {
 *   // API call with debouncedSearch
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**Alternative: debounce function (if prefer lodash-style)**

Create `src/utils/debounce.ts`:

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}
```

**Usage Example:**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from 'antd'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchComponent() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    if (debouncedSearch) {
      // Call API with debouncedSearch
      console.log('Searching for:', debouncedSearch)
    }
  }, [debouncedSearch])

  return (
    <Input.Search
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ width: 200 }}
    />
  )
}
```

**Validation:**
- ✅ Hook delays value update by 300ms
- ✅ Typing rapidly only triggers once (after user stops)
- ✅ Cancels previous timeout when value changes
- ✅ Works with any type (string, number, etc.)

---

### Task 3.4: Create FilterBar Component (2 hours)

Create `src/components/common/FilterBar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Space, Input, Select, DatePicker, Button, Drawer, Grid, Badge } from 'antd'
import { FilterOutlined, CloseOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

const { RangePicker } = DatePicker
const { useBreakpoint } = Grid

interface FilterBarProps {
  children: ReactNode
  onClear?: () => void
  activeFilterCount?: number
}

export function FilterBar({ children, onClear, activeFilterCount = 0 }: FilterBarProps) {
  const screens = useBreakpoint()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = !screens.md

  const FilterContent = () => (
    <>
      {children}
      {onClear && activeFilterCount > 0 && (
        <Button icon={<CloseOutlined />} onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </>
  )

  if (isMobile) {
    // Mobile: Drawer filters
    return (
      <>
        <Button
          icon={<FilterOutlined />}
          onClick={() => setDrawerOpen(true)}
          style={{ marginBottom: 16 }}
        >
          Filters
          {activeFilterCount > 0 && (
            <Badge
              count={activeFilterCount}
              style={{ marginLeft: 8, backgroundColor: '#2563eb' }}
            />
          )}
        </Button>
        
        <Drawer
          title="Filters"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={320}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <FilterContent />
          </Space>
        </Drawer>
      </>
    )
  }

  // Desktop: Inline filters
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa',
      }}
    >
      <Space wrap size="middle">
        <FilterContent />
      </Space>
    </div>
  )
}

// Re-export sub-components for easier usage
FilterBar.Search = Input.Search
FilterBar.Select = Select
FilterBar.RangePicker = RangePicker
```

**Usage Example:**
```tsx
<FilterBar onClear={handleClearFilters} activeFilterCount={activeFilters}>
  <FilterBar.Search
    placeholder="Search by name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{ width: 200 }}
  />
  
  <FilterBar.Select
    placeholder="Status"
    value={statusFilter}
    onChange={setStatusFilter}
    allowClear
    style={{ width: 150 }}
    options={[
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
    ]}
  />
  
  <FilterBar.RangePicker
    value={dateRange}
    onChange={setDateRange}
  />
</FilterBar>
```

**Validation:**
- ✅ Desktop (>= 768px): Filters render inline
- ✅ Mobile (< 768px): Filters render in drawer
- ✅ Badge shows active filter count
- ✅ Clear button only shows when filters active
- ✅ Drawer opens/closes smoothly on mobile

---

### Task 3.5: Create Table Action Pattern (1 hour)

Create `src/components/common/TableActions.tsx`:

```tsx
import { Space, Button, Tooltip, Popconfirm, App } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

interface TableActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  deleteConfirmTitle?: string
  viewTooltip?: string
  editTooltip?: string
  deleteTooltip?: string
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  deleteConfirmTitle = 'Are you sure you want to delete this item?',
  viewTooltip = 'View',
  editTooltip = 'Edit',
  deleteTooltip = 'Delete',
}: TableActionsProps) {
  return (
    <Space size="small">
      {onView && (
        <Tooltip title={viewTooltip}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={onView}
          />
        </Tooltip>
      )}
      
      {onEdit && (
        <Tooltip title={editTooltip}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={onEdit}
          />
        </Tooltip>
      )}
      
      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <Popconfirm
            title={deleteConfirmTitle}
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Tooltip>
      )}
    </Space>
  )
}
```

**Usage in Table Column:**
```tsx
{
  title: 'Actions',
  key: 'actions',
  width: 150,
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

**Validation:**
- ✅ Renders 1-3 action buttons based on props
- ✅ Tooltips appear on hover
- ✅ Delete shows confirmation popover
- ✅ Buttons styled correctly (text type, icon only)

---

### Task 3.6: Create Loading States Components (45 min)

Create `src/components/common/LoadingStates.tsx`:

```tsx
import { Spin, Skeleton, Card, Table } from 'antd'
import type { SkeletonProps } from 'antd'

// Full page loading
export function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  )
}

// Card skeleton
export function CardSkeleton(props: SkeletonProps) {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 4 }} {...props} />
    </Card>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <Skeleton active paragraph={{ rows }} />
    </Card>
  )
}

// Inline content loading (for sections)
export function ContentLoading({ tip = 'Loading...' }: { tip?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Spin size="large" tip={tip} />
    </div>
  )
}
```

**Usage Example:**
```tsx
// Full page
if (isLoading) return <PageLoading />

// Card placeholder
{isLoading ? <CardSkeleton /> : <Card>{content}</Card>}

// Table with loading
<Table loading={isLoading} dataSource={data} columns={columns} />

// Content section
<Spin spinning={isUpdating}>
  <Form>{fields}</Form>
</Spin>
```

**Validation:**
- ✅ PageLoading centered vertically and horizontally
- ✅ CardSkeleton shows placeholder rows
- ✅ TableSkeleton matches table layout
- ✅ Spin component shows loading indicator

---

### Task 3.7: Create Form in Modal Pattern (1.5 hours)

Create `src/components/common/FormModal.tsx`:

```tsx
'use client'

import { Modal, Form, Button, Space, App } from 'antd'
import type { FormInstance } from 'antd'
import { ReactNode, useEffect } from 'react'

interface FormModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (values: any) => Promise<void>
  title: string
  form: FormInstance
  children: ReactNode
  width?: number
  editMode?: boolean
  initialValues?: any
}

export function FormModal({
  open,
  onCancel,
  onSubmit,
  title,
  form,
  children,
  width = 600,
  editMode = false,
  initialValues,
}: FormModalProps) {
  const { message } = App.useApp()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues)
    } else if (!open) {
      form.resetFields()
    }
  }, [open, form, initialValues])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit(values)
      message.success(`${editMode ? 'Updated' : 'Created'} successfully`)
      form.resetFields()
      onCancel()
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error - handled by Form.Item
        return
      }
      // API error
      message.error(error.message || 'Operation failed')
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={title}
      width={width}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {children}

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
```

**Usage Example:**
```tsx
'use client'

import { useState } from 'react'
import { Form, Input, Switch } from 'antd'
import { FormModal } from '@/components/common/FormModal'

export function UserManagement() {
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const handleSubmit = async (values: any) => {
    if (editMode) {
      await updateUser(editingUser.id, values)
    } else {
      await createUser(values)
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setEditMode(true)
    setModalOpen(true)
  }

  return (
    <>
      <Button onClick={() => { setEditMode(false); setModalOpen(true) }}>
        Add User
      </Button>

      <FormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editMode ? 'Edit User' : 'Create User'}
        form={form}
        editMode={editMode}
        initialValues={editMode ? editingUser : undefined}
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
          label="Active"
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
- ✅ Modal opens/closes smoothly
- ✅ Form resets when modal closes
- ✅ Validation errors show on fields
- ✅ Submit button shows loading state (built-in)
- ✅ Success message appears after submit
- ✅ Edit mode populates form with initial values

---

### Task 3.8: Document Table Pattern (30 min)

Create `src/components/common/README.md` with table usage pattern:

```markdown
# Common Component Patterns

## Table with Pagination, Sorting, and Actions

### Basic Table Pattern

\`\`\`tsx
'use client'

import { Card, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { TableActions } from '@/components/common/TableActions'
import { StatusBadge } from '@/components/common/StatusBadge'
import { USER_STATUS_COLORS } from '@/constants/status-colors'

interface User {
  id: string
  name: string
  email: string
  status: string
  createdAt: string
}

export function UsersTable() {
  const { data, isLoading } = useQuery(['users'])

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <StatusBadge status={status} colorMap={USER_STATUS_COLORS} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <TableActions
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record.id)}
        />
      ),
    },
  ]

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} items`,
          showSizeChanger: true,
        }}
      />
    </Card>
  )
}
\`\`\`

### With Server-Side Pagination

\`\`\`tsx
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(10)

const { data, isLoading } = useQuery(['users', page, pageSize], () =>
  fetchUsers({ page, pageSize })
)

<Table
  pagination={{
    current: page,
    pageSize: pageSize,
    total: data?.total || 0,
    onChange: (newPage, newPageSize) => {
      setPage(newPage)
      setPageSize(newPageSize)
    },
    showTotal: (total) => `Total ${total} items`,
    showSizeChanger: true,
  }}
/>
\`\`\`
```

**Validation:**
- ✅ README created with comprehensive examples
- ✅ Includes both client-side and server-side pagination
- ✅ Shows proper TypeScript types
- ✅ Demonstrates integration with React Query

---

## Phase 3 Validation Checklist

Before moving to Phase 4, verify:

- ✅ **Components Created**
  - `src/components/common/PageHeader.tsx`
  - `src/components/common/StatusBadge.tsx`
  - `src/components/common/FilterBar.tsx`
  - `src/components/common/TableActions.tsx`
  - `src/components/common/LoadingStates.tsx`
  - `src/components/common/FormModal.tsx`
  - `src/components/common/README.md`

- ✅ **Hooks Created**
  - `src/hooks/useDebounce.ts`

- ✅ **Component Functionality**
  - PageHeader: Icon + title + subtitle + extra actions
  - StatusBadge: Accepts any colorMap, shows correct colors
  - FilterBar: Responsive (inline desktop, drawer mobile)
  - TableActions: View/Edit/Delete with tooltips + popconfirm
  - LoadingStates: Page/Card/Table skeletons
  - FormModal: Create/edit modes, validation, auto-reset

- ✅ **Hook Functionality**
  - useDebounce: Delays value by 300ms, cancels previous timeout

- ✅ **Documentation**
  - README with table pattern examples
  - TypeScript types included
  - React Query integration examples

- ✅ **Testing**
  - All components render without errors
  - Responsive behavior works (FilterBar drawer on mobile)
  - Form validation works (required, email, min length)
  - Debounce delays search correctly

---

## Common Issues & Solutions

### Issue 1: FilterBar drawer not opening on mobile
**Cause:** `screens.md` check not working  
**Solution:** Verify `Grid.useBreakpoint()` imported from 'antd', component is 'use client'

### Issue 2: FormModal not resetting fields
**Cause:** `destroyOnClose` not set or form.resetFields() not called  
**Solution:** Add `destroyOnClose` prop to Modal, call form.resetFields() in useEffect

### Issue 3: Table actions tooltip position wrong
**Cause:** Tooltip placement not specified  
**Solution:** Add `placement="top"` or `placement="left"` to Tooltip

### Issue 4: StatusBadge showing wrong colors
**Cause:** Incorrect colorMap passed  
**Solution:** Verify using correct constant (USER_STATUS_COLORS, REPORT_STATUS_COLORS, etc.)

### Issue 5: Debounce not working
**Cause:** Using value directly instead of debounced value  
**Solution:** Use `const debouncedSearch = useDebounce(search, 300)` and trigger API with debouncedSearch

---

## Estimated Time Breakdown

| Task | Time | Cumulative |
|------|------|------------|
| 3.1 PageHeader component | 45 min | 45 min |
| 3.2 StatusBadge component | 30 min | 1h 15min |
| 3.3 useDebounce hook | 30 min | 1h 45min |
| 3.4 FilterBar component | 2h | 3h 45min |
| 3.5 TableActions pattern | 1h | 4h 45min |
| 3.6 Loading states | 45 min | 5h 30min |
| 3.7 FormModal pattern | 1.5h | 7h |
| 3.8 Document patterns | 30 min | 7h 30min |
| Testing & validation | 30 min | **8h** |

---

## Next Steps

Once Phase 3 is complete and validated:
- ✅ Proceed to **Phase 4: Page Migration** (requires Phase 2 + 3)
- ✅ Commit changes: `git add . && git commit -m "feat: Phase 3 - Reusable component patterns"`
- ✅ Start migrating actual pages using these patterns

---

## References

- [Ant Design Components Overview](https://ant.design/components/overview/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Project UI Rules - Component Patterns](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md#4-component-patterns)
