'use client'

import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
  UserOutlined,
  SafetyOutlined,
  FileTextOutlined,
  SettingOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { Logo } from './Logo'
import { useAuth } from '@/providers/auth-provider'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  
  const isSystemAdmin = user?.roles?.some(r => r.name === 'SYSTEM_ADMIN')
  const isBusinessAdmin = user?.roles?.some(r => r.name === 'BUSINESS_ADMIN')

  // Build menu items dynamically based on roles
  const menuItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = []

    if (isSystemAdmin) {
      items.push({
        key: '/dashboard/system',
        icon: <SettingOutlined />,
        label: 'System',
        children: [
          {
            key: '/dashboard/system/users',
            icon: <UserOutlined />,
            label: 'Users',
          },
          {
            key: '/dashboard/system/roles',
            label: 'Roles',
          },
          {
            key: '/dashboard/system/activity-logs',
            label: 'Activity Logs',
          },
        ],
      })
      
      items.push({
        key: '/dashboard/moderation',
        icon: <SafetyOutlined />,
        label: 'Moderation',
        children: [
          {
            key: '/dashboard/moderation/reports',
            icon: <FileTextOutlined />,
            label: 'Reports',
          },
          {
            key: '/dashboard/moderation/moderate',
            label: 'Moderation Log',
          },
          {
            key: '/dashboard/moderation/feedbacks',
            label: 'Feedbacks',
          },
        ],
      })
    }

    if (isBusinessAdmin) {
      const businessChildren: MenuItem[] = [
        {
          key: '/dashboard/business/reports',
          label: 'Reports',
        },
        {
          key: '/dashboard/business/feedbacks',
          label: 'Feedbacks',
        },
      ]

      // Only add Users to Business menu if they don't already have it under System menu
      if (!isSystemAdmin) {
        businessChildren.unshift({
          key: '/dashboard/system/users',
          icon: <UserOutlined />,
          label: 'Users',
        })
      }

      items.push({
        key: '/dashboard/business',
        icon: <ShopOutlined />,
        label: 'Business',
        children: businessChildren,
      })
    }

    return items
  }, [isSystemAdmin, isBusinessAdmin])

  // Find selected key from current pathname
  const getSelectedKey = () => {
    // Find exact match first
    const exactMatch = menuItems.find((item) => item?.key === pathname)
    if (exactMatch) return [pathname]

    // Find parent match (for nested routes)
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        const childMatch = (item.children as any[]).find((child: any) =>
          pathname.startsWith(child.key)
        )
        if (childMatch) return [childMatch.key]
      }
    }

    // Check if pathname starts with any menu key
    const startsWithMatch = menuItems.find((item) =>
      pathname.startsWith(item?.key as string)
    )
    if (startsWithMatch) return [startsWithMatch.key as string]

    return [pathname]
  }

  // Find open keys for submenu
  const getOpenKeys = (items: MenuItem[]) => {
    for (const item of items) {
      if (item && 'children' in item && item.children) {
        const hasActiveChild = (item.children as any[]).some((child: any) =>
          pathname.startsWith(child.key)
        )
        if (hasActiveChild) return [item.key as string]
      }
    }
    return []
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
        defaultOpenKeys={getOpenKeys(menuItems)}
        items={menuItems}
        onClick={({ key }) => {
          router.push(key)
        }}
        style={{
          borderRight: 0,
          marginTop: 8,
        }}
      />
    </Sider>
  )
}
