/** Chuẩn hóa response list từ API (mảng hoặc { items }) */
export function normalizeItems<T>(raw: T[] | { items?: T[] } | { content?: T[] } | any): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if ('items' in raw && Array.isArray(raw.items)) return raw.items;
  if ('content' in raw && Array.isArray((raw as any).content)) return (raw as any).content;
  
  // Unwrap Spring Boot ApiResponse wrapper: { code, message, data: { content: [] } }
  if ('data' in raw && (raw as any).data) {
    const inner = (raw as any).data;
    if (Array.isArray(inner)) return inner;
    if ('items' in inner && Array.isArray((inner as any).items)) return (inner as any).items;
    if ('content' in inner && Array.isArray((inner as any).content)) return (inner as any).content;
  }
  
  return [];
}
