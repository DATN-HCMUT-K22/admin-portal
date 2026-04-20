import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bảng điều khiển
        </h1>
        <p className="mt-2 text-muted-foreground">
          Chọn chế độ <strong>Hệ thống</strong> (người dùng, phân quyền, kiểm duyệt) hoặc{" "}
          <strong>Kinh doanh</strong> (địa điểm, ranh giới hành chính) trên thanh bên.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/dashboard/system/users"
            className="block rounded-xl border border-border p-4 transition hover:bg-accent/70"
          >
            <span className="font-medium">Người dùng</span>
            <p className="mt-1 text-sm text-muted-foreground">Danh sách & khóa/mở, gán role</p>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/business/locations"
            className="block rounded-xl border border-border p-4 transition hover:bg-accent/70"
          >
            <span className="font-medium">Địa điểm</span>
            <p className="mt-1 text-sm text-muted-foreground">Tạo và chỉnh sửa địa điểm</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
