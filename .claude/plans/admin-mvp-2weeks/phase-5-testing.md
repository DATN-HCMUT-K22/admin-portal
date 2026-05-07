# Phase 5: E2E Testing & Bug Fixes

**Timeline:** Days 8-10 (3 days)  
**Priority:** CRITICAL

---

## Testing Scenarios

### Scenario 1: ADMIN User Journey

1. **Login as ADMIN**
   - [ ] Navigate to `/login`
   - [ ] Enter admin credentials
   - [ ] Verify redirect to `/dashboard`
   - [ ] Check portalMode = 'system' in Zustand

2. **User Management**
   - [ ] Go to `/dashboard/system/users`
   - [ ] Search for user by username
   - [ ] Click "Chi tiết" → verify redirect to `/dashboard/system/users/[id]`
   - [ ] Click "Khóa tài khoản" → verify confirmation modal
   - [ ] Confirm → verify user.isLocked = true
   - [ ] Go back to list → verify user shows "Khóa" badge

3. **Role Assignment**
   - [ ] On user detail page, click "Gán vai trò"
   - [ ] Select roles from dropdown
   - [ ] Submit → verify roles updated
   - [ ] Refresh page → roles persist

4. **Activity Logs**
   - [ ] Navigate to `/dashboard/system/activity-logs`
   - [ ] Verify logs table renders
   - [ ] Filter by user → verify filtered results
   - [ ] Filter by action type → verify filtered results
   - [ ] Click "Xuất CSV" → verify download starts
   - [ ] Open CSV → verify columns match

---

### Scenario 2: BA User Journey

1. **Switch to BA Mode**
   - [ ] Click "BA" toggle in TopBar
   - [ ] Verify portalMode = 'business'
   - [ ] Verify "Vai trò" and "Nhật ký" links disappear from sidebar

2. **Report Management**
   - [ ] Navigate to `/dashboard/moderation/reports`
   - [ ] Verify report list renders
   - [ ] Filter by contentType (POST, COMMENT, USER tabs) → verify filtered
   - [ ] Filter by status dropdown → verify filtered
   - [ ] Click "Xử lý" on a PENDING report

3. **Handle Report**
   - [ ] On report detail page, verify report info displays
   - [ ] Click "Cảnh báo" action button
   - [ ] Fill reason (min 10 chars)
   - [ ] Click "Xác nhận" → verify confirmation modal
   - [ ] Confirm → verify success toast
   - [ ] Verify redirect to report list
   - [ ] Verify report status changed to PROCESSED

4. **User Statistics**
   - [ ] Navigate to `/dashboard/business/statistics`
   - [ ] Search for user by username
   - [ ] Verify 4 stat cards render
   - [ ] Verify ActivityChart renders (no errors)
   - [ ] Verify ViolationPieChart renders
   - [ ] Verify ModerationHistoryTable renders

---

### Scenario 3: Error Handling

1. **Network Failure**
   - [ ] Disconnect internet
   - [ ] Navigate to any page
   - [ ] Verify error state shows "Network error"
   - [ ] Verify "Thử lại" button appears
   - [ ] Reconnect internet → click "Thử lại"
   - [ ] Verify data loads

2. **401 Unauthorized**
   - [ ] Clear bearer token in Zustand (DevTools or manual)
   - [ ] Try to access protected page
   - [ ] Verify redirect to `/login`

3. **500 Server Error**
   - [ ] Mock API to return 500
   - [ ] Verify error toast shows
   - [ ] Verify error message displayed

4. **Empty States**
   - [ ] Go to `/dashboard/moderation/reports` with no reports
   - [ ] Verify "Không có báo cáo" message shows
   - [ ] Go to `/dashboard/business/statistics` without selecting user
   - [ ] Verify "Tìm kiếm người dùng để xem thống kê" message

---

### Scenario 4: Permission Validation

1. **BA Cannot Access ADMIN Routes**
   - [ ] Set portalMode = 'business'
   - [ ] Manually navigate to `/dashboard/system/activity-logs`
   - [ ] Verify 403 page or redirect

2. **ADMIN Can Access All Routes**
   - [ ] Set portalMode = 'system'
   - [ ] Navigate to all pages
   - [ ] Verify no 403 errors

---

### Scenario 5: Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Check:
- [ ] Layout renders correctly
- [ ] Forms submit properly
- [ ] Modals/dialogs work
- [ ] Navigation works
- [ ] No console errors

---

### Scenario 6: Mobile Responsive

Test on viewport widths:
- [ ] 1920px (desktop)
- [ ] 1366px (laptop)
- [ ] 768px (tablet)
- [ ] 375px (mobile)

Verify:
- [ ] Sidebar collapses on mobile (or use hamburger menu)
- [ ] Tables scroll horizontally
- [ ] Forms stack vertically
- [ ] Buttons are touch-friendly (min 44x44px)

---

## Bug Triage System

**P0 (CRITICAL - Must Fix Before Launch):**
- Login broken
- Cannot lock/unlock users
- Cannot handle reports
- App crashes (unhandled errors)
- Data corruption

**P1 (HIGH - Should Fix):**
- Charts don't render
- Filters don't work
- Toast notifications don't show
- Pagination broken

**P2 (MEDIUM - Can Defer to v1.1):**
- Styling inconsistencies
- Loading states missing
- Empty states missing
- Minor UX improvements

**P3 (LOW - Nice to Have):**
- Keyboard shortcuts
- Dark mode
- Animations

---

## Bug Tracking Template

Create `docs/bugs-found.md`:

```markdown
# Bugs Found During Testing

## P0 - Critical

### Bug #1: Login redirects to 404
- **Repro:** Enter valid credentials → submit
- **Expected:** Redirect to /dashboard
- **Actual:** Redirect to /dashbaord (typo)
- **Fix:** Update redirect URL in login-form.tsx
- **Status:** FIXED

---

## P1 - High

### Bug #2: Report filters don't persist
- **Repro:** Filter by POST → navigate to detail → back
- **Expected:** Filter state preserved
- **Actual:** Filter resets to "All"
- **Fix:** Use URL search params for filter state
- **Status:** IN PROGRESS

---

## P2 - Medium

### Bug #3: Loading skeleton too large
- **Impact:** UX
- **Fix:** Reduce skeleton height
- **Status:** BACKLOG (v1.1)
```

---

## Deployment Checklist

Before production launch:

**Environment:**
- [ ] `NEXT_PUBLIC_API_BASE_URL` set to production API
- [ ] `NODE_ENV=production`
- [ ] HTTPS enabled
- [ ] CORS configured on backend

**Code:**
- [ ] No `console.log` in production code
- [ ] No hardcoded tokens/secrets
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] TypeScript strict mode enabled
- [ ] ESLint passes with no errors

**Testing:**
- [ ] All P0 bugs fixed
- [ ] ≥80% P1 bugs fixed
- [ ] Cross-browser tested
- [ ] Mobile responsive verified

**Performance:**
- [ ] Lighthouse score > 80
- [ ] Initial load < 3s on 3G
- [ ] No memory leaks (check Chrome DevTools Memory)

**Security:**
- [ ] JWT tokens stored in httpOnly cookies (or Zustand persist encrypted)
- [ ] No XSS vulnerabilities (sanitize user input)
- [ ] CSRF protection if needed

---

## Launch Day Monitoring

**First 4 Hours:**
- [ ] Watch browser console for errors (ask 3-5 users to report)
- [ ] Monitor backend logs for 4xx/5xx spikes
- [ ] Check error tracking dashboard (Sentry)
- [ ] Collect user feedback in Slack #admin-portal-feedback

**First 24 Hours:**
- [ ] Triage new bugs (create GitHub issues)
- [ ] Hotfix P0 bugs within 4h
- [ ] Schedule P1 bug fixes for next sprint

---

## Success Criteria

**MVP Launch Ready:**
- [ ] 0 P0 bugs
- [ ] ≤3 P1 bugs
- [ ] All core workflows tested
- [ ] Backend team confirms APIs stable
- [ ] Stakeholder approval for simplified report workflow

**GO Decision:** All checkboxes above ✅  
**NO-GO Decision:** Any P0 bug or >5 P1 bugs
