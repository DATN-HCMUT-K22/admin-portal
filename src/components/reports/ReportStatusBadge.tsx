import type { ReportStatus } from "@/types/api";

interface Props {
  status: ReportStatus;
}

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "text-amber-600" },
  UNDER_REVIEW: { label: "Under Review", className: "text-blue-600" },
  PROCESSED: { label: "Processed", className: "text-green-600" },
  DISMISSED: { label: "Dismissed", className: "text-gray-500" },
  ESCALATED: { label: "Escalated", className: "text-red-600" },
};

export function ReportStatusBadge({ status }: Props) {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
