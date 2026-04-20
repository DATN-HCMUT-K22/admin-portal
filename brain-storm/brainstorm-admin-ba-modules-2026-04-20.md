# Brainstorm: Admin & BA Module Classification - 2026-04-20

**Session Date:** April 20, 2026  
**Participants:** Development Team, Product Owner  
**Duration:** Full codebase analysis + requirements definition  
**Status:** ✅ Complete - Ready for Planning

---

## I. Problem Statement

TripJoy needs clear business logic definition and role separation for:
1. **Business Administrator (BA)** - Content moderation, violation handling
2. **System Administrator (ADMIN)** - User management, RBAC, system operations

**Current State:** Partially implemented endpoints, unclear role boundaries, missing enums and workflows.

**Desired State:** Fully documented business requirements, categorized report system, role-based permissions, ready for FE development.

---

## II. Key Decisions & Findings

### 2.1 Role Separation (Agreed)

| Capability | ADMIN | BA |
|------------|-------|-----|
| Create users | ✅ | ❌ |
| Assign roles | ✅ | ❌ |
| View activity logs | ✅ | ❌ |
| Handle violation reports | ✅ | ✅ |
| View user statistics | ✅ | ✅ |
| Lock/unlock accounts | ✅ | ✅ |
| Reset passwords | ✅ | ❌ |

**Rationale:** 
- ADMIN = System-level control, infrastructure, RBAC
- BA = Content quality, community safety, behavior monitoring
- Shared functions = Operational tasks both roles need

### 2.2 Report Categorization (Agreed)

**By Content Type:**
- `POST` - User travel posts (FR-MD01-21)
- `COMMENT` - Post comments (FR-MD01-22)  
- `USER` - User profiles

**By Violation Type (New Enum Required):**
```
SPAM | HARASSMENT | HATE_SPEECH | MISINFORMATION | 
INAPPROPRIATE_CONTENT | COPYRIGHT | IMPERSONATION | OTHER
```

**Status Workflow:**
```
PENDING → UNDER_REVIEW → [PROCESSED | DISMISSED | ESCALATED]
```

**Handling Actions (FR-MD01-23):**
- WARN_USER
- DELETE_CONTENT
- BAN_USER_TEMPORARY (1-30 days)
- BAN_USER_PERMANENT
- RESTORE_CONTENT
- UNBAN_USER

### 2.3 User Statistics (FR-MD01-24)

**Metrics Identified:**
- Activity: Posts, comments, likes received
- Violations: Reports received, confirmed violations, warnings
- Engagement: Last active, average posts/week
- History: Last 10 moderation actions

**Data Sources:**
- `activity_logs` table (already exists ✅)
- `report_content` table
- `moderation_action` table
- Aggregated from posts, comments, likes tables

---

## III. Implementation Gaps Identified

### 3.1 Missing Enums (Backend)
```java
❌ ReportType.java          // SPAM, HARASSMENT, etc.
❌ ReportStatus.java        // PENDING, PROCESSED, etc.
❌ ModerationActionType.java // WARN_USER, BAN_USER, etc.
```

### 3.2 Incomplete Endpoints
```
🚧 POST /api/v1/reports/{reportId}/handle     // Returns null
🚧 POST /api/v1/admin/moderate-user           // Returns null
❌ GET  /api/v1/reports?contentType=POST      // Filter not implemented
❌ GET  /api/v1/admin/user-statistics         // Endpoint missing
❌ GET  /api/v1/admin/activity-logs           // Endpoint missing
❌ POST /api/v1/admin/reset-password          // Endpoint missing
```

### 3.3 Missing Services
```
❌ ReportService.handleReport() implementation
❌ AdminService.moderateUser() implementation
❌ UserStatisticsService (entire service)
❌ ActivityLogService with filtering
```

### 3.4 Database Enhancements
```sql
-- Migration needed: Enum constraints
❌ ALTER TABLE report_content ADD CONSTRAINT chk_report_status
❌ ALTER TABLE moderation_action ADD CONSTRAINT chk_action_type

-- Migration needed: Performance indexes
❌ CREATE INDEX idx_report_content_type_status
❌ CREATE INDEX idx_moderation_user_action
```

---

## IV. Frontend Module Breakdown

### 4.1 Admin Dashboard (System Administrator)

**Module 1: User Management Panel**
- User list table (search, filter, paginate)
- Actions: Create, Edit Roles, Lock/Unlock, View Details
- Filters: Role, Status, Registration Date
- Detail modal: Profile + Activity Logs + Moderation History

**Module 2: Role & Permission Manager**
- CRUD roles
- Assign permissions to roles
- Visual permission matrix

**Module 3: Activity Log Viewer**
- Real-time log stream
- Filters: User, Action, Entity Type, Date Range
- Export to CSV

### 4.2 BA Dashboard (Business Administrator)

**Module 1: Report Management (FR-MD01-21, FR-MD01-22, FR-MD01-23)**
- Report queue with tabs: Posts | Comments | Users
- Filters: Status (Pending, Under Review, etc.)
- Handle Report Modal:
  - Decision: Dismiss | Process | Escalate
  - If Process: Select action (Warn/Ban/Delete) + Reason (required)
- Real-time updates (WebSocket)

**Module 2: User Statistics Dashboard (FR-MD01-24)**
- Search user by username/email
- Stats cards: Total Users, Active This Week, Violations
- User detail view:
  - Activity timeline chart
  - Content breakdown (posts/comments pie chart)
  - Violation history table
  - Moderation actions taken

**Module 3: User List (Shared)**
- Same as Admin but read-only for Create/Assign Roles

---

## V. Technical Architecture Decisions

### 5.1 Backend Stack (Confirmed)
- Spring Boot 3.x with Spring Security
- PostgreSQL (tables already exist)
- JPA/Hibernate for entities
- Role-based access via `@PreAuthorize` annotations

### 5.2 Frontend Requirements
- Role-based routing (`/admin/*`, `/business/*`)
- Dashboard shell with portal switcher (if user has both roles)
- State management for reports (React Query / Zustand)
- Real-time updates via Socket.IO (for report notifications)
- Responsive design (desktop-first, mobile-friendly)

### 5.3 Security Rules
```java
// Admin-only
/api/v1/users (POST)
/api/v1/users/*/roles (PUT)
/api/v1/roles/** (All)
/api/v1/permissions/** (All)
/api/v1/admin/activity-logs (GET)

// Admin or BA
/api/v1/users (GET)
/api/v1/users/*/status (PATCH)
/api/v1/reports/** (All)
/api/v1/admin/user-statistics (GET)
```

---

## VI. Implementation Roadmap (5 Weeks)

### Week 1-2: Core Report System
- Create enums (ReportType, ReportStatus, ModerationActionType)
- Update entities to use enums
- Implement `ReportService.handleReport()`
- Implement `AdminService.moderateUser()`
- Add filters to `GET /api/v1/reports`
- **FE:** Build Report Management Dashboard

### Week 3: User Statistics
- Create `UserStatisticsService`
- Implement aggregation queries
- Create `GET /api/v1/admin/user-statistics` endpoint
- **FE:** Build User Statistics Dashboard

### Week 4: Activity Logs
- Add admin actions to `ActivityAction` enum
- Create `ActivityLogService` with filters
- Implement `GET /api/v1/admin/activity-logs`
- **FE:** Build Activity Log Viewer

### Week 5: Polish & Testing
- Integration tests for all endpoints
- Seed BA/Admin roles in migration
- Documentation updates
- **FE:** Responsive design, error handling, loading states

---

## VII. Success Metrics (Acceptance Criteria)

**BA Role Validation:**
- ✅ BA can filter reports by content type (POST, COMMENT)
- ✅ BA can handle report with action (WARN, BAN, DELETE)
- ✅ BA can view user statistics with charts
- ✅ All BA actions logged in `activity_logs`
- ❌ BA cannot create users or assign roles (permission denied)

**Admin Role Validation:**
- ✅ Admin has all BA capabilities
- ✅ Admin can create user accounts
- ✅ Admin can CRUD roles & permissions
- ✅ Admin can view filtered activity logs
- ✅ Admin can export logs to CSV

**Audit Trail:**
- ✅ Every moderation action has: who, what, when, why (reason field)
- ✅ Logs are immutable (no delete endpoint)
- ✅ IP address + user agent captured

---

## VIII. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Enum migration breaks existing data | HIGH | Write careful migration, test on staging first |
| Performance issues with stats aggregation | MEDIUM | Add database indexes, consider caching |
| Complex report filtering query | MEDIUM | Use JPA Specification pattern for dynamic filters |
| BA/Admin role confusion in FE | LOW | Clear portal switcher UI, color-coded themes |

---

## IX. Open Questions (Resolved)

~~1. Should BA be able to escalate reports to Admin?~~  
**RESOLVED:** Yes, add ESCALATED status to workflow.

~~2. How long should temporary bans last?~~  
**RESOLVED:** Configurable 1-30 days, default 7 days.

~~3. Should deleted content be recoverable?~~  
**RESOLVED:** Yes, soft-delete only. Add RESTORE_CONTENT action.

~~4. Do we need approval workflow for BA actions?~~  
**RESOLVED:** No, BA actions are final. Audit trail is sufficient.

---

## X. Deliverables

### Documentation (Completed ✅)
- ✅ **Main Requirements Doc:** `docs/ADMIN_BA_BUSINESS_REQUIREMENTS.md`  
  Full technical specification (13 sections, 500+ lines)
- ✅ **This Brainstorm Summary:** `docs/brainstorm-admin-ba-modules-2026-04-20.md`

### Code Artifacts (To Be Created)
- [ ] Enums: ReportType, ReportStatus, ModerationActionType
- [ ] Services: UserStatisticsService, ActivityLogService
- [ ] Endpoints: 6 new REST endpoints
- [ ] Migrations: V10 (enums), V11 (indexes)
- [ ] Tests: Integration tests for all new endpoints

### Frontend Artifacts (To Be Created)
- [ ] Admin Dashboard (3 modules)
- [ ] BA Dashboard (3 modules)
- [ ] Shared Components: User list, Filter bar, Action modals
- [ ] API client layer with type definitions

---

## XI. Next Steps

**Immediate (This Week):**
1. ✅ Review brainstorm document with team
2. ✅ Get stakeholder approval on role definitions
3. ⏭️ Create detailed implementation plan (`/plan`)
4. ⏭️ FE team: Start UI mockups (Figma)
5. ⏭️ BE team: Create task breakdown in project management tool

**Before Development Starts:**
- [ ] Database backup before migration
- [ ] Set up staging environment for testing
- [ ] Define test user accounts (admin_test, ba_test)
- [ ] Agree on API response format conventions

---

## XII. References

- Main Requirements: [docs/ADMIN_BA_BUSINESS_REQUIREMENTS.md](./ADMIN_BA_BUSINESS_REQUIREMENTS.md)
- Existing Docs:
  - [docs/modules/report.md](./modules/report.md)
  - [docs/modules/admin.md](./modules/admin.md)
  - [docs/modules/AUTH_ADMIN_BA_FLOW.md](./modules/AUTH_ADMIN_BA_FLOW.md)
- Database Schema: `src/main/resources/db/migration/V5__add_missing_tables.sql`
- Entities: `src/main/java/com/tripjoy/api/entity/`

---

**Brainstorm Session: ✅ COMPLETED**  
**Status:** Ready for planning phase (`/plan`)  
**Estimated Implementation:** 5 weeks (2 BE + 2 FE + 1 QA)
