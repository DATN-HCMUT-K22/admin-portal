/**
 * Runtime API Response Validation
 *
 * Utilities for validating API responses match expected shapes.
 * Helps catch integration issues early in development.
 */

/**
 * Check if response has required fields.
 * Logs warnings in development when fields are missing.
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: unknown,
  requiredFields: (keyof T)[],
  context: string
): data is T {
  if (!data || typeof data !== 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Validation] ${context}: Expected object, got ${typeof data}`);
    }
    return false;
  }

  const obj = data as Record<string, unknown>;
  const missing: string[] = [];

  for (const field of requiredFields) {
    const fieldStr = String(field);
    if (!(fieldStr in obj) || obj[fieldStr] === undefined) {
      missing.push(fieldStr);
    }
  }

  if (missing.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Validation] ${context}: Missing required fields:`, missing);
      console.log('Received data:', data);
    }
    return false;
  }

  return true;
}

/**
 * Log field mismatches between expected and actual response.
 * Useful for tracking adapter requirements.
 */
export function logFieldMismatch(
  context: string,
  expected: string[],
  actual: Record<string, unknown>
) {
  if (process.env.NODE_ENV !== 'development') return;

  const actualFields = Object.keys(actual);
  const missing = expected.filter((f) => !actualFields.includes(f));
  const extra = actualFields.filter((f) => !expected.includes(f));

  if (missing.length > 0 || extra.length > 0) {
    console.group(`[API Mismatch] ${context}`);
    if (missing.length > 0) {
      console.warn('Missing expected fields:', missing);
    }
    if (extra.length > 0) {
      console.log('Extra fields (ignored):', extra);
    }
    console.log('Full response:', actual);
    console.groupEnd();
  }
}

/**
 * Validate enum values.
 * Ensures backend returns valid enum values that TypeScript expects.
 */
export function validateEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  context: string,
  fallback?: T
): T {
  if (typeof value === 'string' && validValues.includes(value as T)) {
    return value as T;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[Validation] ${context}: Invalid enum value "${value}". Expected one of:`,
      validValues
    );
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`${context}: Invalid enum value "${value}"`);
}

/**
 * Validate paginated response structure.
 */
export function isPaginated<T>(
  data: unknown
): data is { items: T[]; total?: number; page?: number; pageSize?: number } {
  return (
    data !== null &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as any).items)
  );
}

/**
 * Safely extract data from envelope response.
 * Validates envelope structure before unwrapping.
 */
export function validateEnvelope<T>(raw: unknown, context: string): T {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`${context}: Expected envelope object, got ${typeof raw}`);
  }

  const envelope = raw as Record<string, unknown>;

  // Check for envelope structure
  if (!('code' in envelope) || !('data' in envelope)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Validation] ${context}: Response is not in envelope format`);
    }
    return raw as T;
  }

  // Validate success code
  if (envelope.code !== 1000) {
    const message = typeof envelope.message === 'string' ? envelope.message : 'Request failed';
    throw new Error(`${context}: ${message} (code: ${envelope.code})`);
  }

  return envelope.data as T;
}
