# Phase 6: Documentation Update

**Effort:** 2 hours  
**Priority:** Medium (Cleanup & future reference)  
**Complexity:** Low  
**Blocked by:** Phase 4  
**Status:** ⚠️ Updated after validation — Phase 5 patterns deferred

---

## Objectives

Update the Ant Design UI Rules document to reflect the implemented patterns from Phases 1-4, fix discrepancies (Inter → Geist font), document integration with Next.js 16 App Router and React Query, and add "Future Enhancements" section for deferred Phase 5 patterns.

---

## Tasks

### Task 6.1: Update Font Documentation (15 min)

**File:** `/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md`

**Change Section 1:**

```diff
### Typography

\`\`\`typescript
- fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
+ fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
fontSize: 14px              // Base
fontSizeHeading1: 32px
fontSizeHeading2: 26px
fontSizeHeading3: 20px
fontSizeHeading4: 16px

- // Enable OpenType features
- font-feature-settings: "cv02", "cv03", "cv04", "cv11"
\`\`\`

+ **Note:** This project uses **Geist Sans** font (Next.js optimized), not Inter. The font is loaded via Next.js font optimization in \`layout.tsx\`.
```

**Validation:**
- ✅ Font family updated to Geist
- ✅ OpenType features removed (not needed for Geist)
- ✅ Note added explaining Geist usage

---

### Task 6.2: Add Future Enhancements Section (30 min) ⚠️ UPDATED

**Note:** Phase 5 (bulk actions, RBAC, optimization) has been deferred. Instead of documenting as implemented patterns, add a "Future Enhancements" section.

**Add to end of document:**

```markdown
## Future Enhancements

The following patterns were planned but deferred to post-launch sprint:

### Pattern 6: Bulk Actions for Tables (Phase 5)

Bulk actions allow users to perform operations on multiple selected rows simultaneously.

**When to implement:** After MVP launch, if bulk operations become a common workflow.

**Example implementation:**

**Add to Section 4 (Component Patterns):**

```markdown
### Pattern 6: Bulk Actions for Tables

Bulk actions allow users to perform operations on multiple selected rows simultaneously.

\`\`\`tsx
'use client'

import { useState } from 'react'
import { Table, Button, Popconfirm, Space, App } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export function UsersTable() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const { message } = App.useApp()

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteUsers(selectedRowKeys as string[])
      message.success(\`\${selectedRowKeys.length} items deleted\`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('Bulk delete failed')
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        rowSelection={rowSelection}
      />

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
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
          }}
        >
          <Space>
            <span style={{ fontWeight: 500 }}>{selectedRowKeys.length} selected</span>
            <Popconfirm
              title={\`Delete \${selectedRowKeys.length} items?\`}
              onConfirm={handleBulkDelete}
              okText="Delete"
              okType="danger"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
            <Button onClick={() => setSelectedRowKeys([])}>
              Clear
            </Button>
          </Space>
        </div>
      )}
    </>
  )
}
\`\`\`

**Best Practices:**
- Always show selected count in bulk actions bar
- Use Popconfirm for destructive bulk actions (delete, reject)
- Clear selection after successful bulk operation
- Position bar fixed at bottom center for visibility
- Provide clear feedback (success/error messages)
```

**Validation:**
- ✅ Pattern 6 added to Component Patterns section
- ✅ Complete code example included
- ✅ Best practices documented

---

### Task 6.3: Add Pattern 7: Role-Based UI to Future Enhancements (Combined with 6.2)

**Continue Future Enhancements section:**

### Pattern 7: Role-Based UI with Permissions (Phase 5)

Control UI visibility and functionality based on user permissions.

**When to implement:** When multi-role admin access is required and different permissions per role are needed.

**Permission Hook:**

\`\`\`typescript
// src/hooks/usePermission.ts
import { useAuthStore } from '@/stores/auth-store'

type Permission = 
  | 'users:read' | 'users:write' | 'users:delete'
  | 'reports:read' | 'reports:write'
  | 'roles:read' | 'roles:write'

export function usePermission() {
  const user = useAuthStore((state) => state.user)

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    
    const rolePermissions: Record<string, Permission[]> = {
      MODERATOR: ['users:read', 'reports:read', 'reports:write'],
      VIEWER: ['users:read', 'reports:read'],
    }
    
    return rolePermissions[user.role]?.includes(permission) ?? false
  }

  return { hasPermission, user }
}
\`\`\`

**Permission Gate Component:**

\`\`\`tsx
// src/components/common/PermissionGate.tsx
import { ReactNode } from 'react'
import { usePermission } from '@/hooks/usePermission'

interface PermissionGateProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermission()
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}
\`\`\`

**Usage Example:**

\`\`\`tsx
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePermission } from '@/hooks/usePermission'

export default function UsersPage() {
  const { hasPermission } = usePermission()

  return (
    <>
      {/* Hide button for viewers */}
      <PermissionGate permission="users:write">
        <Button type="primary" icon={<PlusOutlined />}>
          Add User
        </Button>
      </PermissionGate>

      {/* Disable button for viewers */}
      <Button
        type="primary"
        disabled={!hasPermission('users:write')}
        icon={<PlusOutlined />}
      >
        Add User
      </Button>

      {/* Conditional table actions */}
      <Table
        columns={[
          {
            title: 'Actions',
            render: (_, record) => (
              <Space>
                <PermissionGate permission="users:write">
                  <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                </PermissionGate>
                <PermissionGate permission="users:delete">
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </PermissionGate>
              </Space>
            ),
          },
        ]}
      />
    </>
  )
}
\`\`\`

**Permission Naming Convention:**
- Format: \`resource:action\`
- Resources: users, reports, roles, locations, moderation
- Actions: read, write, delete
- Examples: \`users:write\`, \`reports:delete\`, \`roles:read\`

**Best Practices:**
- Hide buttons for unauthorized users (better UX than disabled)
- Use disabled state only when user needs to know feature exists but isn't accessible
- Always check permissions server-side (client-side is UI-only)
- Define permissions in centralized constant file
```

### Pattern 8: Performance Optimization (Phase 5)

Tree-shaking, dynamic imports, and bundle size optimization techniques.

**When to implement:** If bundle size exceeds 450KB or performance becomes a concern.
```

**Validation:**
- ✅ Future Enhancements section added at end of document
- ✅ Patterns 6, 7, 8 documented as deferred (not implemented)
- ✅ Clear guidance on when to implement each pattern

---

### Task 6.4: Add State Management Section (30 min)

**Add new Section 11:**

```markdown
## 11. State Management Integration

### When to Use What

| State Type | Solution | Persistence | Example |
|------------|----------|-------------|---------|
| Server data | React Query | Cache (5 min) | Users list, reports |
| Filters/Pagination | URL params | URL (shareable) | search=john&page=2 |
| Modal/Drawer visibility | Zustand | Session | userModalOpen: true |
| Form field values | Ant Design Form | Form instance | name, email, password |
| Auth state | Zustand + localStorage | localStorage | user, token |

### React Query Integration

\`\`\`tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function UsersTable() {
  const queryClient = useQueryClient()

  // Fetch data
  const { data, isLoading } = useQuery(['users', filters], () => fetchUsers(filters))

  // Create mutation
  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      message.success('User created')
    },
  })

  return <Table dataSource={data} loading={isLoading} />
}
\`\`\`

### Zustand for UI State

\`\`\`typescript
// src/stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  userModalOpen: boolean
  openUserModal: () => void
  closeUserModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  userModalOpen: false,
  openUserModal: () => set({ userModalOpen: true }),
  closeUserModal: () => set({ userModalOpen: false }),
}))
\`\`\`

\`\`\`tsx
// Usage
const { userModalOpen, openUserModal, closeUserModal } = useUIStore()

<Modal open={userModalOpen} onCancel={closeUserModal}>
  {/* content */}
</Modal>
\`\`\`

### URL Params for Filters

\`\`\`tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || '1')

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', value)
    params.set('page', '1') // Reset to page 1
    router.push(\`?\${params.toString()}\`)
  }

  return (
    <Input.Search
      value={search}
      onChange={(e) => handleSearchChange(e.target.value)}
    />
  )
}
\`\`\`

**Benefits:**
- URL params are shareable (copy link to share filtered view)
- Zustand keeps UI state during navigation
- React Query handles cache + revalidation
- Ant Design Form handles field-level validation
```

**Validation:**
- ✅ Section 11 added with state management patterns
- ✅ Table comparing solutions included
- ✅ Code examples for React Query, Zustand, URL params
- ✅ Benefits documented

---

### Task 6.5: Add Next.js 16 App Router Notes (15 min)

**Add new Section 12:**

```markdown
## 12. Next.js 16 App Router Integration

### Server vs Client Components

**Rule:** Ant Design components require \`'use client'\` directive.

\`\`\`tsx
// ❌ Wrong - Server component cannot use Ant Design
export default function UsersPage() {
  return <Table dataSource={data} /> // Error!
}

// ✅ Correct - Client component
'use client'

export default function UsersPage() {
  return <Table dataSource={data} />
}
\`\`\`

### CSS-in-JS Setup

Ant Design v5 uses CSS-in-JS (Emotion). Next.js App Router requires special setup:

\`\`\`tsx
// src/app/layout.tsx
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import theme from '@/config/theme'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
\`\`\`

**Required Packages:**
- \`antd\` - Ant Design component library
- \`@ant-design/nextjs-registry\` - SSR support for Next.js
- \`@ant-design/icons\` - Icon library

### Static Context Methods

Use \`App.useApp()\` instead of static methods:

\`\`\`tsx
// ❌ Avoid - Static methods don't work reliably in App Router
import { message } from 'antd'
message.success('Done') // May not work

// ✅ Correct - Use App.useApp() hook
'use client'

import { App } from 'antd'

export default function MyComponent() {
  const { message, modal, notification } = App.useApp()
  
  const handleClick = () => {
    message.success('Done') // ✅ Works
  }
  
  return <Button onClick={handleClick}>Click</Button>
}
\`\`\`

### Performance Optimization

\`\`\`javascript
// next.config.js
module.exports = {
  transpilePackages: ['antd', '@ant-design/icons'],
  
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
}
\`\`\`
```

**Validation:**
- ✅ Section 12 added with Next.js App Router notes
- ✅ Server vs client component explained
- ✅ CSS-in-JS setup documented
- ✅ Static methods → App.useApp() migration guide
- ✅ Performance optimization config

---

### Task 6.6: Remove Outdated Notes (10 min)

**Remove from document:**

1. ~~"không dùng Zod"~~ - Already removed, no longer needed
2. Update validation section to remove Zod references

**Update Section 5:**

```diff
## 5. Form Validation Rules

- ### Ant Design Form Validation
+ ### Form Validation with Ant Design

- **Note:** This project does not use Zod for validation. Use Ant Design's built-in validation rules.
+ **Note:** All form validation is handled by Ant Design's built-in rules. No external validation library needed.

\`\`\`tsx
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
\`\`\`
```

**Validation:**
- ✅ Removed "không dùng Zod" note (outdated)
- ✅ Updated validation section to be clearer
- ✅ No references to removed libraries (React Hook Form, Zod)

---

### Task 6.7: Add Tree-Shaking Config (15 min)

**Add to Section 12 (Next.js Integration):**

```markdown
### Tree-Shaking Configuration

Reduce bundle size by enabling tree-shaking for Ant Design:

\`\`\`javascript
// next.config.js
const nextConfig = {
  transpilePackages: ['antd', '@ant-design/icons'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        antd: require.resolve('antd'),
      }
    }
    return config
  },

  swcMinify: true,
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
}

module.exports = nextConfig
\`\`\`

**Bundle Size Targets:**
- Total JS bundle: < 450KB gzipped
- Main bundle: < 200KB gzipped
- Ant Design chunk: < 250KB gzipped

**Verify with Bundle Analyzer:**

\`\`\`bash
npm install --save-dev @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
\`\`\`
```

**Validation:**
- ✅ Tree-shaking config added
- ✅ Bundle size targets documented
- ✅ Bundle analyzer instructions included

---

### Task 6.8: Update Table of Contents & Summary (10 min)

**Update Table of Contents:**

```markdown
## Mục Lục

- [1. Design System Foundation](#1-design-system-foundation)
- [2. Layout Patterns](#2-layout-patterns)
- [3. Page Layout Pattern](#3-page-layout-pattern-crud-pages)
- [4. Component Patterns](#4-component-patterns)
  - [Pattern 1: Form in Modal/Drawer](#pattern-1-form-in-modaldrawer)
  - [Pattern 2: Responsive Filter](#pattern-2-responsive-filter-desktop-inline-mobile-drawer)
  - [Pattern 3: Debounced Search](#pattern-3-debounced-search)
  - [Pattern 4: Status Badge](#pattern-4-status-badge-với-color-mapping)
  - [Pattern 5: Table Actions](#pattern-5-table-với-actions)
  - [Pattern 6: Bulk Actions](#pattern-6-bulk-actions-for-tables) *(New)*
  - [Pattern 7: Role-Based UI](#pattern-7-role-based-ui-with-permissions) *(New)*
- [5. Form Validation Rules](#5-form-validation-rules)
- [6. Notification Patterns](#6-notification-patterns)
- [7. Loading States](#7-loading-states)
- [8. Theme Customization](#8-theme-customization)
- [9. Responsive Design Rules](#9-responsive-design-rules)
- [10. Interactive Feedback](#10-interactive-feedback)
- [11. State Management Integration](#11-state-management-integration) *(New)*
- [12. Next.js 16 App Router Integration](#12-nextjs-16-app-router-integration) *(New)*
- [Tóm Tắt: 10 Rules Quan Trọng](#tóm-tắt-10-rules-quan-trọng)
```

**Update Summary:**

```markdown
## Tóm Tắt: 10 Rules Quan Trọng

1. **Color System**: Lưu status colors trong constants, dùng Tag color mapping
2. **Layout**: Dark sidebar + light content, sticky header với glassmorphism
3. **Responsive**: Mobile drawer (< 768px), collapsed sidebar (< 1024px)
4. **Page Pattern**: Card + Tabs(status) + Filters + Table + Modal/Drawer
5. **Forms**: Ant Design validation rules (no external libraries)
6. **Debounce**: 300ms cho search, instant cho selects
7. **Loading**: Button loading, Table loading, Spin, Skeleton
8. **Notifications**: App.useApp() context cho message/modal/notification
9. **Typography**: Geist Sans font, 14px base, tabular numbers
10. **State Management**: React Query (server), Zustand (UI), URL params (filters)
```

**Validation:**
- ✅ Table of contents updated with new sections
- ✅ Summary updated to reflect Geist font
- ✅ State management added to summary

---

## Phase 6 Validation Checklist

Before considering migration complete, verify:

- ✅ **Font Documentation**
  - Inter → Geist font updated throughout document
  - OpenType features removed
  - Geist font usage explained

- ✅ **Future Enhancements Section Added**
  - Pattern 6: Bulk actions (deferred to Phase 5)
  - Pattern 7: Role-based UI (deferred to Phase 5)
  - Pattern 8: Performance optimization (deferred to Phase 5)

- ✅ **State Management Section**
  - Section 11 added
  - React Query, Zustand, URL params documented
  - When to use what table included

- ✅ **Next.js Integration**
  - Section 12 added
  - Server vs client components explained
  - CSS-in-JS setup documented
  - App.useApp() migration guide included
  - Tree-shaking config added

- ✅ **Cleanup**
  - "không dùng Zod" removed
  - Zod references removed from validation section
  - Outdated notes cleaned up

- ✅ **Navigation**
  - Table of contents updated
  - New sections linked correctly
  - Summary reflects new patterns

---

## Common Issues & Solutions

### Issue 1: Document formatting broken
**Cause:** Markdown syntax errors  
**Solution:** Validate markdown with linter, check code block closures

### Issue 2: Code examples outdated
**Cause:** Examples don't match actual implementation  
**Solution:** Copy-paste from working code, test examples

### Issue 3: Missing cross-references
**Cause:** New patterns not linked from summary  
**Solution:** Update table of contents and summary section

---

## Estimated Time Breakdown

| Task | Time | Cumulative | Status |
|------|------|------------|--------|
| 6.1 Update font documentation | 15 min | 15 min | Required |
| 6.2+6.3 Add Future Enhancements section | 30 min | 45 min | Updated (Phase 5 deferred) |
| 6.4 Add state management section | 30 min | 1h 15min | Required |
| 6.5 Add Next.js App Router notes | 15 min | 1h 30min | Required |
| 6.6 Remove outdated notes | 10 min | 1h 40min | Required |
| 6.7 Add tree-shaking config (basic) | 10 min | 1h 50min | Simplified (full optimization in Phase 5) |
| 6.8 Update TOC & summary | 10 min | 2h | Required |
| Final review & validation | 5 min | **2h** | |

---

## Next Steps

Once Phase 6 is complete:
- ✅ **Migration Complete!** 🎉
- ✅ Commit changes: `git add . && git commit -m "docs: Update Ant Design UI Rules with implemented patterns"`
- ✅ Create PR: `gh pr create --title "feat: Migrate to Ant Design v5" --body "See migration plan in .claude/plans/antd-migration-2026-05-20/"`
- ✅ Document final bundle sizes in PR description
- ✅ Take screenshots of key pages for PR review
- ✅ Request code review from team

---

## Post-Migration Tasks (Outside Phase 6)

### Week 1 After Merge
- ✅ Monitor production bundle size
- ✅ Check Lighthouse scores
- ✅ Gather user feedback (any UI issues?)
- ✅ Measure development velocity (time for next 3 CRUD pages)

### Week 2-4
- ✅ Optimize heavy components if bundle > 500KB
- ✅ Add missing patterns discovered during real usage
- ✅ Create reusable component library (if patterns emerge)

---

## References

- [Ant Design v5 Documentation](https://ant.design/docs/react/introduce)
- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [Project UI Rules Document](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md)
- [Migration Brainstorming Report](/media/ngocha/D/admin-page/docs/brainstorm-ant-design-migration-2026-05-20.md)
