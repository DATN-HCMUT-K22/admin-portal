import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
}

export function StatCard({ title, value, icon, subtitle }: Props) {
  return (
    <div className="rounded-xl border border-border p-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && (
        <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
