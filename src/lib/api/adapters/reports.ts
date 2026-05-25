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
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_API === '1') {
    console.log('[Adapter] reports.adaptReportDetail:', raw);
  }

  const reason = (raw.reason || raw.violationType || raw.type) as ViolationType;
  const reportedEntityType = (raw.reportedEntityType || raw.contentType || raw.content_type || 'POST') as ContentType;
  const status = raw.status as ReportStatus;

  const reporter = raw.reporter
    ? {
        id: raw.reporter.id,
        username: raw.reporter.username,
        fullName: raw.reporter.fullName || null,
        avatarUrl: raw.reporter.avatarUrl || null,
      }
    : {
        id: raw.reporter_id || raw.reporterId,
        username: raw.reporter_username || 'Unknown',
        fullName: null,
        avatarUrl: null,
      };

  const reportedEntityId =
    raw.reportedEntityId ||
    raw.reported_entity_id ||
    (raw.reportedEntity && raw.reportedEntity.id) ||
    '';

  const reported_content_text =
    raw.reported_content_text ||
    raw.reported_entity_content ||
    (raw.reportedEntity && raw.reportedEntity.content);

  return {
    id: raw.id,
    reason,
    status,
    description: raw.description,
    reportedBy: raw.reportedBy || raw.reported_by || reporter.id,
    reporter,
    reportedEntityId,
    reportedEntityType,
    reported_content_text,
    reported_media_url: raw.reported_media_url,
    created_at: raw.created_at || raw.createdAt,
    updated_at: raw.updated_at || raw.updatedAt,
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
