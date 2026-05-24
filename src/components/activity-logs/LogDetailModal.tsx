import type { ActivityLog } from "@/types/api";

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
}

function parseMetadata(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function LogDetailModal({ log, onClose }: Props) {
  if (!log) return null;

  const metadata = parseMetadata(log.metadata);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Chi tiết Activity Log</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-6">
          {/* User */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
            {log.user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={log.user.avatarUrl}
                alt={log.user.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                {log.user.username[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{log.user.username}</p>
              {log.user.fullName && (
                <p className="text-sm text-muted-foreground">{log.user.fullName}</p>
              )}
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">ID Log</p>
              <p className="mt-0.5 font-mono text-xs">{log.id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Hành động</p>
              <p className="mt-0.5 font-semibold text-sm">{log.action}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Thời gian</p>
              <p className="mt-0.5 text-sm">
                {new Date(log.created_at).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">IP Address</p>
              <p className="mt-0.5 font-mono text-sm">{log.ip_address ?? "—"}</p>
            </div>
            {log.entity_type && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Loại đối tượng</p>
                <p className="mt-0.5 text-sm">{log.entity_type}</p>
              </div>
            )}
            {log.entity_id && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">ID đối tượng</p>
                <p className="mt-0.5 font-mono text-xs">{log.entity_id}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          {metadata && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Metadata</p>
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
