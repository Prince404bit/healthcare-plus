"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  taken: number;
  missed: number;
  skipped: number;
  rate: number;
};

export function AdherenceRingChart({ taken, missed, skipped, rate }: Props) {
  const data = [
    { name: "Taken", value: taken, color: "#22c55e" },
    { name: "Missed", value: missed, color: "#ef4444" },
    { name: "Skipped", value: skipped, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) data.push({ name: "No data", value: 1, color: "#e2e8f0" });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Dose Adherence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{rate}%</span>
              <span className="text-[10px] text-muted-foreground">adherence</span>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            {[
              { label: "Taken", value: taken, color: "bg-emerald-500" },
              { label: "Missed", value: missed, color: "bg-red-500" },
              { label: "Skipped", value: skipped, color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
