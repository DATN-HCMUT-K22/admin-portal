/** Phản hồi chuẩn API TripJoy: { code, data } */

export type ApiEnvelope<T> = {
  code: number;
  data: T;
  message?: string;
};

export function unwrapData<T>(parsed: unknown): T {
  if (
    parsed &&
    typeof parsed === "object" &&
    "data" in parsed &&
    "code" in parsed
  ) {
    return (parsed as ApiEnvelope<T>).data;
  }
  return parsed as T;
}
