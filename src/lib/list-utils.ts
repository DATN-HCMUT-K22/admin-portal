/** Chuẩn hóa response list từ API (mảng hoặc { items }) */
export function normalizeItems<T>(raw: T[] | { items?: T[] } | null | undefined): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items)) return raw.items;
  return [];
}
