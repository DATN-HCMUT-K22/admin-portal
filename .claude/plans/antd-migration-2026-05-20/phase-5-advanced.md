# Phase 5: Advanced Patterns

**Effort:** 8 hours  
**Priority:** Medium (Nice-to-have, can defer if time-constrained)  
**Complexity:** Medium-High  
**Blocked by:** Phase 4

---

## Objectives

Implement advanced admin features: bulk actions, role-based UI, state management patterns, and performance optimizations. These patterns elevate the admin panel from basic CRUD to production-ready.

---

## Tasks

### Task 5.1: Bulk Actions Pattern (2 hours)

#### Create Bulk Actions Component

Create `src/components/common/BulkActions.tsx`:

```tsx
import { Space, Button, Popconfirm, Typography, App } from 'antd'
import { DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

interface BulkActionsProps {
  selectedCount: number
  onDelete?: () => void
  onApprove?: () => void
  onReject?: () => void
  onClear: () => void
}

export function BulkActions({
  selectedCount,
  onDelete,
  onApprove,
  onReject,
  onClear,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#fff',
        padding: '12px 24px',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <Text strong>{selectedCount} selected</Text>
      
      <Space>
        {onApprove && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onApprove}
          >
            Approve
          </Button>
        )}
        
        {onReject && (
          <Button
            icon={<CloseOutlined />}
            onClick={onReject}
          >
            Reject
          </Button>
        )}
        
        {onDelete && (
          <Popconfirm
            title={`Delete ${selectedCount} items?`}
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        )}
        
        <Button onClick={onClear}>Clear</Button>
      </Space>
    </div>
  )
}
```

#### Integrate into Table

Update `src/app/dashboard/system/users/page.tsx`:

```tsx
export default function UsersPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { message } = App.useApp()

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation(bulkDeleteUsers, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      message.success(`${selectedRowKeys.length} users deleted`)
      setSelectedRowKeys([])
    },
  })

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync(selectedRowKeys as string[])
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  return (
    <>
      {/* ... existing code ... */}

      <Table
        columns={columns}
        dataSource={data?.users || []}
        loading={isLoading}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} users`,
        }}
      />

      <BulkActions
        selectedCount={selectedRowKeys.length}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedRowKeys([])}
      />
    </>
  )
}
```

**Validation:**
- ✅ Table shows checkboxes in first column
- ✅ Selecting rows shows bulk actions bar at bottom
- ✅ Bulk delete confirmation appears
- ✅ Delete removes all selected items
- ✅ Clear deselects all rows
- ✅ Bulk actions bar positioned correctly (fixed, centered)

---

### Task 5.2: Role-Based UI Pattern (2 hours)

#### Create Permission Hook

Create `src/hooks/usePermission.ts`:

```typescript
import { useAuthStore } from '@/stores/auth-store' // Zustand store

type Permission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'reports:read'
  | 'reports:write'
  | 'roles:read'
  | 'roles:write'

export function usePermission() {
  const user = useAuthStore((state) => state.user)

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    // Admin has all permissions
    if (user.role === 'ADMIN') return true
    
    // Check role-based permissions
    const rolePermissions: Record<string, Permission[]> = {
      MODERATOR: [
        'users:read',
        'reports:read',
        'reports:write',
      ],
      VIEWER: [
        'users:read',
        'reports:read',
      ],
    }
    
    return rolePermissions[user.role]?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    user,
  }
}
```

#### Create Permission Components

Create `src/components/common/PermissionGate.tsx`:

```tsx
import { ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'

type Permission = Parameters<ReturnType<typeof usePermission>['hasPermission']>[0]

interface PermissionGateProps {
  permission: Permission | Permission[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermission()

  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission)

  return allowed ? <>{children}</> : <>{fallback}</>
}
```

#### Use in Pages

```tsx
import { PermissionGate } from '@/components/common/PermissionGate'

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        extra={
          <PermissionGate permission="users:write">
            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
          </PermissionGate>
        }
      />

      <Table
        columns={[
          // ... other columns ...
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <TableActions
                onEdit={
                  <PermissionGate permission="users:write">
                    {() => handleEdit(record)}
                  </PermissionGate>
                }
                onDelete={
                  <PermissionGate permission="users:delete">
                    {() => handleDelete(record.id)}
                  </PermissionGate>
                }
              />
            ),
          },
        ]}
      />
    </>
  )
}
```

**Alternative: Disable instead of hide**

```tsx
<Button
  type="primary"
  disabled={!hasPermission('users:write')}
  icon={<PlusOutlined />}
>
  Add User
</Button>
```

**Validation:**
- ✅ Admin sees all actions
- ✅ Moderator sees limited actions
- ✅ Viewer sees only read actions
- ✅ Hidden elements don't render in DOM
- ✅ Disabled elements show tooltip explaining why disabled

---

### Task 5.3: State Management Patterns Documentation (1 hour)

#### Update Zustand Store

Create `src/stores/ui-store.ts`:

```typescript
import { create } from 'zustand'

interface UIState {
  // Modal states
  userModalOpen: boolean
  roleModalOpen: boolean
  reportDrawerOpen: boolean
  
  // Drawer states
  filterDrawerOpen: boolean
  
  // Actions
  openUserModal: () => void
  closeUserModal: () => void
  openRoleModal: () => void
  closeRoleModal: () => void
  openReportDrawer: () => void
  closeReportDrawer: () => void
  toggleFilterDrawer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  userModalOpen: false,
  roleModalOpen: false,
  reportDrawerOpen: false,
  filterDrawerOpen: false,
  
  openUserModal: () => set({ userModalOpen: true }),
  closeUserModal: () => set({ userModalOpen: false }),
  openRoleModal: () => set({ roleModalOpen: true }),
  closeRoleModal: () => set({ roleModalOpen: false }),
  openReportDrawer: () => set({ reportDrawerOpen: true }),
  closeReportDrawer: () => set({ reportDrawerOpen: false }),
  toggleFilterDrawer: () => set((state) => ({ filterDrawerOpen: !state.filterDrawerOpen })),
}))
```

#### Create URL Params Hook

Create `src/hooks/useURLParams.ts`:

```typescript
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function useURLParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
      
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const setParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })
      
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const getParam = useCallback(
    (key: string, defaultValue?: string): string | null => {
      return searchParams.get(key) ?? defaultValue ?? null
    },
    [searchParams]
  )

  return { setParam, setParams, getParam, searchParams }
}
```

#### Usage Example

```tsx
export default function UsersPage() {
  const { setParam, setParams, getParam } = useURLParams()
  
  const search = getParam('search', '')
  const page = Number(getParam('page', '1'))
  const status = getParam('status', 'all')

  const handleSearchChange = (value: string) => {
    setParams({ search: value, page: 1 }) // Reset to page 1 when searching
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  return (
    <>
      <Input.Search
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      
      <Table
        pagination={{
          current: page,
          onChange: handlePageChange,
        }}
      />
    </>
  )
}
```

**Document in README:**

Create `docs/state-management-guide.md`:

```markdown
# State Management Guide

## When to Use What

| State Type | Solution | Example | Persistence |
|------------|----------|---------|-------------|
| Server data | React Query | Users list, reports | Cache (5 min) |
| Filters/Pagination | URL params | search=john&page=2 | URL (shareable) |
| Modal/Drawer visibility | Zustand | userModalOpen | Session |
| Form field values | Ant Design Form | name, email fields | Form instance |
| Auth state | Zustand + localStorage | user, token | localStorage |

## Examples

### React Query (Server Data)
\`\`\`tsx
const { data, isLoading } = useQuery(['users'], fetchUsers)
const mutation = useMutation(createUser, {
  onSuccess: () => queryClient.invalidateQueries(['users'])
})
\`\`\`

### URL Params (Filters)
\`\`\`tsx
const { setParam, getParam } = useURLParams()
const search = getParam('search', '')
<Input.Search value={search} onChange={(e) => setParam('search', e.target.value)} />
\`\`\`

### Zustand (UI State)
\`\`\`tsx
const { userModalOpen, openUserModal, closeUserModal } = useUIStore()
<Modal open={userModalOpen} onCancel={closeUserModal}>
\`\`\`

### Ant Design Form (Form State)
\`\`\`tsx
const [form] = Form.useForm()
<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="email" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</Form>
\`\`\`
```

**Validation:**
- ✅ URL params persist on page refresh
- ✅ Zustand state persists during session
- ✅ Modal state clears when modal closes
- ✅ Form state resets after submit

---

### Task 5.4: Performance Optimization (3 hours)

#### Configure Tree-Shaking

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd', '@ant-design/icons'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ant Design tree-shaking
      config.resolve.alias = {
        ...config.resolve.alias,
        antd: require.resolve('antd'),
      }
    }
    return config
  },

  // Enable SWC minification
  swcMinify: true,
  
  // Experimental optimizations
  experimental: {
    optimizeCss: true, // CSS optimization
    optimizePackageImports: ['antd', '@ant-design/icons'], // Package imports
  },
}

module.exports = nextConfig
```

#### Dynamic Imports for Heavy Components

Update pages with heavy tables/charts:

```tsx
'use client'

import dynamic from 'next/dynamic'
import { PageLoading } from '@/components/common/LoadingStates'

// Lazy load heavy Table component
const UsersTable = dynamic(
  () => import('@/components/users/UsersTable'),
  { loading: () => <PageLoading /> }
)

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Users" />
      <UsersTable />
    </>
  )
}
```

#### Measure Bundle Size

Install webpack-bundle-analyzer:

```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.js`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Run analysis:

```bash
ANALYZE=true npm run build
```

**Target Sizes:**
- Total JS bundle: < 450KB gzipped
- Main bundle: < 200KB gzipped
- Ant Design chunk: < 250KB gzipped

#### Optimize Ant Design Imports

**Before (imports entire component):**
```tsx
import { Button, Table, Form } from 'antd'
```

**After (same, tree-shaking handles it):**
```tsx
// Keep as is - Next.js + SWC handles tree-shaking
import { Button, Table, Form } from 'antd'
```

**Only for very heavy components (e.g., ProTable):**
```tsx
import dynamic from 'next/dynamic'
const ProTable = dynamic(() => import('@ant-design/pro-table'), { ssr: false })
```

#### Memoize Expensive Computations

```tsx
import { useMemo } from 'react'

const columns: ColumnsType<User> = useMemo(
  () => [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    // ... other columns ...
  ],
  [] // Dependencies - empty if columns never change
)
```

#### Add React Query DevTools (Development Only)

```tsx
// src/app/layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}
```

**Validation:**
- ✅ Build bundle size < 450KB gzipped
- ✅ Main chunk < 200KB gzipped
- ✅ No duplicate dependencies in bundle
- ✅ Dynamic imports work (loading state shows)
- ✅ React Query DevTools visible in dev mode

---

## Phase 5 Validation Checklist

Before moving to Phase 6, verify:

- ✅ **Bulk Actions**
  - Table shows checkboxes
  - Selecting rows shows bulk actions bar
  - Bulk delete works with confirmation
  - Clear deselects all rows
  - Bar positioned correctly (fixed bottom, centered)

- ✅ **Role-Based UI**
  - usePermission hook works
  - PermissionGate hides elements for unauthorized users
  - Admin sees all actions
  - Moderator sees limited actions
  - Viewer sees read-only actions

- ✅ **State Management**
  - Zustand stores UI state (modals, drawers)
  - URL params store filters/pagination
  - Filters persist on page refresh
  - Forms reset after submit

- ✅ **Performance**
  - Bundle size < 450KB gzipped
  - Build succeeds without warnings
  - Dynamic imports work
  - No duplicate dependencies
  - DevTools available in development

- ✅ **Documentation**
  - State management guide created
  - Examples for each pattern documented
  - When to use what table clear

---

## Common Issues & Solutions

### Issue 1: Bulk actions bar not showing
**Cause:** selectedRowKeys state not updating  
**Solution:** Verify rowSelection.onChange updates state correctly

### Issue 2: Permission gate not hiding elements
**Cause:** useAuthStore not providing user data  
**Solution:** Ensure auth store hydrated, user data available

### Issue 3: URL params not persisting
**Cause:** useRouter not from 'next/navigation'  
**Solution:** Import from 'next/navigation' (not 'next/router')

### Issue 4: Bundle size too large (> 500KB)
**Cause:** Not using tree-shaking or too many heavy components  
**Solution:** Enable optimizePackageImports, use dynamic imports for heavy components

### Issue 5: Dynamic import shows flash of loading
**Cause:** Loading component too simple  
**Solution:** Use Skeleton placeholder instead of Spin

---

## Estimated Time Breakdown

| Task | Time | Cumulative |
|------|------|------------|
| 5.1 Bulk actions | 2h | 2h |
| 5.2 Role-based UI | 2h | 4h |
| 5.3 State management docs | 1h | 5h |
| 5.4 Performance optimization | 3h | **8h** |

---

## Next Steps

Once Phase 5 is complete and validated:
- ✅ Proceed to **Phase 6: Documentation Update**
- ✅ Commit changes: `git add . && git commit -m "feat: Phase 5 - Advanced patterns and optimizations"`
- ✅ Run bundle analyzer and document sizes
- ✅ Test permissions with different user roles

---

## References

- [Ant Design Table Row Selection](https://ant.design/components/table#rowSelection)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
