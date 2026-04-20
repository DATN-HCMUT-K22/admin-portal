import type { ActivityLog } from "@/types/api";

interface Props {
  log: ActivityLog | null;
  onClose: () => void;
}

export function LogDetailModal({ log, onClose }: Props) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chi tiết log</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="font-mono text-sm">{log.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Người dùng</p>
              <p className="font-medium">{log.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hành động</p>
              <p className="font-medium">{log.action}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
              <p>{new Date(log.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">IP Address</p>
              <p className="font-mono text-sm">{log.ipAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đối tượng</p>
              <p>
                {log.entityType} #{log.entityId}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">User Agent</p>
            <p className="text-xs text-muted-foreground">{log.userAgent}</p>
          </div>

          {log.payload && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Payload</p>
              <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-medium transition hover:bg-accent"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
