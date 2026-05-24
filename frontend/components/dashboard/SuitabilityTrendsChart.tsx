"use client";

import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      date: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[rgba(10,10,20,0.85)] backdrop-blur-md border border-[rgba(240,240,255,0.08)] p-3.5 rounded-2xl shadow-2xl">
        <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)]">
          {payload[0].payload.date}
        </p>
        <p className="text-xs font-bold text-[#9B73FF] mt-1">Match Suitability: {payload[0].value}%</p>
        <p className="text-[10px] text-white/70 mt-0.5">{payload[0].payload.name}</p>
      </div>
    );
  }
  return null;
};

interface SuitabilityTrendsChartProps {
  matchChartData: Array<{
    name: string;
    score: number;
    date: string;
  }>;
}

export function SuitabilityTrendsChart({ matchChartData }: SuitabilityTrendsChartProps) {
  return (
    <Card
      variant="glass"
      className="lg:col-span-2 rounded-3xl border border-[var(--border-default)] overflow-hidden"
    >
      <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4.5 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
              Suitability Trends
            </CardTitle>
            <CardDescription className="text-[10px] mt-0.5">
              Evolution of grant match scores across past 10 indexed inquiries.
            </CardDescription>
          </div>
          <TrendingUp className="h-4.5 w-4.5 text-[#6C47FF]" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={matchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6C47FF" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 240, 255, 0.03)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(240, 240, 255, 0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(240, 240, 255, 0.4)"
                fontSize={10}
                domain={[50, 100]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(108, 71, 255, 0.15)", strokeWidth: 1.5 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="url(#lineGlow)"
                strokeWidth={3}
                activeDot={{ r: 6, fill: "#00D4AA", stroke: "#05050c", strokeWidth: 2 }}
                dot={{ r: 3, fill: "#6C47FF", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
