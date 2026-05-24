# Phase 3: Configure Tailwind CSS

**Estimated Time:** 1.5 hours  
**Difficulty:** Medium-High

## Overview

Configure Tailwind CSS to work alongside Ant Design without conflicts. This includes content scanning, theme extension, and preflight customization.

## Prerequisites

- Phase 1 complete (packages installed)
- Phase 2 complete (PostCSS configured)
- Understanding of Tailwind configuration

## Steps

### Step 3.1: Create tailwind.config.ts

Create Tailwind configuration at project root:

**File:** `/media/ngocha/D/admin-page/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  // Content paths for Tailwind to scan
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/providers/**/*.{js,ts,jsx,tsx}',
    // Don't scan node_modules to avoid purging Ant Design classes
    // '!./node_modules/**',
  ],

  // Important: Use a prefix if you want to avoid conflicts (optional)
  // prefix: 'tw-',

  // Preserve existing CSS from other sources
  important: false,

  theme: {
    extend: {
      // Extend Ant Design theme colors (optional)
      colors: {
        // Map Ant Design theme colors to Tailwind
        'ant-primary': '#2563eb',      // From theme.ts
        'ant-success': '#52c41a',
        'ant-warning': '#fa8c16',
        'ant-error': '#ff4d4f',
        'ant-info': '#722ed1',
      },

      // Use Geist font (matching Ant Design config)
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },

      // Extend spacing to match Ant Design
      spacing: {
        // Ant Design uses: 8, 12, 16, 24, 32, 40, 48, etc.
        // Tailwind default works well, but we can add Ant Design values
      },

      // Border radius to match Ant Design
      borderRadius: {
        'ant-sm': '8px',
        'ant-default': '12px',
        'ant-lg': '16px',
        'ant-xl': '20px',
      },

      // Shadows matching Ant Design
      boxShadow: {
        'ant-default': '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'ant-secondary': '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      },

      // Breakpoints matching Ant Design
      screens: {
        'xs': '576px',   // Ant Design xs breakpoint
        'sm': '576px',   // Mobile landscape
        'md': '768px',   // Tablet
        'lg': '992px',   // Desktop (Ant Design collapses sidebar here)
        'xl': '1200px',  // Large desktop
        '2xl': '1600px', // Extra large
      },
    },
  },

  // Configure which variants to generate
  variants: {
    extend: {
      // Enable dark mode variants (if needed in future)
      // backgroundColor: ['dark'],
      // textColor: ['dark'],
    },
  },

  // Plugins
  plugins: [
    // Add Tailwind plugins here if needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],

  // Disable preflight partially to avoid conflicts with Ant Design
  corePlugins: {
    // We'll handle preflight in globals.css with CSS layers
    // preflight: false, // Don't disable - we'll control it with @layer
  },
}

export default config
```

### Step 3.2: Configuration Breakdown

#### Content Paths

```typescript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/hooks/**/*.{js,ts,jsx,tsx}',
  './src/providers/**/*.{js,ts,jsx,tsx}',
]
```

**Why these paths?**
- Scans all TSX/JSX files in src directory
- Includes hooks and providers (may contain className)
- Excludes node_modules (critical for Ant Design)
- Covers Next.js App Router structure

**What NOT to include:**
```typescript
// ❌ Don't scan node_modules
'./node_modules/**',        // Will purge Ant Design classes!

// ❌ Don't scan public directory
'./public/**',              // No React components here
```

#### Theme Extension Strategy

**Option A: Minimal Extension (Recommended)**

```typescript
theme: {
  extend: {
    // Only add what you need beyond Tailwind defaults
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    },
  },
}
```

**Option B: Full Ant Design Mapping**

```typescript
theme: {
  extend: {
    colors: {
      'ant-primary': '#2563eb',
      'ant-success': '#52c41a',
      'ant-warning': '#fa8c16',
      'ant-error': '#ff4d4f',
      'ant-info': '#722ed1',
      'ant-bg-layout': '#f8fafc',
      'ant-bg-container': '#ffffff',
      'ant-border': '#e2e8f0',
    },
  },
}
```

**When to use each:**
- Use Option A if you'll primarily use Ant Design colors
- Use Option B if you need Tailwind utilities with Ant Design colors

### Step 3.3: Preflight Considerations

Tailwind's preflight (CSS reset) can conflict with Ant Design. We have two options:

**Option 1: Keep Preflight (Recommended)**

Use CSS layers to control order (handled in Phase 4):

```typescript
corePlugins: {
  // Don't disable preflight - we'll manage it with @layer
}
```

**Option 2: Disable Preflight**

```typescript
corePlugins: {
  preflight: false,  // Ant Design handles base styles
}
```

**Recommendation:** Keep preflight enabled and use CSS layers (Phase 4) for better control.

### Step 3.4: Prefix Strategy (Optional)

If you want to avoid any potential conflicts:

```typescript
prefix: 'tw-',
```

**Effect:**
```tsx
// Without prefix
<div className="flex items-center gap-4">

// With prefix
<div className="tw-flex tw-items-center tw-gap-4">
```

**Recommendation:** Don't use prefix initially. Add it only if you encounter conflicts.

## Alternative Configurations

### Minimal Configuration (Simple Projects)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

### Advanced Configuration (Large Projects)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Safelist classes that are dynamically generated
  safelist: [
    // If Ant Design classes are being purged, add them here
    // 'ant-btn',
    // 'ant-card',
  ],

  theme: {
    extend: {
      // Full theme extension matching Ant Design
      colors: {
        'ant-primary': '#2563eb',
        'ant-success': '#52c41a',
        'ant-warning': '#fa8c16',
        'ant-error': '#ff4d4f',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui'],
      },
      borderRadius: {
        'ant': '12px',
      },
    },
  },

  plugins: [
    // Useful Tailwind plugins
    require('@tailwindcss/forms'),       // Better form styles
    require('@tailwindcss/typography'),  // Prose classes
  ],
}

export default config
```

## Verification Checklist

- [ ] tailwind.config.ts created at project root
- [ ] Content paths include all component directories
- [ ] Content paths exclude node_modules
- [ ] Theme extends Geist font family
- [ ] No syntax errors in config file
- [ ] TypeScript types import correctly

## Troubleshooting

### Issue: "Cannot find module 'tailwindcss'"

**Solution:**
```bash
npm install -D tailwindcss@next
```

### Issue: Ant Design classes being purged

**Symptoms:**
- Ant Design buttons/components lose styling in production build
- Classes like `ant-btn`, `ant-card` missing in final CSS

**Solution 1:** Ensure node_modules is NOT in content array

```typescript
content: [
  './src/**/*.{js,ts,jsx,tsx}',
  // '!./node_modules/**',  // Explicitly exclude if needed
]
```

**Solution 2:** Add safelist for dynamic Ant Design classes

```typescript
safelist: [
  {
    pattern: /^ant-/,  // Keep all Ant Design classes
  },
]
```

### Issue: TypeScript errors in config file

**Solution:** Install types:
```bash
npm install -D @types/node
```

And verify Config import:
```typescript
import type { Config } from 'tailwindcss'
```

### Issue: Tailwind utilities not working

**Cause:** Content paths don't match your file structure

**Solution:** Verify paths:
```bash
ls src/components/**/*.tsx
ls src/app/**/*.tsx
```

Update content array to match actual directory structure.

## Testing

### Test 3.1: Validate Configuration

```bash
npx tailwindcss --help
```

Should show Tailwind CLI is available.

### Test 3.2: Check Content Scanning

```bash
# This will be tested in Phase 5 during build
npm run build
```

## Expected Output

After configuration:
- tailwind.config.ts exists at project root
- No syntax errors when importing config
- Ready for Tailwind directives in CSS

## Next Steps

Proceed to [Phase 4: Update Global Styles](./phase-4-styling.md)

## References

- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind Content Configuration](https://tailwindcss.com/docs/content-configuration)
- [Tailwind Theme Configuration](https://tailwindcss.com/docs/theme)
- [Ant Design Theme Tokens](https://ant.design/docs/react/customize-theme)

---

**Phase Status:** Not Started  
**Dependencies:** Phase 2  
**Blocks:** Phase 4

## File Checklist

After this phase, you should have:
- [ ] `/media/ngocha/D/admin-page/tailwind.config.ts` (new file)
