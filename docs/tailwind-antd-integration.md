# Tailwind CSS + Ant Design Integration

**Status:** ✅ Complete  
**Date:** 2026-05-20  
**Version:** Tailwind v4.3.0 + Ant Design v6.4.3

## Overview

This project uses **both** Tailwind CSS v4 and Ant Design v6 together:

- **Ant Design:** UI components (buttons, forms, tables, modals)
- **Tailwind CSS:** Utility classes (layout, spacing, responsive design)

## Installation

### Dependencies

```json
{
  "devDependencies": {
    "tailwindcss": "^4.3.0",
    "@tailwindcss/postcss": "^4.3.0",
    "autoprefixer": "^10.5.0"
  }
}
```

## Configuration Files

### PostCSS Configuration

**File:** `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
}

export default config
```

**Why this order?**
1. Tailwind processes CSS first
2. Autoprefixer adds vendor prefixes
3. Next.js applies its own optimizations

### Tailwind Configuration

**File:** `tailwind.config.ts`

**Key Settings:**

**Content Paths:**
```typescript
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
]
```

**Theme Extensions:**
```typescript
theme: {
  extend: {
    // Ant Design colors
    colors: {
      'ant-primary': '#2563eb',
      'ant-success': '#52c41a',
      'ant-warning': '#fa8c16',
      'ant-error': '#ff4d4f',
    },
    // Geist fonts (matching Ant Design)
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    },
    // Breakpoints matching Ant Design
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1600px',
    },
  },
}
```

### Global Styles

**File:** `src/app/globals.css`

**CSS Layer Ordering:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base, antd, utilities;
```

**Why this order?**
1. **base** - Tailwind's reset/normalize (lowest priority)
2. **antd** - Ant Design component styles (medium priority)
3. **utilities** - Tailwind utilities (highest priority)

This ensures:
- Ant Design components render correctly
- Tailwind utilities can override when explicitly applied
- No unexpected style conflicts

## Library Division

| Feature | Library | Example |
|---------|---------|---------|
| Layout | Tailwind | `flex`, `grid`, `container` |
| Spacing | Tailwind | `p-4`, `m-2`, `gap-4`, `space-y-4` |
| Buttons | Ant Design | `<Button type="primary">` |
| Forms | Ant Design | `<Form>`, `<Input>`, `<Select>` |
| Tables | Ant Design | `<Table>` |
| Modals | Ant Design | `<Modal>`, `<Drawer>` |
| Typography | Ant Design | `<Typography>` (preferred) |
| Colors | Ant Design | Use theme colors via components |
| Responsive | Both | Ant `<Grid>` + Tailwind breakpoints |
| Icons | Ant Design | `@ant-design/icons` |

## Usage Patterns

### Pattern 1: Ant Design Component + Tailwind Layout

```tsx
import { Button, Card } from 'antd'

export default function Page() {
  return (
    <div className="p-8 space-y-4">
      <Card className="shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Title</h2>
          <Button type="primary">Action</Button>
        </div>
      </Card>
    </div>
  )
}
```

### Pattern 2: Responsive Grid

```tsx
import { Card } from 'antd'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>Card 1</Card>
      <Card>Card 2</Card>
      <Card>Card 3</Card>
    </div>
  )
}
```

### Pattern 3: Form with Tailwind Spacing

```tsx
import { Form, Input, Button } from 'antd'

export default function MyForm() {
  return (
    <div className="max-w-md mx-auto p-6">
      <Form layout="vertical">
        <Form.Item label="Name" name="name">
          <Input />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button>Cancel</Button>
          <Button type="primary" htmlType="submit">Submit</Button>
        </div>
      </Form>
    </div>
  )
}
```

## Best Practices

### DO ✅

- Use Ant Design for **all UI components**
- Use Tailwind for **layout and spacing**
- Use Ant Design theme colors (via components)
- Use Tailwind utilities for quick prototyping
- Keep consistent spacing with Tailwind (`p-4`, `gap-4`)

### DON'T ❌

- Don't use Tailwind color classes on Ant Design components
- Don't rebuild Ant Design components with Tailwind
- Don't override Ant Design styles with `!important`
- Don't use both libraries for the same purpose

## Common Mistakes

### Mistake 1: Overriding Ant Design Colors

```tsx
// ❌ Bad - Conflicts with theme
<Button type="primary" className="bg-blue-600">

// ✅ Good - Use Ant Design's type prop
<Button type="primary">
```

### Mistake 2: Recreating Components

```tsx
// ❌ Bad - Unnecessary work
<div className="rounded-lg border border-gray-300 p-4">
  Content
</div>

// ✅ Good - Use Ant Design Card
<Card>Content</Card>
```

### Mistake 3: Inconsistent Spacing

```tsx
// ❌ Bad - Mixed spacing systems
<div style={{ padding: '20px' }} className="mb-4">

// ✅ Good - Consistent Tailwind spacing
<div className="p-5 mb-4">
```

## Troubleshooting

### Issue: Ant Design styles not applying

**Check:**
1. AntdRegistry in layout.tsx
2. ConfigProvider wrapping app
3. CSS layer order in globals.css

### Issue: Tailwind utilities not working

**Check:**
1. Tailwind directives in globals.css
2. Content paths in tailwind.config.ts
3. PostCSS config correct
4. Dev server restarted

### Issue: Style conflicts

**Solution:** CSS layers handle this automatically. If conflicts persist, check layer order in globals.css.

## Performance

**Bundle Sizes (Development):**
- Tailwind CSS: Utilities as needed
- Ant Design: ~50-80KB (gzipped, CSS-in-JS)

**Optimization Tips:**
- Purge unused Tailwind classes (automatic)
- Tree-shake Ant Design components (import individually)
- Use dynamic imports for heavy pages

## Testing

**Test Page:** `/test-integration`

Visit this page to verify:
- Tailwind utilities work (layout, spacing, colors)
- Ant Design components render correctly
- Both libraries work together without conflicts

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Ant Design Documentation](https://ant.design/components)
- [Project Theme Config](/src/config/theme.ts)
- [Usage Guidelines](/docs/tailwind-usage-guide.md)

---

**Last Updated:** 2026-05-20  
**Maintainer:** Development Team
