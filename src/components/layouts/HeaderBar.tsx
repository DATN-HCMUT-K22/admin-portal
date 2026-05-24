'use client'

import { Layout, Breadcrumb, Dropdown, Avatar, Space, Button, App } from 'antd'
import type { MenuProps } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/providers/auth-provider'

const { Header } = Layout

interface HeaderBarProps {
  collapsed: boolean
  onToggle: () => void
}

export function HeaderBar({ collapsed, onToggle }: HeaderBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { modal, message } = App.useApp()
  const { logout } = useAuth()

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
        logout() // Clear tokens and query cache
        message.success('Logged out successfully')
        router.push('/login')
      },
    })
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        router.push('/dashboard/profile')
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        router.push('/dashboard/settings')
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
