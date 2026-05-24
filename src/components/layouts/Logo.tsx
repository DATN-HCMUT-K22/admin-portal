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
