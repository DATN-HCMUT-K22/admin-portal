# Tailwind CSS v4 + Ant Design v6 Integration Plan

**Project:** Admin Dashboard (Next.js 16.2.3 + TypeScript)  
**Status:** Planning Phase  
**Created:** 2026-05-20  
**Estimated Time:** 6-8 hours

## Executive Summary

This plan details the integration of Tailwind CSS v4 alongside Ant Design v6 in a Next.js 16 App Router project. The goal is to use Ant Design for UI components and Tailwind for utility-based styling (layout, spacing, responsive design).

## Current State

- ✅ Ant Design 6.4.3 installed and configured
- ✅ Custom theme with Geist font family
- ✅ AdminLayout with dark sidebar + glassmorphism header
- ❌ Tailwind CSS removed (no config, no packages)
- ⚠️ Some pages still use Tailwind-style classNames (orphaned utilities)
- 🔄 Ant Design migration in progress

## Goals

1. Install Tailwind CSS v4 using @tailwindcss/postcss
2. Configure PostCSS to work with both Tailwind and Ant Design
3. Set up CSS layer ordering to prevent style conflicts
4. Preserve Ant Design's CSS-in-JS system
5. Enable Tailwind utilities for custom layouts
6. Provide clear usage guidelines

## Implementation Phases

| Phase | Description | Time | Files |
|-------|-------------|------|-------|
| [Phase 1](./phase-1-dependencies.md) | Install Tailwind CSS v4 packages | 30min | package.json |
| [Phase 2](./phase-2-postcss.md) | Configure PostCSS build pipeline | 1h | postcss.config.mjs |
| [Phase 3](./phase-3-tailwind-config.md) | Configure Tailwind settings | 1.5h | tailwind.config.ts |
| [Phase 4](./phase-4-styling.md) | Update global styles & CSS layers | 1.5h | globals.css |
| [Phase 5](./phase-5-integration.md) | Test integration & fix conflicts | 1.5h | Multiple |
| [Phase 6](./phase-6-documentation.md) | Document usage patterns | 1h | New docs |

**Total Estimated Time:** 6-8 hours

## Design Decisions

### Why Tailwind CSS v4?

- Modern architecture with better performance
- PostCSS plugin approach (easier integration)
- Better compatibility with CSS-in-JS libraries
- Smaller bundle sizes with improved tree-shaking
- Native CSS features (CSS variables, layers)

### Library Division of Responsibility

| Use Case | Library | Rationale |
|----------|---------|-----------|
| UI Components | Ant Design | Complete, consistent component system |
| Layout (Flex, Grid) | Tailwind | Quick utility classes (`flex`, `grid`) |
| Spacing | Tailwind | Rapid prototyping (`p-4`, `m-2`, `gap-4`) |
| Typography | Ant Design | Consistent with theme |
| Colors | Ant Design | Centralized theme tokens |
| Responsive Design | Both | Ant Design Grid + Tailwind breakpoints |
| Forms | Ant Design | Built-in validation & state management |
| Buttons, Inputs | Ant Design | Consistent component styling |

### CSS Layer Strategy

```css
@layer tailwind-base, antd, tailwind-utilities;
```

**Order matters:**
1. `tailwind-base` - Tailwind's reset/normalize
2. `antd` - Ant Design component styles (highest priority)
3. `tailwind-utilities` - Tailwind utilities (can override when needed)

This ensures Ant Design components render correctly while allowing Tailwind utilities for custom styling.

## Risk Assessment

### High Risk
- **Style conflicts:** Ant Design and Tailwind both provide base styles
  - *Mitigation:* CSS layers, careful preflight configuration
- **Build pipeline issues:** PostCSS ordering matters
  - *Mitigation:* Test build extensively, follow official docs

### Medium Risk
- **Bundle size increase:** Adding Tailwind increases CSS output
  - *Mitigation:* Proper content scanning, purge unused classes
- **Learning curve:** Team needs to know when to use which library
  - *Mitigation:* Clear documentation, code examples

### Low Risk
- **Next.js 16 compatibility:** Both libraries support Next.js 16
- **SSR issues:** Both handle server-side rendering well

## Success Criteria

- [ ] Tailwind CSS v4 installed and configured
- [ ] Build process works (`npm run build` succeeds)
- [ ] No style conflicts between libraries
- [ ] Ant Design components render correctly
- [ ] Tailwind utilities work as expected
- [ ] Documentation complete with examples
- [ ] Team understands usage patterns

## Rollback Plan

If integration fails:
1. Remove Tailwind packages from package.json
2. Delete tailwind.config.ts
3. Delete postcss.config.mjs
4. Restore original globals.css
5. Run `npm install` to clean dependencies
6. Build and test

## Next Steps

1. Review this plan with team
2. Get approval to proceed
3. Start with Phase 1 (Dependencies)
4. Test each phase before moving to next
5. Document any issues encountered

---

**Plan Author:** Claude Code  
**Review Status:** Pending  
**Approval:** Pending
