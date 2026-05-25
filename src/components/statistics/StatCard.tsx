import type { ReactNode } from "react";
import { Card, Statistic } from "antd";

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
}

export function StatCard({ title, value, icon, subtitle }: Props) {
  return (
    <Card bordered={true}>
      <Statistic
        title={<span style={{ fontWeight: 500 }}>{title}</span>}
        value={value}
        prefix={icon}
      />
      {subtitle && (
        <div style={{ marginTop: 8, fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
          {subtitle}
        </div>
      )}
    </Card>
  );
}
