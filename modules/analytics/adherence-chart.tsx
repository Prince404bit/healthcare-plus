"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DailyData = {
  date: string;
  taken: number;
  missed: number;
  total: number;
  rate: number;
};

type AdherenceChartProps = {
  data: DailyData[];
};

export function AdherenceChart({ data }: AdherenceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Dose Adherence (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="takenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="missedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="taken" stroke="#22c55e" fill="url(#takenGrad)" name="Taken" />
            <Area type="monotone" dataKey="missed" stroke="#ef4444" fill="url(#missedGrad)" name="Missed" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
