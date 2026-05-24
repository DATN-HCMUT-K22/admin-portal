# Phase 1: Foundation Setup

**Effort:** 4 hours  
**Priority:** Critical (Blocks all other phases)  
**Complexity:** Low-Medium

---

## Objectives

Set up Ant Design v5 as the core UI framework, remove Tailwind CSS and Zod dependencies, and configure custom theming with Geist fonts.

---

## Tasks

### Task 1.1: Install Dependencies (15 min)

```bash
# Install Ant Design
npm install antd@latest @ant-design/icons@latest

# Verify versions (should be antd@5.24+ for React 19 compatibility)
npm list antd @ant-design/icons
```

**Validation:**
- ✅ `antd` and `@ant-design/icons` in package.json dependencies
- ✅ Versions compatible with React 19

---

### Task 1.2: Remove Old Dependencies (15 min)

```bash
# Uninstall Tailwind CSS
npm uninstall tailwindcss @tailwindcss/postcss

# Uninstall form validation libraries
npm uninstall zod @hookform/resolvers react-hook-form

# Remove Tailwind config files
rm -f tailwind.config.ts postcss.config.js

# Remove global Tailwind imports from CSS files
# Check and update: src/app/globals.css or similar
```

**Files to Clean:**
- `src/app/globals.css` - Remove Tailwind directives (`@tailwind base`, etc.)
- `tailwind.config.ts` - Delete file
- `postcss.config.js` - Delete file (if exists)

**Validation:**
- ✅ No `tailwindcss` or `zod` in package.json
- ✅ No Tailwind config files in project root
- ✅ No Tailwind imports in CSS files

---

### Task 1.3: Create Theme Configuration (30 min)

Create `src/config/theme.ts`:

```typescript
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
      algorithm: true, // Enable theme algorithm
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
      headerBg: 'rgba(255,255,255,0.85)', // Glassmorphism effect
      siderBg: '#001529', // Dark sidebar
    },

    // Menu (Dark Theme)
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
  },
}

export default theme
```

**Validation:**
- ✅ File created at `src/config/theme.ts`
- ✅ Uses Geist font family (current project font)
- ✅ Matches color system from UI rules document
- ✅ Exports default ThemeConfig object

---

### Task 1.4: Create Status Colors Constants (15 min)

Create `src/constants/status-colors.ts`:

```typescript
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
```

**Validation:**
- ✅ File created at `src/constants/status-colors.ts`
- ✅ Exports color mappings for all status types
- ✅ Uses Ant Design color names (success, error, warning, processing, default)

---

### Task 1.5: Wrap App with ConfigProvider (45 min)

Update `src/app/layout.tsx`:

```tsx
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, App as AntApp } from 'antd'
import theme from '@/config/theme'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <AntApp>
              {children}
            </AntApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
```

**Key Points:**
- `AntdRegistry` - Handles CSS-in-JS SSR for Next.js App Router
- `ConfigProvider` - Applies custom theme globally
- `AntApp` - Provides message/modal/notification context (static methods)

**Installation Note:**
If `@ant-design/nextjs-registry` is not installed:
```bash
npm install @ant-design/nextjs-registry
```

**Validation:**
- ✅ ConfigProvider wraps entire app
- ✅ AntApp context available (needed for App.useApp())
- ✅ AntdRegistry configured for SSR
- ✅ App renders without errors

---

### Task 1.6: Test Basic Ant Design Component (30 min)

Create a test page to verify setup: `src/app/test-antd/page.tsx`

```tsx
'use client'

import { Button, Card, Space, message, App } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

export default function TestAntdPage() {
  const { message: messageApi } = App.useApp()

  const handleClick = () => {
    messageApi.success('Ant Design is working! ✅')
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title="Ant Design v5 Test" bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <p>If you can see this card with proper styling, Ant Design is configured correctly.</p>
          
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleClick}>
            Click to Test Notification
          </Button>

          <Button type="default">Default Button</Button>
          <Button type="dashed">Dashed Button</Button>
          <Button type="link">Link Button</Button>
        </Space>
      </Card>
    </div>
  )
}
```

**Test Checklist:**
1. Navigate to `/test-antd`
2. ✅ Card renders with theme styles (borderRadius: 16px)
3. ✅ Buttons render with custom height (40px) and borderRadius (10px)
4. ✅ Primary button has blue color (#2563eb)
5. ✅ Clicking button shows success message (green notification)
6. ✅ Icon renders correctly from @ant-design/icons

**After Validation:**
Delete `src/app/test-antd/page.tsx` (temporary test page)

---

### Task 1.7: Configure Tree-Shaking (30 min)

Update `next.config.js` (or create if doesn't exist):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Ant Design CSS-in-JS optimization
  transpilePackages: ['antd', '@ant-design/icons'],
  
  // Webpack optimizations for bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Tree-shake unused Ant Design components
      config.resolve.alias = {
        ...config.resolve.alias,
        // Force single instance of antd/react
        antd: require.resolve('antd'),
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
      }
    }
    return config
  },

  // Enable SWC minification for smaller bundle
  swcMinify: true,
}

module.exports = nextConfig
```

**Alternative: tsconfig.json optimization**

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "antd": ["./node_modules/antd"],
      "antd/*": ["./node_modules/antd/*"]
    }
  }
}
```

**Validation:**
- ✅ `next.config.js` configured
- ✅ Build succeeds: `npm run build`
- ✅ No duplicate antd warnings in build output

---

### Task 1.8: Remove Tailwind Utility Classes from Existing Files (45 min)

**Search and Replace:**

```bash
# Find all files with Tailwind classes
grep -r "className.*\(flex\|grid\|p-\|m-\|w-\|h-\|bg-\|text-\)" src/

# Common patterns to remove/replace:
# - flex, grid → Space, Flex (Ant Design)
# - p-4, m-4 → style={{ padding: 16 }}
# - w-full → style={{ width: '100%' }}
# - bg-white → Card component (has white bg by default)
# - text-gray-500 → Typography.Text type="secondary"
```

**Priority Files to Clean:**
1. `src/app/dashboard/layout.tsx` - Main dashboard layout
2. `src/components/dashboard/dashboard-shell.tsx` - Dashboard shell
3. `src/app/login/login-form.tsx` - Login form
4. Any other files with Tailwind classes

**Replacement Strategy:**
- **Layout** → Use Ant Design Layout, Sider, Header, Content
- **Spacing** → Use Space, Flex, or inline styles
- **Cards** → Use Card component
- **Forms** → Will be replaced in Phase 4

**Note:** Don't worry about perfection here - just remove obvious Tailwind classes. Phase 2-4 will rebuild components properly.

**Validation:**
- ✅ No Tailwind utility classes in HTML className attributes
- ✅ No build errors
- ✅ App still renders (may look broken, that's expected)

---

## Phase 1 Validation Checklist

Before moving to Phase 2, verify:

- ✅ **Dependencies Installed**
  - `antd` and `@ant-design/icons` in package.json
  - No `tailwindcss`, `zod`, `react-hook-form` dependencies

- ✅ **Configuration Files**
  - `src/config/theme.ts` exists with custom theme
  - `src/constants/status-colors.ts` exists with color mappings
  - `next.config.js` configured for tree-shaking

- ✅ **App Setup**
  - `src/app/layout.tsx` wraps app with ConfigProvider + AntApp
  - Test page renders Ant Design components correctly
  - `App.useApp()` message.success() works

- ✅ **Cleanup**
  - No Tailwind config files (tailwind.config.ts, postcss.config.js)
  - No Tailwind imports in CSS files
  - Most Tailwind utility classes removed from components

- ✅ **Build**
  - `npm run build` succeeds
  - No critical errors in console
  - Dev server runs: `npm run dev`

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'antd'"
**Solution:** Run `npm install` and restart dev server

### Issue 2: Styles not applying in SSR
**Solution:** Ensure `AntdRegistry` from `@ant-design/nextjs-registry` wraps ConfigProvider

### Issue 3: Theme colors not working
**Solution:** Check theme.ts exports default, and ConfigProvider receives `theme={theme}` prop

### Issue 4: Icons not rendering
**Solution:** Verify `@ant-design/icons` installed, import specific icons like `import { CheckCircleOutlined } from '@ant-design/icons'`

### Issue 5: Build warnings about duplicate React
**Solution:** Check webpack config in next.config.js, ensure single instance of react/react-dom

---

## Estimated Time Breakdown

| Task | Time | Cumulative |
|------|------|------------|
| 1.1 Install dependencies | 15 min | 15 min |
| 1.2 Remove old dependencies | 15 min | 30 min |
| 1.3 Create theme config | 30 min | 1h |
| 1.4 Create status colors | 15 min | 1h 15min |
| 1.5 Wrap app with ConfigProvider | 45 min | 2h |
| 1.6 Test basic component | 30 min | 2h 30min |
| 1.7 Configure tree-shaking | 30 min | 3h |
| 1.8 Remove Tailwind classes | 45 min | 3h 45min |
| Testing & validation | 15 min | **4h** |

---

## Next Steps

Once Phase 1 is complete and validated:
- ✅ Proceed to **Phase 2: Layout Architecture**
- ✅ Commit changes: `git add . && git commit -m "feat: Phase 1 - Setup Ant Design foundation"`
- ✅ Optional: Push to feature branch for review

---

## References

- [Ant Design v5 Next.js Integration](https://ant.design/docs/react/use-with-next)
- [Theme Customization](https://ant.design/docs/react/customize-theme)
- [CSS-in-JS SSR with Next.js](https://ant.design/docs/react/server-side-rendering)
- [Project UI Rules Document](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md)
