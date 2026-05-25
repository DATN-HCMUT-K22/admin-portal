# Phase 4: Update Global Styles & CSS Layers

**Estimated Time:** 1.5 hours  
**Difficulty:** Medium-High

## Overview

Update globals.css to import Tailwind directives and configure CSS layer ordering to prevent conflicts between Tailwind and Ant Design.

## Prerequisites

- Phase 1-3 complete (all packages and configs ready)
- Understanding of CSS @layer directive
- Backup of current globals.css

## Current State

**Current globals.css:**
```css
/**
 * Global styles for Admin Portal
 * Using Ant Design v5 with custom theme
 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#__next {
  height: 100%;
}
```

## Steps

### Step 4.1: Backup Current globals.css

```bash
cp /media/ngocha/D/admin-page/src/app/globals.css /media/ngocha/D/admin-page/src/app/globals.css.backup
```

### Step 4.2: Update globals.css with Tailwind Directives

**File:** `/media/ngocha/D/admin-page/src/app/globals.css`

```css
/**
 * Global styles for Admin Portal
 * Using Ant Design v6 + Tailwind CSS v4
 * 
 * Layer Order:
 * 1. tailwind-base (Tailwind reset)
 * 2. antd (Ant Design component styles - highest priority)
 * 3. tailwind-utilities (Tailwind utilities)
 */

/* Import Tailwind's base styles */
@import "tailwindcss/base" layer(tailwind-base);

/* Import Tailwind's component styles */
@import "tailwindcss/components" layer(tailwind-components);

/* Import Tailwind's utility styles */
@import "tailwindcss/utilities" layer(tailwind-utilities);

/* Define layer order - CRITICAL for preventing conflicts */
@layer tailwind-base, antd, tailwind-components, tailwind-utilities;

/* Base styles in Tailwind layer */
@layer tailwind-base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100%;
  }

  body {
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #__next {
    height: 100%;
  }
}

/* Ant Design styles will be injected into the 'antd' layer by CSS-in-JS */
/* This layer has higher priority than tailwind-base but lower than tailwind-utilities */

/* Custom utility overrides (if needed) */
@layer tailwind-utilities {
  /* Add custom utilities here */
  
  /* Example: Ensure Tailwind utilities can override Ant Design when needed */
  .tw-override {
    /* Force Tailwind utilities to take precedence */
  }
}

/* Global custom styles (outside layers) */
/* These have the highest specificity */

/* Ant Design component customizations */
.ant-layout {
  /* Ant Design's CSS-in-JS will handle most styling */
  /* Add overrides here only if absolutely necessary */
}

/* Smooth transitions for layout changes */
.ant-layout-sider {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar styling (optional) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Focus visible styles for accessibility */
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Ensure Geist font variables are available */
/* These are set in layout.tsx and used by both Ant Design and Tailwind */
```

### Step 4.3: Alternative Configuration (Simpler)

If CSS layers cause issues, use this simpler approach:

**File:** `/media/ngocha/D/admin-page/src/app/globals.css`

```css
/**
 * Global styles for Admin Portal
 * Simple approach: Import Tailwind, let Ant Design CSS-in-JS take precedence
 */

/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base reset (after Tailwind) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
}

body {
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#__next {
  height: 100%;
}

/* Ant Design component overrides (if needed) */
/* Ant Design's CSS-in-JS has high specificity by default */

/* Custom global styles */
*:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

## Layer Strategy Explained

### Why CSS Layers?

CSS layers control the cascade order independently of specificity:

```css
@layer tailwind-base, antd, tailwind-utilities;
```

**Layer Priority (low to high):**
1. `tailwind-base` - Lowest priority (resets, base styles)
2. `antd` - Medium priority (Ant Design components)
3. `tailwind-utilities` - Highest priority (utility classes)

### How Ant Design Fits In

Ant Design uses CSS-in-JS (@ant-design/cssinjs) which injects styles at runtime. We need to tell it to use the `antd` layer.

**Update:** `/media/ngocha/D/admin-page/src/providers/app-providers.tsx`

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ConfigProvider, App } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthProvider } from "@/providers/auth-provider";
import theme from "@/config/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AntdRegistry 
        // Tell Ant Design to inject styles into the 'antd' layer
        layer={true}
      >
        <ConfigProvider 
          theme={{
            ...theme,
            // Ensure Ant Design styles use the 'antd' layer
            cssVar: true,
            hashed: false,
          }}
        >
          <App>
            <AuthProvider>{children}</AuthProvider>
          </App>
        </ConfigProvider>
      </AntdRegistry>
    </QueryClientProvider>
  );
}
```

**Note:** Check @ant-design/nextjs-registry documentation for the correct layer configuration prop. The exact API may vary by version.

## Preflight Adjustments

Tailwind's preflight can reset styles that Ant Design expects. Here's how to handle it:

### Option 1: Keep Preflight, Add Exceptions

```css
@layer tailwind-base {
  /* Disable Tailwind's button reset for Ant Design buttons */
  button.ant-btn {
    /* Preserve Ant Design button styles */
    all: revert;
  }

  /* Preserve Ant Design input styles */
  input.ant-input {
    all: revert;
  }
}
```

### Option 2: Disable Preflight Selectively

In tailwind.config.ts:

```typescript
corePlugins: {
  preflight: false,  // Disable Tailwind's CSS reset
}
```

Then add your own minimal reset in globals.css.

**Recommendation:** Start with Option 1 (keep preflight). Only use Option 2 if you encounter conflicts.

## Verification Checklist

- [ ] globals.css backed up
- [ ] Tailwind directives added to globals.css
- [ ] CSS layers defined in correct order
- [ ] Base styles moved to @layer directive
- [ ] No syntax errors in CSS file
- [ ] app-providers.tsx updated for layer support (if applicable)

## Troubleshooting

### Issue: "Unknown at-rule @tailwind"

**Cause:** Editor doesn't recognize Tailwind directives

**Solution:** Install VS Code extension:
- Install "Tailwind CSS IntelliSense" extension
- Restart VS Code

### Issue: Styles not applying in dev mode

**Cause:** PostCSS not processing CSS file

**Solution:**
1. Restart Next.js dev server
2. Clear .next cache: `rm -rf .next`
3. Check postcss.config.mjs exists

### Issue: Ant Design buttons lose styling

**Cause:** Tailwind preflight resetting button styles

**Solution:** Add exception in globals.css:

```css
@layer tailwind-base {
  /* Preserve Ant Design component styles */
  [class^="ant-"],
  [class*=" ant-"] {
    all: revert-layer;
  }
}
```

### Issue: CSS layers not working

**Cause:** Browser doesn't support @layer (unlikely in 2026)

**Solution:** Use the simpler approach without @layer:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Issue: Build fails with CSS errors

**Cause:** Invalid CSS syntax or PostCSS misconfiguration

**Solution:**
1. Validate globals.css syntax
2. Check postcss.config.mjs
3. Verify Tailwind directives format:

```css
/* Tailwind v4 - new syntax */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* OR Tailwind v3 - old syntax */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Check which syntax Tailwind v4 expects in 2026 documentation.

## Testing

### Test 4.1: Verify CSS Processing

Start dev server:

```bash
npm run dev
```

Check browser console for CSS errors. No errors = success.

### Test 4.2: Test Tailwind Utilities

Add a test component:

**File:** `/media/ngocha/D/admin-page/src/app/test-tailwind/page.tsx`

```tsx
export default function TestTailwind() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tailwind Test</h1>
      <div className="flex gap-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          Tailwind Utilities Working
        </div>
      </div>
    </div>
  )
}
```

Visit http://localhost:5173/test-tailwind

Expected: Blue box with white text, padding, and rounded corners.

### Test 4.3: Test Ant Design Components

Add Ant Design button to test page:

```tsx
import { Button } from 'antd'

export default function TestTailwind() {
  return (
    <div className="p-8 space-y-4">
      <Button type="primary">Ant Design Button</Button>
      <div className="flex gap-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          Tailwind Utilities
        </div>
      </div>
    </div>
  )
}
```

Expected: Both Ant Design button and Tailwind utilities work correctly.

### Test 4.4: Test Production Build

```bash
npm run build
```

Expected: Build succeeds with no CSS errors.

## Expected Output

After this phase:
- Tailwind utilities work in development
- Ant Design components render correctly
- No visual regressions on existing pages
- Build succeeds without errors

## Next Steps

Proceed to [Phase 5: Integration Testing](./phase-5-integration.md)

## References

- [CSS @layer Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [Tailwind CSS Functions & Directives](https://tailwindcss.com/docs/functions-and-directives)
- [Ant Design CSS-in-JS](https://ant.design/docs/react/compatible-style)

---

**Phase Status:** Not Started  
**Dependencies:** Phase 3  
**Blocks:** Phase 5

## File Checklist

After this phase, you should have:
- [ ] `/media/ngocha/D/admin-page/src/app/globals.css` (updated)
- [ ] `/media/ngocha/D/admin-page/src/app/globals.css.backup` (backup)
- [ ] `/media/ngocha/D/admin-page/src/app/test-tailwind/page.tsx` (test page)
- [ ] `/media/ngocha/D/admin-page/src/providers/app-providers.tsx` (potentially updated)
