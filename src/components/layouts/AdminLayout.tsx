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
