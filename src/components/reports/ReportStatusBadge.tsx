import type { ReportStatus } from "@/types/api";

interface Props {
  status: ReportStatus;
}

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "Đang chờ", className: "text-amber-600" },
  UNDER_REVIEW: { label: "Đang xem xét", className: "text-blue-600" },
  PROCESSED: { label: "Đã xử lý", className: "text-green-600" },
  DISMISSED: { label: "Đã bỏ qua", className: "text-gray-500" },
  ESCALATED: { label: "Đã leo thang", className: "text-red-600" },
};

export function ReportStatusBadge({ status }: Props) {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
