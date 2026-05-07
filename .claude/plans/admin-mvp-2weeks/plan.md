---
status: completed
created: 2026-05-07
completed: 2026-05-07
effort: 10 days
priority: critical
tags: [mvp, admin, dashboard, integration, frontend]
---

# Admin & BA Dashboard - 2-Week MVP Implementation Plan

**Created:** 2026-05-07  
**Timeline:** 10 working days (2 weeks)  
**Project Status:** 85-90% complete - focus on integration & polish  
**Based On:** `brain-storm/brainstorm-admin-frontend-mvp-2026-05-07.md`

---

## Executive Summary

**Context:** TripJoy admin portal frontend is nearly complete. Most UI components, pages, and React Query hooks already exist. The MVP requires completing integration, workflow polish, and testing.

**Critical Finding:** Backend claimed "fully implemented" but untested. High risk of API mismatches.

**Approach:** 
- Week 1: Integration testing + critical workflow completion + permissions
- Week 2: Polish + navigation + comprehensive testing + bug fixes

**Success Criteria:**
- ✅ All 6 backend APIs verified working
- ✅ BA can handle reports with full decision tree
- ✅ Role-based UI hides/shows features correctly
- ✅ No P0 bugs blocking core workflows

---

## Current State

### ✅ Already Complete (85%)

**API Layer:**
- Client functions: `src/lib/api/*.ts` ✅
- React Query hooks: `src/hooks/use-admin-queries.ts` (20+ hooks) ✅
- Type definitions: `src/types/api.ts` ✅

**UI Components:**
- Statistics: StatCard, UserSearchBar, ViolationPieChart, **ActivityChart** (exists!), ModerationHistoryTable ✅
- Activity Logs: LogTable, LogFilterBar, LogDetailModal ✅
- Common: QueryState, LoadingSkeleton, ConfirmModal ✅
- Users: UserTable ✅

**Pages (15+ routes):**
- `/dashboard/system/*` - ADMIN portal ✅
- `/dashboard/business/*` - BA portal ✅
- `/dashboard/moderation/*` - Report handling ✅

**State:**
- Zustand store with `portalMode: 'system' | 'business'` ✅
- Auth session management ✅

### ⚠️ Needs Work (15% - 6 Tasks)

| Task | Priority | Effort | Files Affected |
|------|----------|--------|----------------|
| #1 Backend API Integration | CRITICAL | 2-3 days | All `src/lib/api/*.ts` |
| #2 Report Handling Workflow | HIGH | 2-3 days | `/dashboard/moderation/reports/[reportId]/page.tsx` |
| #3 Role-based Permissions | HIGH | 1-2 days | All dashboard pages |
| #4 Component Verification | MEDIUM | 0.5 day | Toast system, QueryState enhancements |
| #5 Navigation Polish | MEDIUM | 1-2 days | DashboardShell, TopBar, Sidebar |
| #6 E2E Testing & Bugs | CRITICAL | 2-3 days | All features |

**Total:** 9-14 days → Fits 10-day (2-week) timeline with 1-day buffer

---

## Implementation Phases

### Phase 1: Critical Path - Integration & Verification (Days 1-4)

**Goal:** Verify backend works, fix critical blockers, enable core workflows

**Phase 1.1: Backend Integration Testing (Days 1-2)** → [phase-1-integration.md](./phase-1-integration.md)
- Test all API endpoints with real backend
- Document response shape vs TypeScript types
- Create adapter functions for mismatches
- Set up error logging

**Phase 1.2: Enhanced Report Workflow (Days 3-4)** → [phase-2-report-workflow.md](./phase-2-report-workflow.md)
- Redesign report handling modal with 4 action buttons
- Add confirmation dialogs for destructive actions
- Update handleReportSchema
- Test with real API

---

### Phase 2: Permissions & Polish (Days 5-7)

**Goal:** Lock down permissions, complete navigation, verify components

**Phase 2.1: Role-based UI (Day 5)** → [phase-3-permissions.md](./phase-3-permissions.md)
- Create PermissionGate component
- Audit all pages for ADMIN-only vs BA-only features
- Add conditional rendering based on portalMode
- Test role switching

**Phase 2.2: Navigation & Components (Days 6-7)** → [phase-4-navigation.md](./phase-4-navigation.md)
- Complete DashboardShell sidebar navigation
- Add portal mode toggle UI in TopBar
- Build toast notification system
- Enhance QueryState with retry button
- Add breadcrumbs

---

### Phase 3: Testing & Launch Prep (Days 8-10)

**Goal:** Find and fix bugs, prepare for production launch

**Phase 3: E2E Testing & Bug Fixes (Days 8-10)** → [phase-5-testing.md](./phase-5-testing.md)
- Manual test all user flows (ADMIN + BA)
- Test error scenarios (network fail, 401, 500)
- Test empty states and edge cases
- Cross-browser testing
- Fix all P0/P1 bugs
- Deployment checklist

---

## Architectural Decisions

### Decision 1: Single Dashboard with Role Flags

**Pattern:**
```tsx
import { useAdminStore } from '@/stores/admin-store';

function CreateUserButton() {
  const mode = useAdminStore(s => s.portalMode);
  if (mode !== 'system') return null; // ADMIN-only
  return <button>Create User</button>;
}
```

### Decision 2: Simplified Report Workflow

**Not building:** 3-level nested decision tree (Decision → Action → Sub-action)

**Building:** 4 quick action buttons with inline reason input

```
┌─────────┬─────────┬─────────┬──────────┐
│ Dismiss │ Warning │ Delete  │ Ban User │
└─────────┴─────────┴─────────┴──────────┘
      ↓         ↓         ↓          ↓
   (reason)  (reason)  (reason)  (days + reason)
```

**Why:** 80% faster to build, better UX, matches common moderation tools

### Decision 3: Pragmatic API Adapter Pattern

**Strategy:**
1. Test endpoint → document mismatch
2. **Minor** (snake_case, extra fields): adapt in client
3. **Major** (missing fields, wrong types): ESCALATE to backend team
4. **Stub** (returns null): temporary mock + TODO comment

### Decision 4: Custom Toast Context (No External Lib)

**Why:** Avoid 50KB+ bundle bloat for simple notifications

**Implementation:**
```tsx
const { toast } = useToast();
mutation.mutate(data, {
  onSuccess: () => toast.success('Saved'),
  onError: (e) => toast.error(e.message),
});
```

---

## Critical Files Reference

**Existing Patterns to Follow:**

1. **`src/hooks/use-admin-queries.ts`**
   - Token validation: `tokenOrThrow(token)`
   - Query invalidation on mutations
   - Stale time configuration

2. **`src/app/dashboard/system/users/page.tsx`**
   - Table styling with Tailwind
   - QueryState wrapper
   - Vietnamese labels

3. **`src/lib/api/client.ts`**
   - apiFetch() error handling
   - Token injection pattern

4. **`src/lib/schemas/admin-forms.ts`**
   - Zod validation patterns
   - Vietnamese error messages

---

## Risk Assessment

### HIGH Risks (Could Derail MVP)

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Backend APIs broken/stub | 60% | Test Day 1, escalate immediately |
| Data shape mismatches | 50% | Adapter pattern + runtime validation |
| Workflow complexity underestimated | 30% | Simplified design approved by stakeholder |

### MEDIUM Risks (Might Delay)

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Performance issues with large datasets | 30% | Pagination exists, add limits if needed |
| 50+ small bugs in Week 2 | 40% | Triage P0 vs P1, defer P2 to v1.1 |

---

## Success Criteria

### Must-Have (P0 - Blocks Launch)

**ADMIN:**
- [ ] View user list with search
- [ ] Lock/unlock user account  
- [ ] Assign roles to user
- [ ] View activity logs with filters

**BA:**
- [ ] View report queue (filtered by type/status)
- [ ] Handle report (approve/dismiss with reason)
- [ ] View user statistics
- [ ] Search users

**Both:**
- [ ] Login/logout works
- [ ] Portal mode toggle functional
- [ ] Permission-based UI (no admin features shown to BA)

### Nice-to-Have (P1 - Ship Without If Needed)

- [ ] Export activity logs to CSV
- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Charts (activity timeline, violation pie)

### Won't-Have (P2 - v1.1)

- Real-time notifications
- Keyboard shortcuts
- Bulk actions
- Dark mode toggle
- Mobile app

---

## Deployment Checklist

**Before Launch:**
- [ ] Environment variables set (API base URL)
- [ ] Error tracking configured
- [ ] Session timeout tested
- [ ] CORS configured on backend
- [ ] HTTPS enforced

**Day 1 Monitoring:**
- [ ] Watch browser console for errors
- [ ] Monitor backend 4xx/5xx logs
- [ ] Triage bugs within 4h (P0) or 24h (P1)

---

## Next Steps

1. **Review plan with stakeholders** - approve simplified workflow
2. **Set up Kanban board** - track 6 tasks across phases
3. **Schedule daily 15min standups**
4. **Get backend team contact** - rapid response for API issues

**Day 1 Action:**
- [ ] Clone repo, `npm install`, `npm run dev`
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to staging
- [ ] Test login - does token work?
- [ ] Create `docs/api-integration-test.md` to track findings

---

## Decision Points

- **Day 2:** Backend integration status → GO/NO-GO on timeline
- **Day 4:** Simplified workflow demo → Stakeholder approval
- **Day 8:** Feature freeze → Only P0 bugs after this
- **Day 10:** Launch decision → Ship or delay?

---

**Plan Status:** Ready for implementation  
**Start Command:** `npm run dev` then begin Phase 1.1 (Backend Integration Testing)
