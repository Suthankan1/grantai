"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Mic,
  Calendar,
  BookOpen,
  ChevronRight,
  Sparkles,
  Award,
  Play,
  MessageSquare
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listTracker, listInterviewSessions } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function InterviewHubPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch tracked grants
  const trackerQuery = useQuery({
    queryKey: ["tracker-list"],
    queryFn: listTracker,
  });

  // Fetch past interview sessions
  const sessionsQuery = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: listInterviewSessions,
  });

  const loading = trackerQuery.isLoading || sessionsQuery.isLoading;

  const trackedGrants = trackerQuery.data ?? [];
  const pastSessions = sessionsQuery.data ?? [];

  // Filter grants that are in the tracker and not rejected
  const activeGrants = trackedGrants.filter(
    (g) => !["Rejected"].includes(g.status)
  );

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 8) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (score >= 5) return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onMobileClose={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Visual background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.12),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_30%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Main Section */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          
          {/* Welcome Header */}
          <div className="flex flex-col gap-2 border-b border-[rgba(240,240,255,0.04)] pb-6 mb-8">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">AI Interview Prep</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Interview Prep Room
            </h1>
            <p className="text-xs text-[var(--color-muted)] max-w-2xl leading-relaxed">
              Simulate high-pressure defense committees. Select an active tracked grant from your pipeline, answer tailored technical & impact questions, and receive detailed structural AI evaluations.
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-40 shimmer rounded-3xl" />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-60 shimmer rounded-3xl" />
                <div className="h-60 shimmer rounded-3xl" />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              
              {/* Left 2 Cols: Active Grants Pipeline */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" /> Choose Grant to Practice
                  </h2>
                  <Badge variant="outline">{activeGrants.length} Tracked</Badge>
                </div>

                {activeGrants.length === 0 ? (
                  <Card variant="glass" className="text-center p-8 border-dashed border-[var(--border-default)]">
                    <CardContent className="py-6 flex flex-col items-center justify-center">
                      <Mic className="h-10 w-10 text-[var(--color-muted)] mb-3" />
                      <p className="text-sm font-semibold text-slate-300">No active tracked grants found</p>
                      <p className="text-xs text-[var(--color-muted)] mt-1.5 max-w-md">
                        Before starting an interview simulation, search for grants and click <strong>&quot;Add to Tracker&quot;</strong> or generate a Cover Letter to start tracking.
                      </p>
                      <Button asChild className="mt-4 rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
                        <Link href="/grants">Find Match Grants</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {activeGrants.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -3 }}
                        className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5 hover:border-[rgba(108,71,255,0.25)] hover:bg-[rgba(12,12,28,0.5)] transition-all duration-300 shadow-md flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="primary" className="text-[9px] py-0.5 px-2">
                              {item.status}
                            </Badge>
                            <span className="text-[9px] text-[var(--color-muted)] font-semibold">
                              Deadline: {item.grantDeadline}
                            </span>
                          </div>
                          
                          <h3 className="text-sm font-bold text-white group-hover:text-[#9B73FF] transition-colors line-clamp-1">
                            {item.grantTitle}
                          </h3>
                          <p className="text-[11px] text-[var(--color-muted)] line-clamp-1">
                            {item.grantProvider}
                          </p>
                        </div>

                        <div className="mt-5 border-t border-[rgba(240,240,255,0.04)] pt-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-[#00D4AA]">
                            {item.grantAmount ? `$${Number(item.grantAmount).toLocaleString()}` : "Funding Pool"}
                          </span>
                          
                          <Button asChild size="sm" variant="glow" className="rounded-xl h-8 text-[11px]">
                            <Link href={`/interview/${item.grantId}`}>
                              <Play className="mr-1 h-3 w-3 fill-current" /> Start Practice
                            </Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 1 Col: Past Practice History */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-emerald-400" /> Past Sessions Audit
                </h2>

                {pastSessions.length === 0 ? (
                  <Card variant="glass" className="p-6 border-[var(--border-default)]">
                    <CardContent className="py-6 flex flex-col items-center justify-center text-center">
                      <MessageSquare className="h-8 w-8 text-slate-600 mb-2.5" />
                      <p className="text-xs font-bold text-slate-400">No practice attempts recorded</p>
                      <p className="text-[10px] text-[var(--color-muted)] mt-1.5">
                        Your performance dashboard and committee feedback summaries will build here once you save sessions.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pastSessions.slice(0, 5).map((session) => {
                      let attemptCount = 0;
                      try {
                        attemptCount = Object.keys(JSON.parse(session.answersJson || "{}")).length;
                      } catch {}

                      return (
                        <Card
                          key={session.id}
                          variant="glass-strong"
                          className="border-[var(--border-default)] hover:border-emerald-500/20 transition-all duration-300"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {session.grantTitle}
                              </h4>
                              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
                                {session.grantProvider}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-[var(--color-subtle)]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(session.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {attemptCount} Answered
                              </span>
                            </div>

                            <div className="border-t border-[rgba(240,240,255,0.04)] pt-2.5 flex items-center justify-between">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-lg border",
                                getScoreBadgeStyle(Math.round(session.avgScore))
                              )}>
                                Score: {session.avgScore.toFixed(1)}/10
                              </span>

                              <Button asChild size="sm" variant="outline" className="rounded-lg text-[9px] h-6">
                                <Link href={`/interview/${session.grantId}`}>
                                  Review <ChevronRight className="ml-0.5 h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
