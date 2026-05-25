import { Spin, Skeleton, Card } from 'antd'
import type { SkeletonProps } from 'antd'

// Full page loading
export function PageLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <Spin size="large" tip="Loading..." />
    </div>
  )
}

// Card skeleton
export function CardSkeleton(props: SkeletonProps) {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 4 }} {...props} />
    </Card>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <Skeleton active paragraph={{ rows }} />
    </Card>
  )
}

// Inline content loading (for sections)
export function ContentLoading({ tip = 'Loading...' }: { tip?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Spin size="large" tip={tip} />
    </div>
  )
}
