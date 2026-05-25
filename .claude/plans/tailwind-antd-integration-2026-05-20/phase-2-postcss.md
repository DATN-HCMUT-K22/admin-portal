# Phase 2: Configure PostCSS

**Estimated Time:** 1 hour  
**Difficulty:** Medium

## Overview

Configure PostCSS to process both Tailwind CSS and Next.js built-in optimizations. The order of plugins matters for proper style generation.

## Prerequisites

- Phase 1 complete (Tailwind packages installed)
- Understanding of PostCSS plugin order

## Steps

### Step 2.1: Create postcss.config.mjs

Create a new file at project root:

**File:** `/media/ngocha/D/admin-page/postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // Next.js includes autoprefixer by default, but we can be explicit
    'autoprefixer': {},
  },
}

export default config
```

**Why .mjs extension?**
- ES modules syntax (import/export)
- Better compatibility with Next.js 16
- Avoids "type": "module" in package.json

### Step 2.2: Alternative Configuration (if .mjs doesn't work)

If you encounter issues with .mjs, use CommonJS:

**File:** `/media/ngocha/D/admin-page/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
}
```

### Step 2.3: Plugin Order Explanation

**Critical:** Plugin order matters in PostCSS!

```javascript
{
  plugins: {
    '@tailwindcss/postcss': {},  // 1. Process Tailwind directives
    'autoprefixer': {},           // 2. Add vendor prefixes
  }
}
```

**Why this order?**
1. Tailwind processes `@tailwind` directives first
2. Autoprefixer adds browser prefixes to generated CSS
3. Next.js applies its own optimizations last

### Step 2.4: Verify Configuration Syntax

Test configuration syntax:

```bash
node -e "import('./postcss.config.mjs').then(m => console.log('✓ Config valid:', JSON.stringify(m.default, null, 2)))"
```

Expected output:
```json
✓ Config valid: {
  "plugins": {
    "@tailwindcss/postcss": {},
    "autoprefixer": {}
  }
}
```

## Configuration Options

### Basic Configuration (Recommended)

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
}

export default config
```

### Advanced Configuration (Optional)

With additional PostCSS plugins:

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
    // Optional: Add PostCSS Preset Env for future CSS features
    // 'postcss-preset-env': {
    //   stage: 3,
    //   features: {
    //     'custom-properties': false, // Tailwind handles this
    //   },
    // },
  },
}

export default config
```

**Note:** Don't add unnecessary plugins. Keep it simple for Tailwind + Next.js.

## Verification Checklist

- [ ] postcss.config.mjs created at project root
- [ ] Plugin order correct (@tailwindcss/postcss first)
- [ ] Syntax validation passes
- [ ] No extra plugins added (unless needed)

## Troubleshooting

### Issue: "Cannot find module @tailwindcss/postcss"

**Cause:** Plugin installed but PostCSS can't find it

**Solution:**
```bash
npm install -D @tailwindcss/postcss@next
# Verify installation
npm list @tailwindcss/postcss
```

### Issue: "Invalid PostCSS Plugin"

**Cause:** Incorrect plugin syntax

**Solution:** Ensure using object syntax, not array:
```javascript
// ❌ Wrong (array syntax)
plugins: [
  '@tailwindcss/postcss',
]

// ✅ Correct (object syntax for v4)
plugins: {
  '@tailwindcss/postcss': {},
}
```

### Issue: Build warnings about plugin order

**Solution:** Move @tailwindcss/postcss to first position:
```javascript
plugins: {
  '@tailwindcss/postcss': {},  // Must be first
  'autoprefixer': {},
  // other plugins...
}
```

### Issue: Styles not applying

**Cause:** PostCSS config not picked up by Next.js

**Solution:**
1. Restart Next.js dev server
2. Clear .next cache: `rm -rf .next`
3. Rebuild: `npm run build`

## Testing

### Test 2.1: Check PostCSS Config Loading

```bash
# Start dev server with verbose output
npm run dev -- --turbo
```

Look for PostCSS plugin loading in console output.

### Test 2.2: Verify Plugin Chain

Create a test CSS file:

**File:** `/media/ngocha/D/admin-page/test-tailwind.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.test {
  @apply flex items-center;
}
```

This file will be used in Phase 4 to test full integration.

## Expected Behavior

After configuration:
- Next.js dev server starts without errors
- No PostCSS warnings in console
- Ready for Tailwind directives in CSS files

## Next Steps

Proceed to [Phase 3: Configure Tailwind](./phase-3-tailwind-config.md)

## References

- [PostCSS Documentation](https://postcss.org/)
- [Next.js PostCSS Configuration](https://nextjs.org/docs/app/building-your-application/configuring/post-css)
- [Tailwind CSS v4 PostCSS Plugin](https://tailwindcss.com/docs/installation/postcss)

---

**Phase Status:** Not Started  
**Dependencies:** Phase 1  
**Blocks:** Phase 3

## File Checklist

After this phase, you should have:
- [ ] `/media/ngocha/D/admin-page/postcss.config.mjs` (new file)
