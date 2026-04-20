"use client";

export function QueryState({
  isLoading,
  error,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Đang tải…
      </p>
    );
  }
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        role="alert"
      >
        {error.message}
      </div>
    );
  }
  return <>{children}</>;
}
