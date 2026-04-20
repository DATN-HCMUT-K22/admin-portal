interface Props {
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/80">
          <tr>
            {[1, 2, 3, 4, 5].map((i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="h-[300px] animate-pulse rounded bg-muted/50" />
    </div>
  );
}
