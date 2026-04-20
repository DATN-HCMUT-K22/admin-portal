import Link from "next/link";

export default function BusinessLocationsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Địa điểm (POI)</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tạo mới, cập nhật hoặc xóa mềm địa điểm theo ID.
        </p>
      </div>
      <ul className="space-y-3">
        <li>
          <Link
            href="/dashboard/business/locations/new"
            className="block rounded-xl border border-border px-4 py-4 font-medium transition hover:bg-accent/70"
          >
            Tạo POI thủ công
          </Link>
        </li>
        <li className="rounded-xl border border-dashed border-border p-4 text-sm">
          <p className="mb-2 text-muted-foreground">Cập nhật theo ID:</p>
          <p>
            Đi tới{" "}
            <code className="rounded bg-muted px-1">
              /dashboard/business/locations/[id]
            </code>{" "}
            — thay [id] bằng UUID địa điểm.
          </p>
        </li>
      </ul>
    </div>
  );
}
