"use client";

import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DeadlinesTimelineProps {
  upcomingDeadlines: Array<{
    trackerId: string;
    grantId: string;
    grantTitle: string;
    provider: string;
    deadline: string;
    daysLeft: number;
  }>;
}

export function DeadlinesTimeline({ upcomingDeadlines }: DeadlinesTimelineProps) {
  return (
    <Card variant="glass" className="rounded-3xl border border-[var(--border-default)] overflow-hidden">
      <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
              Timeline Deadlines
            </CardTitle>
            <CardDescription className="text-[9px] mt-0.5">
              Next 5 upcoming grant due dates.
            </CardDescription>
          </div>
          <Calendar className="h-4 w-4 text-purple-400" />
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {upcomingDeadlines.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border-default)] bg-[rgba(240,240,255,0.005)] rounded-2xl">
            <Clock className="h-7 w-7 text-slate-600 mb-2.5" />
            <p className="text-xs font-semibold text-slate-400">No imminent deadlines</p>
            <p className="text-[9px] text-[var(--color-muted)] mt-1 leading-relaxed">
              Your active applications with deadline dates will be cataloged chronologically here.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-[rgba(240,240,255,0.06)] pl-5 space-y-5 ml-2.5 my-1">
            {upcomingDeadlines.slice(0, 5).map((event) => {
              const isUrgent = event.daysLeft < 7;
              const isWarning = event.daysLeft <= 14;

              return (
                <div key={event.trackerId} className="relative group">
                  {/* Dot node */}
                  <span
                    className={`absolute -left-[27px] top-1 flex h-3 w-3 items-center justify-center rounded-full border bg-[#05050c] transition duration-300 group-hover:scale-125 ${
                      isUrgent
                        ? "border-rose-500 text-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        : isWarning
                        ? "border-amber-500 text-amber-500"
                        : "border-purple-500 text-purple-500"
                    }`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isUrgent ? "bg-rose-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-purple-500"
                      }`}
                    />
                  </span>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#9B73FF] transition-colors leading-snug">
                      <Link href="/tracker">{event.grantTitle}</Link>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold border ${
                          isUrgent
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : isWarning
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {event.daysLeft === 0
                          ? "Due Today"
                          : event.daysLeft === 1
                          ? "1 Day Left"
                          : `${event.daysLeft} Days Left`}
                      </span>
                      <span className="text-[9px] text-[var(--color-muted)] font-medium">
                        Due {event.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
