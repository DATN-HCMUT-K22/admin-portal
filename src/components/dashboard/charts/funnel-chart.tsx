"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const Funnel = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Funnel),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center min-h-[220px]">
        <Spin size="small" />
      </div>
    ),
  }
);

export interface FunnelItem {
  stage: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelItem[];
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ["#f59e0b", "#14b8a6", "#94a3b8", "#6366f1"];

export function FunnelChart({
  data,
  colors = DEFAULT_COLORS,
  height = 260,
}: FunnelChartProps) {
  const config = {
    data,
    xField: "stage",
    yField: "value",
    shape: "funnel",
    colorField: "stage",
    scale: {
      color: { range: colors.slice(0, data.length) },
    },
    label: {
      text: (d: FunnelItem) =>
        `${d.stage}: ${new Intl.NumberFormat().format(d.value)}`,
      position: "inside",
      style: {
        fontSize: 12,
        fontWeight: 600,
        fill: "#fff",
        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
      },
    },
    tooltip: {
      items: [
        {
          field: "value",
          name: "Reports",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueFormatter: (v: any) => new Intl.NumberFormat().format(v),
        },
      ],
    },
    legend: false,
    height,
    autoFit: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Funnel {...(config as any)} />;
}
