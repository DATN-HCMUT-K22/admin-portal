# Phase 2: Layout Architecture

**Effort:** 6 hours  
**Priority:** Critical (Blocks Phase 4 page migration)  
**Complexity:** Medium  
**Blocked by:** Phase 1

---

## Objectives

Build the core admin layout with dark sidebar, glassmorphism header, and responsive navigation following the UI rules document specifications.

---

## Architecture Overview

```
<Layout> (Full viewport height)
  ├─ <Sider> (Dark theme, collapsible)
  │   ├─ Logo (64px height)
  │   └─ Menu (Navigation items)
  └─ <Layout> (Content area with margin for sidebar)
      ├─ <Header> (Sticky, glassmorphism)
      │   ├─ MenuToggle (Hamburger icon)
      │   ├─ Breadcrumb (Route-based)
      │   └─ UserDropdown (Avatar + logout)
      └─ <Content> (Scrollable, padded)
          └─ {children}
```

---

## Tasks

### Task 2.1: Create Logo Component (30 min)

Create `src/components/layouts/Logo.tsx`:

```tsx
import Link from 'next/link'
import { HomeOutlined } from '@ant-design/icons'

interface LogoProps {
  collapsed?: boolean
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 64,
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        textDecoration: 'none',
        color: '#fff',
        fontSize: collapsed ? 24 : 20,
        fontWeight: 'bold',
        transition: 'all 0.3s',
      }}
    >
      {collapsed ? (
        <HomeOutlined />
      ) : (
        <span>Admin Panel</span>
      )}
    </Link>
  )
}
```

**Responsive Behavior:**
- Full width (240px): Shows "Admin Panel" text
- Collapsed (80px): Shows home icon only
- Smooth transition between states

**Validation:**
- ✅ Renders logo text when expanded
- ✅ Renders icon when collapsed
- ✅ Links to /dashboard
- ✅ White text on dark background

---

### Task 2.2: Create Sidebar Component (1 hour)

Create `src/components/layouts/Sidebar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { usePathname } from 'next/navigation'
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Logo } from './Logo'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

// Menu items configuration
const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/dashboard/users',
    icon: <UserOutlined />,
    label: 'Users',
  },
  {
    key: '/dashboard/reports',
    icon: <FileTextOutlined />,
    label: 'Reports',
  },
  {
    key: '/dashboard/moderation',
    icon: <SafetyOutlined />,
    label: 'Moderation',
  },
  {
    key: '/dashboard/statistics',
    icon: <BarChartOutlined />,
    label: 'Statistics',
  },
  {
    key: '/dashboard/system',
    icon: <SettingOutlined />,
    label: 'System',
    children: [
      {
        key: '/dashboard/system/users',
        label: 'Users',
      },
      {
        key: '/dashboard/system/roles',
        label: 'Roles',
      },
      {
        key: '/dashboard/system/locations',
        label: 'Locations',
      },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname()

  // Find selected key from current pathname
  const getSelectedKey = () => {
    // Find exact match first
    const exactMatch = menuItems.find((item) => item?.key === pathname)
    if (exactMatch) return [pathname]

    // Find parent match (for nested routes)
    const parentMatch = menuItems.find((item) => {
      if (item && 'children' in item && item.children) {
        return item.children.some((child: any) => pathname.startsWith(child.key))
      }
      return false
    })

    if (parentMatch) {
      const childMatch = (parentMatch as any).children.find((child: any) =>
        pathname.startsWith(child.key)
      )
      return childMatch ? [childMatch.key] : [pathname]
    }

    return [pathname]
  }

  // Find open keys for submenu
  const getOpenKeys = () => {
    const parentMatch = menuItems.find((item) => {
      if (item && 'children' in item && item.children) {
        return item.children.some((child: any) => pathname.startsWith(child.key))
      }
      return false
    })
    return parentMatch ? [parentMatch.key as string] : []
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth={80}
      width={240}
      theme="dark"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'auto',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      <Logo collapsed={collapsed} />
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKey()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={({ key }) => {
          // Navigate handled by Next.js Link in items
          // For now, use window.location (will improve with Link wrapper)
          window.location.href = key
        }}
        style={{
          borderRight: 0,
          marginTop: 8,
        }}
      />
    </Sider>
  )
}
```

**Key Features:**
- Dark theme sidebar (theme="dark")
- Fixed positioning (always visible, scrollable)
- Responsive collapse at `lg` breakpoint (< 1024px)
- Auto-selects menu item based on current route
- Nested submenu for System section

**Validation:**
- ✅ Sidebar renders with dark background (#001529)
- ✅ Menu items render with icons
- ✅ Current route highlighted in menu
- ✅ Submenu expands when child route active
- ✅ Collapse button toggles width (240px ↔ 80px)

---

### Task 2.3: Create Header Component (1 hour)

Create `src/components/layouts/HeaderBar.tsx`:

```tsx
'use client'

import { Layout, Breadcrumb, Dropdown, Avatar, Space, Button } from 'antd'
import type { MenuProps } from 'antd'
import { usePathname } from 'next/navigation'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { App } from 'antd'

const { Header } = Layout

interface HeaderBarProps {
  collapsed: boolean
  onToggle: () => void
}

export function HeaderBar({ collapsed, onToggle }: HeaderBarProps) {
  const pathname = usePathname()
  const { modal, message } = App.useApp()

  // Generate breadcrumb items from pathname
  const getBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean)
    
    return [
      {
        title: 'Home',
        href: '/dashboard',
      },
      ...paths.slice(1).map((path, index) => {
        const href = '/dashboard/' + paths.slice(1, index + 2).join('/')
        const title = path
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        return { title, href }
      }),
    ]
  }

  // User dropdown menu
  const handleLogout = () => {
    modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to log out?',
      okText: 'Logout',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        // TODO: Call logout API
        message.success('Logged out successfully')
        window.location.href = '/login'
      },
    })
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        window.location.href = '/dashboard/profile'
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        window.location.href = '/dashboard/settings'
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 99,
        width: '100%',
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left: Menu toggle + Breadcrumb */}
      <Space size="large">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: 18,
            width: 40,
            height: 40,
          }}
        />
        
        <Breadcrumb
          items={getBreadcrumbItems()}
          style={{ fontSize: 14 }}
        />
      </Space>

      {/* Right: User dropdown */}
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2563eb' }} />
          <span style={{ fontWeight: 500 }}>Admin User</span>
        </Space>
      </Dropdown>
    </Header>
  )
}
```

**Key Features:**
- Sticky header (stays at top when scrolling)
- Glassmorphism effect (backdrop-filter: blur)
- Menu toggle button (changes icon based on collapsed state)
- Auto-generated breadcrumb from URL path
- User dropdown with profile/settings/logout

**Validation:**
- ✅ Header sticks to top when scrolling
- ✅ Glassmorphism blur effect visible
- ✅ Toggle button switches sidebar state
- ✅ Breadcrumb shows current route path
- ✅ User dropdown works, logout shows confirmation modal

---

### Task 2.4: Create Main AdminLayout Component (1.5 hours)

Create `src/components/layouts/AdminLayout.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Layout } from 'antd'
import { Sidebar } from './Sidebar'
import { HeaderBar } from './HeaderBar'
import { usePathname } from 'next/navigation'

const { Content } = Layout

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true)
    
    // Auto-collapse on mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }
    
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }, [pathname])

  if (!mounted) {
    // Prevent hydration mismatch
    return null
  }

  const siderWidth = collapsed ? 80 : 240

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Main Content Area */}
      <Layout
        style={{
          marginLeft: siderWidth,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Header */}
        <HeaderBar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Content */}
        <Content
          style={{
            padding: '24px',
            minHeight: 'calc(100vh - 64px)',
            background: '#f8fafc',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
```

**Key Features:**
- Responsive sidebar margin (adjusts content based on collapsed state)
- Auto-collapse on mobile (< 1024px)
- Smooth transitions (margin-left animation)
- Full viewport height layout
- Light gray background for content area

**Validation:**
- ✅ Layout renders without hydration errors
- ✅ Sidebar collapse adjusts content margin smoothly
- ✅ Auto-collapses on mobile (< 1024px)
- ✅ Content area scrollable
- ✅ Full viewport height (no scrollbar on Layout)

---

### Task 2.5: Integrate AdminLayout into Dashboard (1 hour)

Update `src/app/dashboard/layout.tsx`:

```tsx
import { AdminLayout } from '@/components/layouts/AdminLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
```

**Clean Up Old Layout:**
- Remove any existing custom layout code
- Remove Tailwind-based layouts (dashboard-shell.tsx, etc.)
- Keep only the AdminLayout wrapper

**Validation:**
- ✅ All dashboard pages render inside AdminLayout
- ✅ Sidebar + Header visible on all dashboard routes
- ✅ Content area properly padded (24px)
- ✅ Background color matches theme (#f8fafc)

---

### Task 2.6: Test Responsive Behavior (45 min)

**Desktop Test (> 1024px):**
1. Open dashboard in browser
2. ✅ Sidebar expanded (240px) by default
3. ✅ Click collapse button → Sidebar collapses to 80px
4. ✅ Content margin adjusts smoothly
5. ✅ Menu shows icons only when collapsed
6. ✅ Header breadcrumb visible

**Tablet Test (768px - 1024px):**
1. Resize browser to 900px width
2. ✅ Sidebar auto-collapses on load
3. ✅ Can manually expand (but auto-collapses on route change)
4. ✅ Glassmorphism effect visible on header

**Mobile Test (< 768px):**
1. Resize browser to 375px width
2. ✅ Sidebar collapsed by default
3. ✅ Toggle button works
4. ✅ Sidebar covers content when expanded (overlay mode)
5. ✅ Sidebar auto-closes when navigating to new page
6. ✅ Breadcrumb wraps or truncates gracefully

**Browser DevTools:**
```bash
# Test in Chrome DevTools device mode
# Devices to test:
- iPhone 12 Pro (390px)
- iPad Pro (1024px)
- Desktop (1920px)
```

---

### Task 2.7: Add Loading State (Optional, 30 min)

Create `src/components/layouts/LoadingLayout.tsx`:

```tsx
import { Layout, Spin } from 'antd'

export function LoadingLayout() {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
      }}
    >
      <Spin size="large" tip="Loading..." />
    </Layout>
  )
}
```

Use in `AdminLayout.tsx` during mount check:

```tsx
if (!mounted) {
  return <LoadingLayout />
}
```

**Validation:**
- ✅ Loading spinner shows briefly on first load
- ✅ Centered vertically and horizontally
- ✅ Matches theme background color

---

## Phase 2 Validation Checklist

Before moving to Phase 3, verify:

- ✅ **Components Created**
  - `src/components/layouts/Logo.tsx`
  - `src/components/layouts/Sidebar.tsx`
  - `src/components/layouts/HeaderBar.tsx`
  - `src/components/layouts/AdminLayout.tsx`

- ✅ **Layout Integration**
  - `src/app/dashboard/layout.tsx` uses AdminLayout
  - All dashboard pages render inside layout
  - No duplicate layouts or wrappers

- ✅ **Sidebar Functionality**
  - Dark theme (#001529 background)
  - Expands/collapses smoothly (240px ↔ 80px)
  - Menu items render with icons
  - Current route highlighted
  - Submenu works (System section)

- ✅ **Header Functionality**
  - Sticky positioning works when scrolling
  - Glassmorphism effect visible (blur backdrop)
  - Toggle button switches sidebar state
  - Breadcrumb shows route path
  - User dropdown works (logout confirmation modal)

- ✅ **Responsive Behavior**
  - Desktop (> 1024px): Expanded sidebar by default
  - Tablet (768-1024px): Collapsed by default
  - Mobile (< 768px): Collapsed, overlay mode when expanded
  - Sidebar auto-closes on mobile when route changes

- ✅ **Visual Polish**
  - Smooth transitions (margin, width)
  - No layout shift when toggling sidebar
  - Proper z-index (sidebar: 100, header: 99)
  - Shadows and borders match theme

---

## Common Issues & Solutions

### Issue 1: Hydration mismatch error
**Cause:** Server-rendered collapsed state differs from client  
**Solution:** Use `mounted` state to prevent rendering until client-side

### Issue 2: Sidebar doesn't auto-collapse on mobile
**Cause:** `breakpoint="lg"` not working  
**Solution:** Add manual `useEffect` with window.innerWidth check

### Issue 3: Header not sticky
**Cause:** Parent Layout has overflow hidden  
**Solution:** Remove overflow from parent, use `position: sticky` on Header

### Issue 4: Menu items don't navigate
**Cause:** onClick handler not implemented  
**Solution:** Add window.location.href or use Next.js Link wrapper for menu items

### Issue 5: Glassmorphism effect not visible
**Cause:** No content behind header to blur  
**Solution:** Ensure content scrolls beneath header (sticky positioning)

---

## Estimated Time Breakdown

| Task | Time | Cumulative |
|------|------|------------|
| 2.1 Logo component | 30 min | 30 min |
| 2.2 Sidebar component | 1h | 1h 30min |
| 2.3 Header component | 1h | 2h 30min |
| 2.4 AdminLayout component | 1.5h | 4h |
| 2.5 Integrate into dashboard | 1h | 5h |
| 2.6 Test responsive behavior | 45 min | 5h 45min |
| 2.7 Add loading state | 30 min (optional) | 6h 15min |
| Final testing & polish | 15 min | **6h** |

---

## Next Steps

Once Phase 2 is complete and validated:
- ✅ Proceed to **Phase 3: Component Patterns** (can start immediately, parallel with Phase 4 planning)
- ✅ Commit changes: `git add . && git commit -m "feat: Phase 2 - Admin layout with sidebar and header"`
- ✅ Optional: Take screenshots of layout for documentation

---

## References

- [Ant Design Layout Component](https://ant.design/components/layout)
- [Ant Design Menu Component](https://ant.design/components/menu)
- [Next.js App Router Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Project UI Rules - Layout Patterns](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md#2-layout-patterns)
