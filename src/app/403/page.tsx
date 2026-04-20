import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold text-muted-foreground">403</h1>
      <p className="text-muted-foreground">
        Bạn không có quyền truy cập khu vực này. Vai trò hiện tại không khớp với
        trang đang mở.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Về bảng điều khiển
        </Link>
        <Link
          href="/home"
          className="rounded-lg border border-border px-4 py-2 text-sm"
        >
          Trang người dùng
        </Link>
      </div>
    </div>
  );
}
