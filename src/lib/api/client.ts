const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function logApiEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_API === "1"
  );
}

/** Ẩn trường nhạy cảm khi log ra console (dev). */
function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[…]";
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  const keyRe =
    /password|token|refreshToken|accessToken|authorization|secret/i;
  if (Array.isArray(value)) {
    return value.map((v) => redactForLog(v, depth + 1));
  }
  const o = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(o).map(([k, v]) => [
      k,
      keyRe.test(k) ? "[REDACTED]" : redactForLog(v, depth + 1),
    ])
  );
}

/** Ghép base (từ NEXT_PUBLIC_API_BASE_URL) với path — tránh lặp /api/v1 khi env đã kết thúc bằng /api/v1. */
function resolveApiUrl(path: string): string {
  const b = base.replace(/\/$/, "");
  let p = path.startsWith("/") ? path : `/${path}`;
  if (b.endsWith("/api/v1") && p.startsWith("/api/v1")) {
    p = p.slice("/api/v1".length);
    if (!p.startsWith("/")) p = `/${p}`;
  }
  return `${b}${p}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = resolveApiUrl(path);
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = options.token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const { body, token: _t, ...rest } = options;
  const method = rest.method ?? "GET";
  const fetchBody =
    body !== undefined && !(body instanceof FormData)
      ? JSON.stringify(body)
      : (body as BodyInit | null | undefined);

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers,
      body: fetchBody,
    });
  } catch (err) {
    if (logApiEnabled()) {
      console.error("[API] fetch lỗi mạng / CORS / URL:", { method, url, err });
    }
    throw err;
  }

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }

  if (logApiEnabled()) {
    const reqLabel =
      body !== undefined && !(body instanceof FormData)
        ? redactForLog(body)
        : body instanceof FormData
          ? "<FormData>"
          : undefined;
    console.groupCollapsed(`[API] ${method} ${url} → ${res.status}`);
    if (reqLabel !== undefined) console.log("request body", reqLabel);
    console.log("response body", redactForLog(parsed));
    console.groupEnd();
  }

  if (!res.ok) {
    throw new ApiError(
      typeof parsed === "object" && parsed && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : res.statusText || "Request failed",
      res.status,
      parsed
    );
  }

  return parsed as T;
}
