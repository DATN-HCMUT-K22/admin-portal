"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const Treemap = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Treemap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center min-h-[220px]">
        <Spin size="small" />
      </div>
    ),
  }
);

export interface TreemapItem {
  name: string;
  value: number;
}

interface TreemapChartProps {
  data: TreemapItem[];
  height?: number;
}

const PALETTE = ["#6366f1", "#06b6d4", "#10b981", "#8b5cf6"];

export function TreemapChart({ data, height = 260 }: TreemapChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // G2 v5 requires hierarchical object { name, children: [{name, value}] }
  const hierarchyData = {
    name: "root",
    children: data.map((item) => ({ name: item.name, value: item.value })),
  };

  const config = {
    data: hierarchyData,
    encode: {
      value: "value",
      // After treeDataTransform, datum has d.path = ['root','Posts']
      // color must reference path[1] (child name), not 'name' field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (d: any) => d?.path?.[1] ?? d?.path?.[0] ?? "unknown",
    },
    scale: {
      color: { range: PALETTE },
    },
    // Override default label via style.label* prefix (merged into DEFAULT_LABEL_OPTIONS)
    // Do NOT use labels[] array — it appends after default causing duplicates
    style: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      labelText: (d: any) => {
        const name = d?.path?.[d.path.length - 1] ?? "";
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
        return `${name}\n${pct}%`;
      },
      labelFontSize: 13,
      labelFontWeight: "bold",
      labelFill: "#ffffff",
      labelTextAlign: "center",
      labelPosition: "inside",
      stroke: "#ffffff",
      lineWidth: 2,
    },
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: (d: any) => d?.path?.slice(1).join(" › ") ?? "",
      items: [
        {
          field: "value",
          name: "Count",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueFormatter: (v: any) => {
            const num = Number(v);
            const pct = total > 0 ? ((num / total) * 100).toFixed(1) : "0";
            return `${new Intl.NumberFormat().format(num)} (${pct}%)`;
          },
        },
      ],
    },
    legend: false,
    height,
    autoFit: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Treemap {...(config as any)} />;
}
