/** Skeleton full layout — tránh “role flash” khi bootstrap /me */

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-border bg-muted md:w-64 md:border-b-0 md:border-r">
        <div className="sticky top-0 space-y-4 p-4">
          <div className="h-7 w-36 animate-pulse rounded-md bg-secondary" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-secondary/80" />
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-secondary/70" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-secondary/60" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-secondary/60" />
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 space-y-4 p-6">
        <div className="h-10 max-w-md animate-pulse rounded-lg bg-secondary" />
        <div className="h-32 animate-pulse rounded-xl bg-secondary/70" />
        <div className="h-24 animate-pulse rounded-xl bg-secondary/50" />
      </div>
    </div>
  );
}
