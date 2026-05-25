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
