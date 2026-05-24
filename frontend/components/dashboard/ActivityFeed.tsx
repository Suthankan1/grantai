"use client";

import { Activity, FolderOpen, FileText, Mic } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: "tracker" | "letter" | "interview" | "general";
  title: string;
  desc: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  activityTimeline: ActivityItem[];
  timeAgo: (date: Date) => string;
}

export function ActivityFeed({ activityTimeline, timeAgo }: ActivityFeedProps) {
  return (
    <Card variant="glass" className="rounded-3xl border border-[var(--border-default)] overflow-hidden">
      <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
              Platform Activities
            </CardTitle>
            <CardDescription className="text-[9px] mt-0.5">
              Real-time audit log of your actions.
            </CardDescription>
          </div>
          <Activity className="h-4 w-4 text-emerald-400" />
        </div>
      </CardHeader>
      <CardContent className="p-5 max-h-[300px] overflow-y-auto space-y-4 scrollbar-thin">
        {activityTimeline.map((act) => (
          <div key={act.id} className="flex gap-3">
            <div className="mt-0.5 rounded-lg bg-[rgba(240,240,255,0.03)] border border-[rgba(240,240,255,0.06)] p-1.5 h-fit text-[var(--color-muted)] shrink-0">
              {act.type === "tracker" && <FolderOpen className="h-3.5 w-3.5 text-purple-400" />}
              {act.type === "letter" && <FileText className="h-3.5 w-3.5 text-emerald-400" />}
              {act.type === "interview" && <Mic className="h-3.5 w-3.5 text-[#9B73FF]" />}
              {act.type === "general" && <Activity className="h-3.5 w-3.5" />}
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] font-bold text-white leading-normal truncate">{act.title}</p>
              <p className="text-[10px] leading-relaxed text-[var(--color-muted)] pr-1">{act.desc}</p>
              <span className="text-[8px] font-semibold text-slate-500 block mt-0.5">
                {timeAgo(act.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
