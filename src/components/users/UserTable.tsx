import Link from "next/link";
import type { UserAdminView } from "@/types/api";

interface Props {
  users: UserAdminView[];
  showActions?: boolean;
}

export function UserTable({ users, showActions = true }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/80">
          <tr>
            <th className="px-4 py-3 font-medium">Username</th>
            <th className="px-4 py-3 font-medium">Họ tên</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Credits</th>
            {showActions && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-4 py-3">{u.username}</td>
              <td className="px-4 py-3">{u.fullName}</td>
              <td className="px-4 py-3">
                {u.isDeleted ? (
                  <span className="text-muted-foreground">Đã xóa</span>
                ) : u.isLocked ? (
                  <span className="text-amber-600">Khóa</span>
                ) : (
                  <span className="text-primary">Hoạt động</span>
                )}
              </td>
              <td className="px-4 py-3">{u.credits}</td>
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/system/users/${u.id}`}
                    className="font-medium text-foreground underline"
                  >
                    Chi tiết
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Không có dữ liệu.
        </p>
      )}
    </div>
  );
}
