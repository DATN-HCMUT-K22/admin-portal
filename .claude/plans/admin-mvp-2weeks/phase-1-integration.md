# Phase 1.1: Backend API Integration Testing

**Timeline:** Days 1-2 (2 days)  
**Priority:** CRITICAL  
**Risk:** HIGH - May discover broken/stub APIs

---

## Objective

Verify all backend endpoints work as expected and match frontend TypeScript types. Create adapter layer for mismatches. Establish confidence in API contract before building features.

---

## Pre-Flight Checklist

- [ ] Backend staging/dev environment URL confirmed
- [ ] Bearer token obtained (login works)
- [ ] Postman/Insomnia collection (optional, for manual testing)
- [ ] Backend team contact on Slack (for rapid issues)

---

## APIs to Test (Priority Order)

### 1. Authentication (CRITICAL - Test First)

**Endpoint:** `POST /api/v1/auth/login`

```bash
# Test login
curl -X POST $API_BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Expected response:
{
  "code": 1000,
  "data": {
    "token": "eyJhbGci...",
    "authenticated": true,
    "refreshToken": "refresh..."
  }
}
```

**Verification Steps:**
1. Open browser → navigate to `/login`
2. Enter credentials
3. Check Network tab → verify response shape
4. Verify token stored in Zustand (`useAdminStore.getState().bearerToken`)
5. Check redirect to `/dashboard`

**Document:**
- [ ] Response matches `AuthLoginData` type in `src/types/api.ts`?
- [ ] Token format (JWT, length, expiry claim)?
- [ ] Refresh token flow implemented?

---

### 2. User Management (HIGH - Core Feature)

#### GET /api/v1/users

```typescript
// File: src/lib/api/users.ts → listUsers()
// Expected: Paginated<UserAdminView> | UserAdminView[]
```

**Test:**
```bash
curl $API_BASE_URL/api/v1/users?page=0&pageSize=20 \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- [ ] Returns array or `{ items: [], total: number }`?
- [ ] UserAdminView shape correct (id, username, fullName, roles, isLocked, isDeleted, credits)?
- [ ] Pagination works (page=1 returns different results)?
- [ ] Search query param works (`?q=username`)?

#### GET /api/v1/users/{userId}

**Test:**
```bash
curl $API_BASE_URL/api/v1/users/{userId} \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- [ ] Returns single UserAdminView?
- [ ] Same shape as list endpoint?

#### PATCH /api/v1/users/{userId}/status

**Test:**
```bash
curl -X PATCH $API_BASE_URL/api/v1/users/{userId}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isLocked": true}'
```

**Verify:**
- [ ] Accepts `UserStatusUpdateRequest` body?
- [ ] Returns success (200/204)?
- [ ] User actually locked (verify with GET)?

#### PUT /api/v1/users/{userId}/roles

**Test:**
```bash
curl -X PUT $API_BASE_URL/api/v1/users/{userId}/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["ADMIN", "BA"]}'
```

**Verify:**
- [ ] Accepts array of role names?
- [ ] Returns success?
- [ ] Roles updated (verify with GET)?

---

### 3. Reports (HIGH - Core BA Feature)

#### GET /api/v1/reports

```bash
# Without filters
curl $API_BASE_URL/api/v1/reports \
  -H "Authorization: Bearer $TOKEN"

# With filters
curl "$API_BASE_URL/api/v1/reports?contentType=POST&status=PENDING&page=0&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- [ ] Returns `ReportDetail[]` or `{ items: ReportDetail[] }`?
- [ ] Filter by contentType works (POST, COMMENT, USER)?
- [ ] Filter by status works (PENDING, PROCESSED, etc.)?
- [ ] Each report has: id, contentType, violationType, status, reporter, reportedEntity, createdAt?

**CRITICAL FIELDS:**
```typescript
interface ReportDetail {
  id: string;
  contentType: ContentType; // "POST" | "COMMENT" | "USER"
  violationType: ViolationType; // "SPAM" | "HARASSMENT" | ...
  status: ReportStatus; // "PENDING" | "UNDER_REVIEW" | ...
  reporter: { id: string; username: string };
  reportedEntity: { id: string; content?: string; userId?: string };
  createdAt: string;
  handledAt?: string;
  handledBy?: { username: string };
  description?: string;
}
```

#### GET /api/v1/reports/{reportId}

**Verify:**
- [ ] Returns single ReportDetail?
- [ ] Same shape as list endpoint?

#### POST /api/v1/reports/{reportId}/handle

**THIS IS THE ONE THAT RETURNS NULL PER BRD!**

```bash
curl -X POST $API_BASE_URL/api/v1/reports/{reportId}/handle \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSED", "description": "Spam confirmed"}'
```

**Verify:**
- [ ] Does it return null? (BRD says "partially implemented")
- [ ] Does it accept HandleReportRequest body?
- [ ] Does report status change after call?
- [ ] Is moderation_action record created?

**If returns null:**
1. Document in `docs/api-integration-test.md`
2. Add TODO comment in `src/lib/api/reports.ts`
3. Consider temporary mock for frontend testing
4. Escalate to backend team

---

### 4. User Statistics (MEDIUM - BA Dashboard)

#### GET /api/v1/admin/user-statistics/{userId}

```bash
curl $API_BASE_URL/api/v1/admin/user-statistics/{userId} \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- [ ] Returns `UserStatistics` type?
- [ ] Has activity metrics (totalPosts, totalComments, likesReceived)?
- [ ] Has violations metrics (reportsReceived, confirmedViolations, warnings)?
- [ ] Has timeline array with dates?
- [ ] Has moderationHistory array?

**Expected Shape:**
```typescript
{
  userId: string;
  username: string;
  fullName: string;
  activity: {
    totalPosts: number;
    totalComments: number;
    likesReceived: number;
    lastActive: string; // ISO date
    avgPostsPerWeek: number;
  };
  violations: {
    reportsReceived: number;
    confirmedViolations: number;
    warnings: number;
  };
  timeline: Array<{ date: string; posts: number; comments: number }>;
  moderationHistory: Array<{
    id: string;
    actionType: string;
    reason: string;
    handledBy: string;
    createdAt: string;
  }>;
}
```

#### GET /api/v1/admin/users/search?q={query}

**Verify:**
- [ ] Returns array of users matching query?
- [ ] Works with username search?
- [ ] Works with fullName search?
- [ ] Debounce works on frontend (wait 300ms)?

---

### 5. Activity Logs (MEDIUM - ADMIN Only)

#### GET /api/v1/admin/activity-logs

```bash
curl "$API_BASE_URL/api/v1/admin/activity-logs?page=0&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"

# With filters
curl "$API_BASE_URL/api/v1/admin/activity-logs?userId={id}&action=LOGIN&startDate=2026-05-01" \
  -H "Authorization: Bearer $TOKEN"
```

**Verify:**
- [ ] Returns `Paginated<ActivityLog>`?
- [ ] Filter by userId works?
- [ ] Filter by action works?
- [ ] Filter by entityType works?
- [ ] Filter by date range works (startDate, endDate)?

**Expected Shape:**
```typescript
{
  items: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string; // "LOGIN", "POST_CREATED", "ADMIN_USER_LOCKED", etc.
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}
```

#### GET /api/v1/admin/activity-logs/export

**Verify:**
- [ ] Returns CSV file (Content-Type: text/csv)?
- [ ] Filename header present?
- [ ] CSV structure correct (columns match ActivityLog fields)?
- [ ] Filters apply to export?

---

### 6. Roles & Permissions (LOW - ADMIN Only)

#### GET /api/v1/roles

**Verify:**
- [ ] Returns `RoleWithPermissions[]`?
- [ ] Each role has: name, description, permissions array?

#### POST /api/v1/roles

**Test:**
```bash
curl -X POST $API_BASE_URL/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST_ROLE",
    "description": "Test role",
    "permissions": ["READ_USERS", "WRITE_USERS"]
  }'
```

**Verify:**
- [ ] Accepts RoleRequest body?
- [ ] Returns created role or 201 status?
- [ ] Role appears in GET /api/v1/roles?

#### GET /api/v1/permissions

**Verify:**
- [ ] Returns array of permission strings or objects?
- [ ] Format matches expectations?

---

## Integration Test Documentation

Create file: `docs/api-integration-test.md`

```markdown
# API Integration Test Results

**Tested:** 2026-05-07  
**Backend:** {staging/dev URL}  
**Tester:** {your name}

---

## Summary

| Endpoint | Status | Issues | Notes |
|----------|--------|--------|-------|
| POST /auth/login | ✅ PASS | - | Token format: JWT |
| GET /users | ✅ PASS | - | Returns array (not Paginated object) |
| PATCH /users/{id}/status | ✅ PASS | - | - |
| GET /reports | ⚠️ PARTIAL | Missing violationType field | Backend returns `type` instead of `violationType` |
| POST /reports/{id}/handle | ❌ FAIL | Returns null | Confirmed stub - backend working on fix |
| GET /admin/user-statistics/{id} | ✅ PASS | - | - |
| GET /admin/activity-logs | ✅ PASS | - | - |
| GET /admin/activity-logs/export | ❌ FAIL | 404 Not Found | Endpoint not implemented |

---

## Mismatches Found

### 1. Reports API - Field Name Mismatch

**Expected (frontend):**
```typescript
interface ReportDetail {
  violationType: ViolationType;
}
```

**Actual (backend):**
```json
{
  "type": "SPAM"
}
```

**Fix:** Create adapter in `src/lib/api/reports.ts`:
```typescript
function adaptReportResponse(raw: any): ReportDetail {
  return {
    ...raw,
    violationType: raw.type || raw.violationType,
  };
}
```

---

## Escalations

1. **POST /reports/{id}/handle returns null** → Backend Team (Slack: @backend-dev) - ETA: Day 3
2. **Export CSV not implemented** → Defer to Phase 4 or v1.1

---

## Action Items

- [ ] Create adapter functions for mismatches
- [ ] Add TODO comments for stub endpoints
- [ ] Update TypeScript types if backend contract is final
- [ ] Re-test after backend fixes deployed
```

---

## Adapter Pattern Implementation

When mismatches found, create adapters in `src/lib/api/` files:

**Example: Reports Field Mapping**

```typescript
// src/lib/api/reports.ts

interface RawReportResponse {
  id: string;
  type: string; // Backend uses "type" not "violationType"
  status: string;
  // ... other fields
}

function adaptReportDetail(raw: RawReportResponse): ReportDetail {
  return {
    id: raw.id,
    violationType: raw.type as ViolationType, // Map backend field
    status: raw.status as ReportStatus,
    // ... map other fields
    
    // Handle optional fields
    handledAt: raw.handledAt || undefined,
    handledBy: raw.handledBy ? { username: raw.handledBy } : undefined,
  };
}

export async function getReport(token: string, reportId: string) {
  const raw = await apiFetch<RawReportResponse>(`/api/v1/reports/${reportId}`, { token });
  return adaptReportDetail(raw); // Return adapted version
}
```

**When to Use Adapters:**
- Field name differences (snake_case ↔ camelCase)
- Extra fields in response (ignore them)
- Missing optional fields (set to undefined)
- Enum value differences (map strings)

**When to Escalate:**
- Missing required fields
- Wrong data types (string instead of number)
- Completely different structure
- Stub responses (returns null/empty)

---

## Error Handling Setup

Add error logging to catch API issues:

**Browser Console:**
```typescript
// src/lib/api/client.ts

export async function apiFetch<T>(url: string, options: FetchOptions): Promise<T> {
  try {
    const response = await fetch(fullUrl, fetchOptions);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[API Error]', {
        url,
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new ApiError(response.status, errorBody);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[API Fetch Failed]', { url, error });
    throw error;
  }
}
```

**Optional: Sentry Integration**
```bash
npm install @sentry/nextjs
```

```typescript
// src/lib/api/client.ts
import * as Sentry from '@sentry/nextjs';

if (!response.ok) {
  Sentry.captureException(new Error(`API Error: ${url}`), {
    extra: { status, url, body: errorBody },
  });
}
```

---

## Success Criteria

**End of Day 2:**
- [ ] All 6 API groups tested
- [ ] Mismatches documented in `docs/api-integration-test.md`
- [ ] Adapter functions created for minor mismatches
- [ ] Major issues escalated to backend team with ETA
- [ ] Frontend team knows which endpoints are safe to use

**GO/NO-GO Decision:**
- ✅ GO if: ≥80% APIs working, blockers have ETAs within Week 1
- ❌ NO-GO if: Core APIs (login, users, reports) completely broken

---

## Next Phase

If integration tests PASS → Proceed to **Phase 2: Enhanced Report Workflow**  
If MAJOR issues found → Escalate, create mocks, continue with what works
