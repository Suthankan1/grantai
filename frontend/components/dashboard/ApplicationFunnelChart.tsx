"use client";

import { FolderOpen } from "lucide-react";
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicationFunnelChartProps {
  funnelData: Array<{
    value: number;
    name: string;
    fill: string;
  }>;
  showFallbackFunnel: boolean;
}

export function ApplicationFunnelChart({
  funnelData,
  showFallbackFunnel,
}: ApplicationFunnelChartProps) {
  return (
    <Card variant="glass" className="rounded-3xl border border-[var(--border-default)] overflow-hidden">
      <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4.5 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
              Application Funnel
            </CardTitle>
            <CardDescription className="text-[10px] mt-0.5">
              Pipeline progression metrics.
            </CardDescription>
          </div>
          <FolderOpen className="h-4.5 w-4.5 text-[#00D4AA]" />
        </div>
      </CardHeader>
      <CardContent className="p-5 flex flex-col justify-between h-[278px]">
        <div className="h-[180px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  background: "#0a0a14",
                  border: "1px solid rgba(240,240,255,0.08)",
                  borderRadius: "12px",
                  fontSize: "11px",
                }}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#fff" stroke="none" dataKey="name" fontSize={10} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
        {showFallbackFunnel && (
          <p className="text-[9px] text-amber-400 bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl text-center leading-normal">
            Note: Demonstration statistics shown until active submissions are added on the Tracker board.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
