"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusData = { status: string; count: number };

const COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#22c55e",
  CANCELLED: "#ef4444",
  COMPLETED: "#3b82f6",
  NO_SHOW: "#6b7280",
};

export function AppointmentStatusChart({ data }: { data: StatusData[] }) {
  const chartData = data.map((d) => ({ name: d.status, value: d.count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appointments by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? "#8884d8"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
