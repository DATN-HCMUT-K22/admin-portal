"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const Gauge = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Gauge),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center min-h-[180px]">
        <Spin size="small" />
      </div>
    ),
  }
);

interface GaugeChartProps {
  /** 0.0 – 1.0 */
  percent: number;
  title: string;
  color?: string;
  height?: number;
}

export function GaugeChart({
  percent,
  title,
  color = "#3b82f6",
  height = 220,
}: GaugeChartProps) {
  const safePercent = Math.min(Math.max(percent, 0), 1);

  const config = {
    data: {
      target: Math.round(safePercent * 100),
      total: 100,
      name: title,
      thresholds: [100],
    },
    legend: false,
    style: {
      arcShape: "round",
      arcLineWidth: 1,
      textContent: (target: number, total: number) =>
        `${((target / total) * 100).toFixed(1)}%`,
    },
    scale: {
      color: {
        range: [color, "#e2e8f0"],
      },
    },
    height,
    autoFit: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Gauge {...(config as any)} />;
}
