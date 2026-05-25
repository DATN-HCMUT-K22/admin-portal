# Phase 1: Install Dependencies

**Estimated Time:** 30 minutes  
**Difficulty:** Easy

## Overview

Install Tailwind CSS v4 and related packages using the modern @tailwindcss/postcss approach.

## Prerequisites

- Node.js 18+ installed
- npm 9+ or equivalent package manager
- Existing Next.js 16.2.3 project

## Steps

### Step 1.1: Install Tailwind CSS v4

```bash
npm install -D tailwindcss@next @tailwindcss/postcss@next
```

**Package Breakdown:**
- `tailwindcss@next` - Tailwind CSS v4 (currently in beta/rc)
- `@tailwindcss/postcss@next` - PostCSS plugin for Tailwind v4

**Note:** As of May 2026, Tailwind v4 may be stable. If so, remove `@next` tags:
```bash
npm install -D tailwindcss @tailwindcss/postcss
```

### Step 1.2: Install PostCSS (if not present)

PostCSS comes with Next.js, but verify:

```bash
npm list postcss
```

Expected output:
```
admin-page@0.1.0 /path/to/project
└─┬ next@16.2.3
  └── postcss@8.4.31
```

If postcss is missing (unlikely), install:
```bash
npm install -D postcss
```

### Step 1.3: Verify Installation

Check package.json devDependencies:

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    // ... other deps
  }
}
```

### Step 1.4: Verify Node Modules

```bash
ls node_modules/.bin/ | grep tailwind
```

Expected output:
```
tailwind
tailwindcss
```

## Verification Checklist

- [ ] `tailwindcss` package installed
- [ ] `@tailwindcss/postcss` package installed
- [ ] `postcss` available (via Next.js)
- [ ] No installation errors
- [ ] package.json updated
- [ ] node_modules contains tailwindcss

## Troubleshooting

### Issue: "Cannot find module tailwindcss"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Version conflicts

**Solution:** Check for conflicting PostCSS plugins:
```bash
npm list postcss
```

Remove any outdated PostCSS plugins that conflict with Tailwind v4.

### Issue: Installation hangs

**Solution:**
```bash
npm cache clean --force
npm install -D tailwindcss@next @tailwindcss/postcss@next
```

## Expected Output

After successful installation:

```bash
$ npm list tailwindcss
admin-page@0.1.0 /media/ngocha/D/admin-page
└── tailwindcss@4.0.0
```

## Next Steps

Proceed to [Phase 2: Configure PostCSS](./phase-2-postcss.md)

## References

- [Tailwind CSS v4 Installation Guide](https://tailwindcss.com/docs/installation/postcss)
- [Next.js PostCSS Documentation](https://nextjs.org/docs/app/building-your-application/configuring/post-css)

---

**Phase Status:** Not Started  
**Dependencies:** None  
**Blocks:** Phase 2
