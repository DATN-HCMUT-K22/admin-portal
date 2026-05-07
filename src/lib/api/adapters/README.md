# API Adapters

This directory contains adapter functions to handle API response shape mismatches between backend and frontend TypeScript types.

## When to Use Adapters

**Use adapters for:**
- Field name differences (`snake_case` ↔ `camelCase`)
- Extra fields in response (ignore them)
- Missing optional fields (set to `undefined`)
- Enum value mapping
- Date format transformations

**DO NOT use adapters for:**
- Missing **required** fields → Escalate to backend
- Wrong data types → Escalate to backend
- Completely different structure → Escalate to backend
- Stub responses (null/empty) → Escalate to backend

## Adapter Pattern

```typescript
// adapters/reports.ts

import type { ReportDetail } from '@/types/api';

interface RawReportResponse {
  id: string;
  type: string; // Backend uses "type" instead of "violationType"
  status: string;
  reporter_id: string; // snake_case
  reported_entity: {
    id: string;
    content?: string;
  };
  created_at: string; // ISO string
  handled_at?: string;
  handled_by?: string;
}

export function adaptReportDetail(raw: RawReportResponse): ReportDetail {
  return {
    id: raw.id,
    violationType: raw.type as ViolationType, // Map field name
    status: raw.status as ReportStatus,
    contentType: 'POST', // Default if missing
    
    // Transform nested objects
    reporter: { 
      id: raw.reporter_id,
      username: 'Unknown' // Fallback if not provided
    },
    reportedEntity: {
      id: raw.reported_entity.id,
      content: raw.reported_entity.content,
    },
    
    // Transform dates
    createdAt: raw.created_at,
    handledAt: raw.handled_at,
    
    // Handle optional fields
    handledBy: raw.handled_by 
      ? { username: raw.handled_by }
      : undefined,
  };
}
```

## Usage in API Functions

```typescript
// lib/api/reports.ts

import { adaptReportDetail } from './adapters/reports';

export async function getReport(token: string, reportId: string) {
  const raw = await apiFetch<RawReportResponse>(
    `/api/v1/reports/${reportId}`,
    { token }
  );
  return adaptReportDetail(raw); // Return adapted version
}

export async function listReports(token: string, params?: ReportListParams) {
  const raw = await apiFetch<RawReportResponse[]>('/api/v1/reports', { token });
  return raw.map(adaptReportDetail); // Map array
}
```

## Runtime Validation (Optional)

For critical data, add runtime validation:

```typescript
import { z } from 'zod';

const RawReportSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.string(),
  reporter_id: z.string(),
  // ... full schema
});

export function adaptReportDetail(raw: unknown): ReportDetail {
  // Validate first
  const validated = RawReportSchema.parse(raw);
  
  // Then adapt
  return {
    id: validated.id,
    violationType: validated.type as ViolationType,
    // ...
  };
}
```

## Logging Mismatches (Development)

Log when adapters are used to track technical debt:

```typescript
export function adaptReportDetail(raw: RawReportResponse): ReportDetail {
  if (process.env.NODE_ENV === 'development') {
    if (!('violationType' in raw) && 'type' in raw) {
      console.warn('[Adapter] reports: mapping "type" → "violationType"');
    }
  }
  
  return { /* ... */ };
}
```

## Testing Adapters

```typescript
// adapters/reports.test.ts

import { adaptReportDetail } from './reports';

describe('adaptReportDetail', () => {
  it('maps backend field names to frontend types', () => {
    const raw = {
      id: '123',
      type: 'SPAM',
      status: 'PENDING',
      reporter_id: 'user1',
      reported_entity: { id: 'post1' },
      created_at: '2026-05-07T10:00:00Z',
    };
    
    const result = adaptReportDetail(raw);
    
    expect(result.violationType).toBe('SPAM');
    expect(result.reporter.id).toBe('user1');
    expect(result.createdAt).toBe('2026-05-07T10:00:00Z');
  });
  
  it('handles missing optional fields', () => {
    const raw = {
      id: '123',
      type: 'SPAM',
      status: 'PENDING',
      reporter_id: 'user1',
      reported_entity: { id: 'post1' },
      created_at: '2026-05-07T10:00:00Z',
      // handled_at and handled_by missing
    };
    
    const result = adaptReportDetail(raw);
    
    expect(result.handledAt).toBeUndefined();
    expect(result.handledBy).toBeUndefined();
  });
});
```

## Current Adapters

(Will be populated as mismatches are found during backend integration testing)

- `reports.ts` - Report response transformations (pending backend test)
- `users.ts` - User response transformations (pending backend test)
- `activity-logs.ts` - Activity log transformations (pending backend test)

## Maintenance

**When to remove adapters:**
- Backend fixes the mismatch
- Frontend updates types to match backend
- API version upgrade changes contract

**Document removal:**
```typescript
// REMOVED 2026-06-01: Backend now returns "violationType" directly
// export function adaptReportDetail(raw: RawReportResponse): ReportDetail { ... }
```
