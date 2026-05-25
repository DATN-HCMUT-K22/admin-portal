import { Space, Button, Tooltip, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

interface TableActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  deleteConfirmTitle?: string
  viewTooltip?: string
  editTooltip?: string
  deleteTooltip?: string
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  deleteConfirmTitle = 'Are you sure you want to delete this item?',
  viewTooltip = 'View',
  editTooltip = 'Edit',
  deleteTooltip = 'Delete',
}: TableActionsProps) {
  return (
    <Space size="small">
      {onView && (
        <Tooltip title={viewTooltip}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={onView}
          />
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title={editTooltip}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={onEdit}
          />
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <Popconfirm
            title={deleteConfirmTitle}
            onConfirm={onDelete}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Tooltip>
      )}
    </Space>
  )
}
