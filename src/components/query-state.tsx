"use client";

import { type ReactNode } from "react";

interface QueryStateProps {
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  onRetry?: () => void;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function QueryState({
  isLoading,
  error,
  children,
  onRetry,
  emptyMessage,
  isEmpty = false,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center"
        role="alert"
      >
        <div className="mb-2 text-lg">⚠️</div>
        <p className="text-sm text-destructive mb-3">
          Có lỗi xảy ra: {error.message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (isEmpty && emptyMessage) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
