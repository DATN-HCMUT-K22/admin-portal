interface ModerationAction {
  id: string;
  actionType: string;
  reason: string;
  handledBy: string;
  createdAt: string;
}

interface Props {
  history: ModerationAction[];
}

export function ModerationHistoryTable({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-border p-6">
        <h3 className="mb-4 font-semibold">Lịch sử kiểm duyệt</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">
          Chưa có hành động kiểm duyệt nào
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Lịch sử kiểm duyệt</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/80">
            <tr>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
              <th className="px-4 py-3 font-medium">Lý do</th>
              <th className="px-4 py-3 font-medium">Người xử lý</th>
            </tr>
          </thead>
          <tbody>
            {history.map((action) => (
              <tr key={action.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {new Date(action.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 font-medium">{action.actionType}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {action.reason.length > 50
                    ? `${action.reason.slice(0, 50)}...`
                    : action.reason}
                </td>
                <td className="px-4 py-3">{action.handledBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
