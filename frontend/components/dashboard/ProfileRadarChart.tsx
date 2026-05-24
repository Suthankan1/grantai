"use client";

import { Sparkles } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileRadarChartProps {
  radarData: Array<{
    subject: string;
    score: number;
    fullMark: number;
  }>;
}

export function ProfileRadarChart({ radarData }: ProfileRadarChartProps) {
  return (
    <Card variant="glass" className="rounded-3xl border border-[var(--border-default)] overflow-hidden">
      <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
              AI Profile Insights
            </CardTitle>
            <CardDescription className="text-[9px] mt-0.5">
              Multi-dimensional suitabilities.
            </CardDescription>
          </div>
          <Sparkles className="h-4 w-4 text-purple-400" />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex items-center justify-center h-[240px]">
        <div className="w-full h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(240, 240, 255, 0.04)" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="rgba(240, 240, 255, 0.4)"
                tick={{ fill: "rgba(240, 240, 255, 0.6)", fontSize: 8, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Academic Suitability"
                dataKey="score"
                stroke="#6C47FF"
                fill="#6C47FF"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
