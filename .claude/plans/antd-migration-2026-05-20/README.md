# Ant Design v5 Migration Plan

**Created:** 2026-05-20  
**Status:** Ready for Implementation  
**Estimated Effort:** 50 hours (1-2 weeks solo, 3-5 days with pair)

---

## Quick Start

### Before You Begin
1. Read the [main plan file](./plan.md) for overview and context
2. Review [brainstorming report](/media/ngocha/D/admin-page/docs/brainstorm-ant-design-migration-2026-05-20.md) for decision rationale
3. Check [UI rules document](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md) for patterns

### Execution Order
Execute phases sequentially:

1. **[Phase 1: Foundation Setup](./phase-1-foundation.md)** (4h) - BLOCKING all phases
2. **[Phase 2: Layout Architecture](./phase-2-layout.md)** (6h) - BLOCKING phase 4
3. **[Phase 3: Component Patterns](./phase-3-patterns.md)** (8h) - BLOCKING phase 4
4. **[Phase 4: Page Migration](./phase-4-pages.md)** (12h) - Core implementation
5. **[Phase 5: Advanced Patterns](./phase-5-advanced.md)** (8h) - Can defer if time-constrained
6. **[Phase 6: Documentation Update](./phase-6-docs.md)** (2h) - Final polish

---

## Files in This Plan

| File | Description | Est. Time |
|------|-------------|-----------|
| [plan.md](./plan.md) | Main plan with overview, strategy, risks | - |
| [phase-1-foundation.md](./phase-1-foundation.md) | Install Ant Design, remove Tailwind/Zod | 4h |
| [phase-2-layout.md](./phase-2-layout.md) | Build AdminLayout with sidebar + header | 6h |
| [phase-3-patterns.md](./phase-3-patterns.md) | Create reusable component patterns | 8h |
| [phase-4-pages.md](./phase-4-pages.md) | Migrate all pages to Ant Design | 12h |
| [phase-5-advanced.md](./phase-5-advanced.md) | Bulk actions, RBAC, optimization | 8h |
| [phase-6-docs.md](./phase-6-docs.md) | Update UI rules document | 2h |

---

## Decision Summary

### Why Ant Design v5?
- **10× faster development**: CRUD pages in 30 min vs 4h
- **Complete design system**: Consistency out-of-box
- **Early-stage sweet spot**: Low migration cost now, high velocity gain
- **Acceptable trade-off**: 380KB bundle (vs 100KB Tailwind) for internal admin

### What's Changing?
- ❌ **Remove:** Tailwind CSS, Zod, React Hook Form
- ✅ **Add:** Ant Design v5, @ant-design/icons
- ✅ **Keep:** React Query, Zustand, Axios, Recharts, Next.js 16, React 19

### Key Architectural Decisions
1. **Pure Ant Design** (no hybrid with Tailwind)
2. **Big bang migration** (not incremental)
3. **Geist font** (not Inter, already in project)
4. **URL params for filters** (shareable state)
5. **Zustand for modals** (temporary UI state)
6. **Ant Design validation** (no Zod)

---

## Success Criteria

### Development Velocity ✅
- Build CRUD page in < 1 hour (vs 4h baseline)

### Bundle Size ✅
- Total bundle < 450KB gzipped

### Performance ✅
- TTFB increase < 40% from baseline

### Code Quality ✅
- < 10% duplicate UI code
- 100% pages follow CRUD pattern
- Zero ad-hoc UI variations

---

## Phase Dependencies

```
Phase 1 (Foundation)
   ├──> Phase 2 (Layout)
   │       └──> Phase 4 (Pages)
   │               └──> Phase 5 (Advanced)
   │                       └──> Phase 6 (Docs)
   └──> Phase 3 (Patterns)
           └──> Phase 4 (Pages)
```

**Can Parallel:**
- Phase 2 + Phase 3 (some overlap possible)

**Can Defer:**
- Phase 5 (ship MVP with Phases 1-4 only)

---

## Risk Mitigation

### High Risk: Bundle Size > 500KB
- **Mitigation:** Tree-shaking config, dynamic imports, bundle analyzer
- **Contingency:** Selectively replace heavy components

### Medium Risk: Customization Limitations
- **Mitigation:** Deep dive into theme tokens, test edge cases early
- **Contingency:** Custom CSS overrides for specific components

### Low Risk: Migration Takes > 2 Weeks
- **Mitigation:** Big bang approach, pair programming, skip Phase 5 if needed
- **Contingency:** Ship MVP without advanced patterns

---

## Quick Commands

### Start Implementation

```bash
# Create feature branch
git checkout -b feature/antd-migration

# Start Phase 1
# Follow phase-1-foundation.md instructions
npm install antd @ant-design/icons
npm uninstall tailwindcss zod react-hook-form @hookform/resolvers
```

### During Implementation

```bash
# Test during development
npm run dev

# Build to check bundle size
npm run build

# Analyze bundle (after Phase 5)
ANALYZE=true npm run build
```

### After Completion

```bash
# Commit final changes
git add .
git commit -m "feat: Complete Ant Design v5 migration"

# Create PR
gh pr create --title "feat: Migrate to Ant Design v5" --body "See plan in .claude/plans/antd-migration-2026-05-20/"
```

---

## Key Files to Create

### Configuration
- `src/config/theme.ts` - Ant Design theme
- `src/constants/status-colors.ts` - Status color mappings
- `next.config.js` - Tree-shaking config

### Layouts
- `src/components/layouts/AdminLayout.tsx`
- `src/components/layouts/Sidebar.tsx`
- `src/components/layouts/HeaderBar.tsx`
- `src/components/layouts/Logo.tsx`

### Common Components
- `src/components/common/PageHeader.tsx`
- `src/components/common/StatusBadge.tsx`
- `src/components/common/FilterBar.tsx`
- `src/components/common/TableActions.tsx`
- `src/components/common/FormModal.tsx`
- `src/components/common/LoadingStates.tsx`
- `src/components/common/BulkActions.tsx` (Phase 5)
- `src/components/common/PermissionGate.tsx` (Phase 5)

### Hooks
- `src/hooks/useDebounce.ts`
- `src/hooks/usePermission.ts` (Phase 5)
- `src/hooks/useURLParams.ts` (Phase 5)

### Stores
- `src/stores/ui-store.ts` (Phase 5)

---

## Validation Checklist

At the end of each phase, verify all items in the phase's "Validation Checklist" section.

**Critical Validations:**
- ✅ No Tailwind/Zod imports after Phase 1
- ✅ All pages use AdminLayout after Phase 2
- ✅ All forms use Ant Design validation after Phase 4
- ✅ Bundle size < 450KB after Phase 5

---

## Getting Help

### Documentation
- [Ant Design Components](https://ant.design/components/overview/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

### Common Issues
Each phase file has a "Common Issues & Solutions" section. Check there first if you encounter problems.

### Project-Specific
- [UI Rules Document](/media/ngocha/D/admin-page/docs/antd-admin-ui-rules.md)
- [Brainstorming Report](/media/ngocha/D/admin-page/docs/brainstorm-ant-design-migration-2026-05-20.md)

---

## Timeline Summary

| Day | Phases | Hours | Cumulative |
|-----|--------|-------|------------|
| 1 | Phase 1 + 2 start | 6h | 6h |
| 2 | Phase 2 finish + 3 start | 8h | 14h |
| 3 | Phase 3 finish + 4 start | 8h | 22h |
| 4 | Phase 4 continue | 8h | 30h |
| 5 | Phase 4 finish | 8h | 38h |
| 6 | Phase 5 | 8h | 46h |
| 7 | Phase 6 + polish | 4h | 50h |

**With Pair Programming: 4-5 days**

---

## Status Tracking

Use this section to track progress:

- [ ] Phase 1: Foundation Setup
- [ ] Phase 2: Layout Architecture
- [ ] Phase 3: Component Patterns
- [ ] Phase 4: Page Migration
- [ ] Phase 5: Advanced Patterns
- [ ] Phase 6: Documentation Update

---

## Next Actions

1. ✅ Review this README
2. ✅ Read [main plan file](./plan.md)
3. ✅ Get stakeholder approval
4. ✅ Create feature branch
5. ✅ Start [Phase 1](./phase-1-foundation.md)

---

**Good luck with the migration! 🚀**
