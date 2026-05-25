import type { ThemeConfig } from 'antd'

/**
 * Ant Design v5 Theme Configuration
 * Based on: /media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md
 */
const theme: ThemeConfig = {
  token: {
    // Color System
    colorPrimary: '#2563eb',      // Blue-600 - actions, links, selected
    colorSuccess: '#52c41a',      // Green - completed, approved
    colorWarning: '#fa8c16',      // Orange - pending, attention
    colorError: '#ff4d4f',        // Red - errors, critical
    colorInfo: '#722ed1',         // Purple - special states

    // Backgrounds
    colorBgLayout: '#f8fafc',     // Light gray-blue
    colorBgContainer: '#ffffff',  // White cards
    colorBorder: '#e2e8f0',       // Borders

    // Typography - Using Geist font (current project font)
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 26,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,

    // Spacing System
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // Border Radius (Soft, Modern)
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 6,

    // Shadows (Soft)
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    boxShadowSecondary: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  },

  components: {
    // Button Styling
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      primaryShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
      algorithm: true,
    },

    // Input Controls
    Input: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 10,
      controlHeight: 40,
    },

    // Table Styling
    Table: {
      headerBg: '#f8fafc',
      rowHoverBg: 'rgba(37, 99, 235, 0.04)',
      borderRadius: 12,
    },

    // Card Styling
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
    },

    // Modal Styling
    Modal: {
      borderRadiusLG: 20,
    },

    // Layout Components
    Layout: {
      headerBg: 'rgba(255,255,255,0.85)',
      siderBg: '#001529',
    },

    // Menu (Dark Theme)
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
  },
}

export default theme
