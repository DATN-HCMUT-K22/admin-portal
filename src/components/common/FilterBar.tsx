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
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
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
