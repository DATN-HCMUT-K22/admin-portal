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
