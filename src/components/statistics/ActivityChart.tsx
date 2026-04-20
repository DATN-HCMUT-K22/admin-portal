"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataPoint {
  date: string;
  posts: number;
  comments: number;
}

interface Props {
  data: DataPoint[];
}

export function ActivityChart({ data }: Props) {
  const formattedData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric"
    }),
  }));

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 font-semibold">Hoạt động 30 ngày qua</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="posts"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Bài viết"
          />
          <Line
            type="monotone"
            dataKey="comments"
            stroke="#10b981"
            strokeWidth={2}
            name="Bình luận"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
