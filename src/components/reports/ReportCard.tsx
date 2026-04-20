import Link from "next/link";
import { ReportStatusBadge } from "./ReportStatusBadge";
import type { ReportDetail } from "@/types/api";

interface Props {
  report: ReportDetail;
}

export function ReportCard({ report }: Props) {
  return (
    <div className="rounded-xl border border-border p-4 transition hover:bg-accent/50">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-medium">Báo cáo #{report.id.slice(0, 8)}</h3>
          <p className="text-sm text-muted-foreground">
            Loại vi phạm: {report.violationType}
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Người báo cáo:</span>{" "}
          <span className="font-medium">{report.reporter.username}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Loại nội dung:</span>{" "}
          <span className="font-medium">{report.contentType}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Thời gian:</span>{" "}
          {new Date(report.createdAt).toLocaleString("vi-VN")}
        </div>
      </div>

      <div className="mt-4 text-right">
        <Link
          href={`/dashboard/business/reports/${report.id}`}
          className="font-medium text-primary underline"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
