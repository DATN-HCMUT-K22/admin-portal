# Ant Design Admin UI Rules - Tổng Quát

> Quy tắc thiết kế UI cho admin system sử dụng Ant Design v6. Có thể áp dụng cho bất kỳ business domain nào.

**Implementation Status (2026-05-21):**
- ✅ Foundation: Ant Design v6.4.3 configured with custom theme
- ✅ Tailwind CSS: v4.3.0 integrated for utility classes (layout, spacing)
- ✅ Layout: AdminLayout with dark sidebar + glassmorphism header implemented
- ✅ Components: Reusable patterns created (PageHeader, StatusBadge, FilterBar, TableActions, FormModal, LoadingStates)
- 🔄 Pages: Migration in progress (reference example complete, see [Migration Guide](./ant-design-migration-guide.md))

**Styling Approach:**
This project uses a **hybrid styling system**:
- **Ant Design v6:** UI components (buttons, forms, tables, modals)
- **Tailwind CSS v4:** Utility classes (layout, spacing, responsive design)
- See [Tailwind Integration Guide](./tailwind-antd-integration.md) for details

**Next.js 16 App Router Notes:**
- Uses `@ant-design/nextjs-registry` for CSS-in-JS SSR support
- All layout components are client components (`'use client'` directive)
- Server components can use Ant Design for static rendering
- ConfigProvider wraps app at root level for theme consistency

## Mục Lục

- [Tailwind CSS Integration](#tailwind-css-integration)
- [1. Design System Foundation](#1-design-system-foundation)
- [2. Layout Patterns](#2-layout-patterns)
- [3. Page Layout Pattern](#3-page-layout-pattern-crud-pages)
- [4. Component Patterns](#4-component-patterns)
- [5. Form Validation Rules](#5-form-validation-rules)
- [6. Notification Patterns](#6-notification-patterns)
- [7. Loading States](#7-loading-states)
- [8. Theme Customization](#8-theme-customization)
- [9. Responsive Design Rules](#9-responsive-design-rules)
- [10. Interactive Feedback](#10-interactive-feedback)
- [Tóm Tắt: 10 Rules Quan Trọng](#tóm-tắt-10-rules-quan-trọng)

---

## Tailwind CSS Integration

**Status:** ✅ Integrated (2026-05-21)  
**Version:** Tailwind CSS v4.3.0 + Ant Design v6.4.3

### When to Use Tailwind

Use Tailwind CSS utility classes for:
- **Layout:** `flex`, `grid`, `container`
- **Spacing:** `p-4`, `m-2`, `gap-4`, `space-y-4`
- **Responsive:** `hidden md:block`, `grid-cols-1 lg:grid-cols-3`
- **Sizing:** `w-full`, `max-w-4xl`, `min-h-screen`

### When to Use Ant Design

Use Ant Design components for:
- **All UI components:** Button, Card, Form, Input, Select, Table, Modal
- **Typography:** Typography.Title, Typography.Text
- **Icons:** @ant-design/icons
- **Colors:** Use theme colors via component props (e.g., `type="primary"`)

### Quick Example

```tsx
import { Card, Button } from 'antd'

// ✅ Good: Ant Design components + Tailwind layout
<div className="p-6 space-y-4">
  <Card>
    <div className="flex justify-between items-center">
      <h2>Title</h2>
      <Button type="primary">Action</Button>
    </div>
  </Card>
</div>

// ❌ Bad: Recreating Ant Design components with Tailwind
<div className="rounded-lg border border-gray-300 p-4">
  <button className="bg-blue-500 text-white px-4 py-2 rounded">
    Action
  </button>
</div>
```

### Documentation

- **Integration Guide:** [tailwind-antd-integration.md](./tailwind-antd-integration.md)
- **Usage Guide:** [tailwind-usage-guide.md](./tailwind-usage-guide.md)
- **Test Page:** `/test-integration` (verify integration works)

---

## 1. Design System Foundation

### Color System

```typescript
// Brand Colors
colorPrimary: '#2563eb'      // Blue-600 - actions, links, selected
colorSuccess: '#52c41a'      // Green - completed, approved
colorWarning: '#fa8c16'      // Orange - pending, attention
colorError: '#ff4d4f'        // Red - errors, critical
colorInfo: '#722ed1'         // Purple - special states

// Backgrounds
colorBgLayout: '#f8fafc'     // Light gray-blue
colorBgContainer: '#ffffff'  // White cards
colorBorder: '#e2e8f0'       // Borders
```

**Rule:** Lưu màu status trong constants, không hardcode trong component

```typescript
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'warning',
  REJECTED: 'error'
}
```

### Typography

```typescript
fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
fontSize: 14px              // Base
fontSizeHeading1: 32px
fontSizeHeading2: 26px
fontSizeHeading3: 20px
fontSizeHeading4: 16px

// Using Geist font family (current project font)
// Font loaded via Next.js font optimization
```

### Spacing System

```typescript
padding: 16px         // Default
paddingLG: 24px      // Cards, sections
paddingSM: 12px      // Compact areas
paddingXS: 8px       // Minimal
```

### Border & Shadows

```typescript
borderRadius: 12px           // Default
borderRadiusLG: 16px        // Cards
borderRadiusSM: 8px
borderRadiusXS: 6px

// Soft shadows
boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)'
boxShadowSecondary: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)'
```

---

## 2. Layout Patterns

### Admin Layout Structure

```tsx
<Layout style={{ minHeight: '100vh' }}>
  {/* Sidebar - Dark Theme */}
  <Sider
    width={240}
    collapsedWidth={80}
    breakpoint="lg"
    theme="dark"
    style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50
    }}
  >
    <Logo height={64} />
    <Menu
      mode="inline"
      theme="dark"
      items={menuItems}
    />
  </Sider>

  <Layout style={{ marginLeft: siderCollapsed ? 80 : 240 }}>
    {/* Header - Sticky + Glassmorphism */}
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <MenuToggle />
      <Breadcrumb />
      <UserDropdown />
    </Header>

    {/* Content */}
    <Content style={{ padding: '8px 24px', minHeight: 'calc(100vh - 64px)' }}>
      {children}
    </Content>
  </Layout>
</Layout>
```

### Responsive Breakpoints

```typescript
const MOBILE_BREAKPOINT = 768   // Mobile drawer only
const TABLET_BREAKPOINT = 1024  // Auto-collapse sidebar

// Usage
const screens = Grid.useBreakpoint()
const isMobile = !screens.md
```

---

## 3. Page Layout Pattern (CRUD Pages)

### Standard List Page

```tsx
<>
  <PageHeader icon={icon} title="Page Title" />
  
  <Card styles={{ body: { padding: 0 } }}>
    {/* Status Tabs */}
    <Tabs activeKey={status} onChange={setStatus}>
      <TabPane key="all" tab={<Badge count={counts.all}>All</Badge>} />
      <TabPane key="active" tab={<Badge count={counts.active}>Active</Badge>} />
      <TabPane key="inactive" tab={<Badge count={counts.inactive}>Inactive</Badge>} />
    </Tabs>

    {/* Filter Bar */}
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
      <Space wrap>
        <Input.Search
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Filter by type"
          value={filterType}
          onChange={setFilterType}
          allowClear
          style={{ width: 150 }}
        >
          {/* options */}
        </Select>
        <DatePicker.RangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        {hasActiveFilters && (
          <Button icon={<CloseOutlined />} onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </Space>
    </div>

    {/* Data Table */}
    <Table
      columns={columns}
      dataSource={data}
      loading={isLoading}
      pagination={{
        current: page,
        pageSize: PAGE_SIZE,
        total: totalCount,
        onChange: setPage,
        showTotal: (total) => `Total ${total} items`
      }}
    />
  </Card>

  {/* CRUD Modal */}
  <Modal
    open={modalOpen}
    onCancel={() => setModalOpen(false)}
    footer={null}
  >
    <Form form={form} onFinish={handleSubmit}>
      {/* form fields */}
    </Form>
  </Modal>
</>
```

---

## 4. Component Patterns

### Pattern 1: Form in Modal/Drawer

```tsx
<Modal
  open={open}
  onCancel={onCancel}
  title={editMode ? 'Edit' : 'Create'}
  footer={null}
  destroyOnClose
>
  <Form
    form={form}
    layout="vertical"
    onFinish={handleSubmit}
  >
    <Form.Item
      label="Name"
      name="name"
      rules={[
        { required: true, message: 'Required field' },
        { min: 3, message: 'Min 3 characters' }
      ]}
    >
      <Input placeholder="Enter name" />
    </Form.Item>

    <Form.Item
      label="Status"
      name="isActive"
      valuePropName="checked"
    >
      <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
    </Form.Item>

    <Form.Item>
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          {editMode ? 'Update' : 'Create'}
        </Button>
      </Space>
    </Form.Item>
  </Form>
</Modal>
```

### Pattern 2: Responsive Filter (Desktop Inline + Mobile Drawer)

```tsx
const FilterBar = ({ filters, onChange, onClear }) => {
  const screens = Grid.useBreakpoint()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const FilterFields = () => (
    <>
      <Form.Item name="search" noStyle>
        <Input.Search placeholder="Search..." style={{ width: 200 }} />
      </Form.Item>
      <Form.Item name="status" noStyle>
        <Select placeholder="Status" allowClear style={{ width: 150 }} />
      </Form.Item>
      <Button icon={<CloseOutlined />} onClick={onClear}>
        Clear
      </Button>
    </>
  )

  if (screens.md) {
    // Desktop: inline filters
    return (
      <Space wrap style={{ padding: '12px 16px' }}>
        <FilterFields />
      </Space>
    )
  }

  // Mobile: drawer filters
  return (
    <>
      <Button
        icon={<FilterOutlined />}
        onClick={() => setDrawerOpen(true)}
      >
        Filters {activeCount > 0 && <Badge count={activeCount} />}
      </Button>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <FilterFields />
        </Space>
      </Drawer>
    </>
  )
}
```

### Pattern 3: Debounced Search

```tsx
import { useMemo } from 'react'
import debounce from 'lodash/debounce'

const SearchComponent = ({ onSearch }) => {
  const [search, setSearch] = useState('')

  // Debounce 300-500ms cho search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      onSearch(value)
    }, 300),
    [onSearch]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    debouncedSearch(value)
  }

  return (
    <Input.Search
      value={search}
      onChange={handleChange}
      placeholder="Search..."
    />
  )
}
```

### Pattern 4: Status Badge với Color Mapping

```tsx
const StatusBadge = ({ status, colorMap }: {
  status: string
  colorMap: Record<string, string>
}) => {
  const color = colorMap[status] || 'default'
  const label = STATUS_LABELS[status] || status
  
  return <Tag color={color}>{label}</Tag>
}

// Usage
const ORDER_STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default'
}

<StatusBadge status={order.status} colorMap={ORDER_STATUS_COLORS} />
```

### Pattern 5: Table với Actions

```tsx
const columns: ColumnsType = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: true
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <StatusBadge status={status} />
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    render: (_, record) => (
      <Space>
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Popconfirm
            title="Confirm delete?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>
      </Space>
    )
  }
]
```

---

## 5. Form Validation Rules

### Ant Design Form Validation

```tsx
<Form.Item
  label="Email"
  name="email"
  rules={[
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email format' }
  ]}
>
  <Input />
</Form.Item>

<Form.Item
  label="Password"
  name="password"
  rules={[
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Min 8 characters' },
    { pattern: /^(?=.*[A-Z])(?=.*[0-9])/, message: 'Must contain uppercase and number' }
  ]}
>
  <Input.Password />
</Form.Item>

<Form.Item
  label="Confirm Password"
  name="confirmPassword"
  dependencies={['password']}
  rules={[
    { required: true, message: 'Please confirm password' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('password') === value) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('Passwords do not match'))
      }
    })
  ]}
>
  <Input.Password />
</Form.Item>
```

---

## 6. Notification Patterns

### Setup App Context (root layout)

```tsx
import { App } from 'antd'

export default function RootLayout({ children }) {
  return (
    <ConfigProvider theme={theme}>
      <App>
        {children}
      </App>
    </ConfigProvider>
  )
}
```

### Usage trong Components

```tsx
const MyComponent = () => {
  const { message, modal, notification } = App.useApp()

  const handleSuccess = () => {
    message.success('Operation successful')
  }

  const handleError = () => {
    message.error('Operation failed')
  }

  const handleDelete = () => {
    modal.confirm({
      title: 'Confirm deletion?',
      content: 'This action cannot be undone',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        await deleteItem()
        message.success('Deleted successfully')
      }
    })
  }

  return <Button onClick={handleDelete}>Delete</Button>
}
```

---

## 7. Loading States

### Component-level Loading

```tsx
// Button loading
<Button type="primary" loading={isPending} onClick={handleSubmit}>
  Submit
</Button>

// Table loading
<Table
  columns={columns}
  dataSource={data}
  loading={isLoading}
/>

// Spin container
<Spin spinning={isLoading}>
  <Content />
</Spin>

// Skeleton placeholder
{isLoading ? (
  <Skeleton active paragraph={{ rows: 4 }} />
) : (
  <Content data={data} />
)}
```

---

## 8. Theme Customization

### config/theme.ts

```typescript
import type { ThemeConfig } from 'antd'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#52c41a',
    colorWarning: '#fa8c16',
    colorError: '#ff4d4f',
    
    borderRadius: 12,
    borderRadiusLG: 16,
    
    fontSize: 14,
    fontFamily: 'Inter, -apple-system, sans-serif',
    
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      primaryShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40
    },
    Table: {
      headerBg: '#f8fafc',
      rowHoverBg: 'rgba(37, 99, 235, 0.04)',
      borderRadius: 12
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24
    },
    Modal: {
      borderRadiusLG: 20
    }
  }
}

export default theme
```

---

## 9. Responsive Design Rules

### Grid Breakpoints

```typescript
xs: < 576px   // Extra small (mobile portrait)
sm: ≥ 576px   // Small (mobile landscape)
md: ≥ 768px   // Medium (tablet)
lg: ≥ 992px   // Large (desktop)
xl: ≥ 1200px  // Extra large
xxl: ≥ 1600px // Extra extra large
```

### Usage Pattern

```tsx
const MyComponent = () => {
  const screens = Grid.useBreakpoint()

  return (
    <>
      {screens.md ? (
        <DesktopLayout />
      ) : (
        <MobileLayout />
      )}
    </>
  )
}
```

---

## 10. Interactive Feedback

### Hover Effects (CSS)

```css
.hover-lift {
  transition: all 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.clickable-row:hover {
  background-color: rgba(37, 99, 235, 0.04);
  cursor: pointer;
}
```

### Focus States

```css
.ant-btn:focus-visible,
.ant-input:focus-visible,
.ant-select:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

---

## Tóm Tắt: 10 Rules Quan Trọng

1. **Color System**: Lưu status colors trong constants, dùng Tag color mapping
2. **Layout**: Dark sidebar + light content, sticky header với glassmorphism
3. **Responsive**: Mobile drawer (< 768px), collapsed sidebar (< 1024px)
4. **Page Pattern**: Card + Tabs(status) + Filters + Table + Modal/Drawer
5. **Forms**: Ant Design validation rules, không dùng Zod
6. **Debounce**: 300-500ms cho search, instant cho selects
7. **Loading**: Button loading, Table loading, Spin, Skeleton
8. **Notifications**: App.useApp() context cho message/modal/notification
9. **Typography**: Inter font, 14px base, tabular numbers
10. **Spacing**: 16px default, 24px cards, 12px compact

---

## Ant Design Components Được Sử Dụng

### Core Components

- **Layout & Navigation**: Layout, Sider, Header, Content, Menu, Breadcrumb, Dropdown
- **Data Display**: Table, Card, Tag, Badge, Tooltip, Descriptions, Empty, Statistic
- **Form**: Form, Form.Item, Input, Input.Password, Input.Search, Input.TextArea, Select, DatePicker, RangePicker, Switch, Checkbox, Radio, InputNumber
- **Feedback**: Modal, Drawer, Message, Notification, Spin, Skeleton, Popconfirm, Alert
- **General**: Button, Space, Grid, Tabs, Divider
- **Icons**: @ant-design/icons (EditOutlined, DeleteOutlined, CloseOutlined, CheckOutlined, PlusOutlined, FilterOutlined, etc.)

### Pro Components (Optional)

- **ProTable**: Advanced table with built-in search/filter/export
- **ProForm**: Form with more features
- **StepsForm**: Multi-step wizard forms

---

## Best Practices

### DO ✅

- Sử dụng `Grid.useBreakpoint()` cho responsive logic
- Lưu colors trong constants, không hardcode
- Dùng `App.useApp()` cho notifications
- Debounce search inputs (300-500ms)
- Show loading states cho mọi async operations
- Validate forms với Ant Design rules
- Sử dụng `destroyOnClose` cho Modal/Drawer
- Consistent spacing: 16px default, 24px cards
- Dark sidebar, light content area
- Sticky header với glassmorphism effect

### DON'T ❌

- Hardcode màu sắc trong components
- Bỏ qua loading states
- Quên responsive handling cho mobile
- Dùng inline styles thay vì theme tokens
- Bỏ qua form validation
- Không debounce search inputs
- Dùng absolute positioning không cần thiết
- Inconsistent spacing và sizing
- Quên accessibility (focus states, ARIA labels)

---

## Cấu Trúc Thư Mục Đề Xuất

```
src/
├── config/
│   └── theme.ts              # Ant Design theme customization
├── constants/
│   └── status-colors.ts      # Status color mappings
├── components/
│   ├── layouts/
│   │   ├── AdminLayout.tsx   # Main admin layout
│   │   ├── HeaderBar.tsx     # Sticky header
│   │   └── Sidebar.tsx       # Navigation sidebar
│   ├── common/
│   │   ├── StatusBadge.tsx   # Reusable status badge
│   │   ├── FilterBar.tsx     # Responsive filter bar
│   │   └── PageHeader.tsx    # Page title component
│   └── [feature]/
│       ├── [Feature]Table.tsx
│       ├── [Feature]Form.tsx
│       └── [Feature]Filter.tsx
├── hooks/
│   ├── useDebounce.ts        # Debounce hook
│   └── useResponsive.ts      # Responsive utilities
└── app/
    └── layout.tsx            # Root layout with ConfigProvider
```

---

## Future Enhancements (Phase 5 - Deferred)

The following patterns are planned for post-launch implementation:

### Bulk Actions Pattern
```tsx
// Table with row selection for bulk operations
<Table
  rowSelection={{
    type: 'checkbox',
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }}
  dataSource={data}
  columns={columns}
/>

<Space>
  <Button 
    disabled={selectedRowKeys.length === 0}
    onClick={handleBulkDelete}
  >
    Delete Selected ({selectedRowKeys.length})
  </Button>
</Space>
```

### Role-Based UI Pattern
```tsx
// Permission-based component rendering
import { usePermission } from '@/hooks/usePermission'

function ProtectedButton() {
  const canDelete = usePermission('users:delete')
  
  if (!canDelete) return null
  
  return <Button danger>Delete</Button>
}
```

### Performance Optimization
- Tree-shaking unused Ant Design components
- Code-splitting for heavy components (Table, Form, Charts)
- Dynamic imports for modal content
- Bundle analysis and optimization
- React Query optimization (staleTime, cacheTime)

### Advanced State Management
- URL params for filters and pagination
- Zustand for complex UI state
- React Query for server state
- Local storage for user preferences

These features will be implemented based on user feedback and business requirements post-launch.

---

Pattern này có thể áp dụng cho bất kỳ admin system nào với Ant Design v5.

**Last Updated:** 2026-05-20  
**Migration Status:** Foundation complete, systematic page migration in progress  
**See Also:** [Migration Guide](./ant-design-migration-guide.md)
