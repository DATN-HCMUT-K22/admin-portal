/**
 * Status Color Mappings for Ant Design Tags/Badges
 *
 * Usage:
 * <Tag color={USER_STATUS_COLORS[user.status]}>{user.status}</Tag>
 */

// User Status Colors
export const USER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'error',
  PENDING: 'warning',
}

// Report Status Colors
export const REPORT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  REVIEWING: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  CLOSED: 'default',
}

// Order/Transaction Status Colors
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  PROCESSING: 'processing',
  COMPLETED: 'success',
  CANCELLED: 'default',
  FAILED: 'error',
}

// Role Permission Status Colors
export const PERMISSION_STATUS_COLORS: Record<string, string> = {
  GRANTED: 'success',
  DENIED: 'error',
  PENDING: 'warning',
}

// Generic Status Labels (English)
export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  CLOSED: 'Closed',
  REVIEWING: 'Reviewing',
  GRANTED: 'Granted',
  DENIED: 'Denied',
}
