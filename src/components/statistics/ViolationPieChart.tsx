"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  violations: Record<string, number>;
}

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981"];

export function ViolationPieChart({ violations }: Props) {
  const data = Object.entries(violations).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-border p-6">
        <h3 className="mb-4 font-semibold">Phân loại vi phạm</h3>
        <p className="py-12 text-center text-sm text-muted-foreground">
          Không có vi phạm
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Phân loại vi phạm</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} (${((percent || 0) * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
