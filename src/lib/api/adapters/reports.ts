/**
 * Report API Response Adapters
 *
 * Handles potential mismatches between backend responses and frontend TypeScript types.
 * Created as part of Phase 1 integration testing.
 *
 * TODO: Update after actual backend integration testing (see docs/api-integration-test.md)
 */

import type { ReportDetail, ViolationType, ReportStatus, ContentType } from '@/types/api';

/**
 * Adapter for report detail responses.
 *
 * Potential mismatches to handle (discovered during testing):
 * - Field naming (type vs violationType, snake_case vs camelCase)
 * - Missing optional fields
 * - Nested object structures
 *
 * Current status: TEMPLATE - awaiting backend integration test results
 */
export function adaptReportDetail(raw: any): ReportDetail {
  // Log when adapter is used in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_API === '1') {
    console.log('[Adapter] reports.adaptReportDetail:', raw);
  }

  // Handle potential field name mismatches
  // Example: Backend might use "type" instead of "violationType"
  const violationType = (raw.violationType || raw.type) as ViolationType;
  const contentType = (raw.contentType || raw.content_type || 'POST') as ContentType;
  const status = raw.status as ReportStatus;

  // Handle reporter object - might be nested differently
  const reporter = raw.reporter
    ? { id: raw.reporter.id, username: raw.reporter.username }
    : { id: raw.reporter_id || raw.reporterId, username: raw.reporter_username || 'Unknown' };

  // Handle reportedEntity object
  const reportedEntity = raw.reportedEntity || raw.reported_entity || {
    id: raw.reported_entity_id || raw.reportedEntityId,
    content: raw.reported_entity_content || raw.content,
    userId: raw.reported_user_id || raw.userId,
  };

  // Handle handledBy - might be string username or object
  const handledBy = raw.handledBy
    ? (typeof raw.handledBy === 'string'
        ? { username: raw.handledBy }
        : raw.handledBy)
    : raw.handled_by
      ? (typeof raw.handled_by === 'string'
          ? { username: raw.handled_by }
          : raw.handled_by)
      : undefined;

  return {
    id: raw.id,
    contentType,
    violationType,
    status,
    reporter,
    reportedEntity,
    createdAt: raw.createdAt || raw.created_at,
    handledAt: raw.handledAt || raw.handled_at,
    handledBy,
    description: raw.description,
  };
}

/**
 * Adapter for report list responses.
 * Handles both array and paginated responses.
 */
export function adaptReportList(raw: any): ReportDetail[] {
  // Handle paginated response
  if (raw && typeof raw === 'object' && 'items' in raw) {
    return raw.items.map(adaptReportDetail);
  }

  // Handle array response
  if (Array.isArray(raw)) {
    return raw.map(adaptReportDetail);
  }

  // Unexpected format
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Adapter] reports: Unexpected response format:', raw);
  }

  return [];
}

/**
 * Validate report handle response.
 * BRD indicates this endpoint may return null (partially implemented).
 *
 * TODO: Update after backend testing confirms actual behavior
 */
export function validateHandleReportResponse(raw: any): unknown {
  if (raw === null || raw === undefined) {
    // Expected per BRD - backend returns null
    console.warn('[API] POST /reports/{id}/handle returned null (stub response)');
    return null;
  }

  return raw;
}
