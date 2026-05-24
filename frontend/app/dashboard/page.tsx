"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  Sparkles,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Plus
} from "lucide-react";
import { getDashboardStats, DashboardStatsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsApi | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Format currency aggregates
  const formatAmount = (amount: number | string | null) => {
    if (!amount) return "$0";
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  if (loading) {
    return (
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.2),_transparent_40%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-[var(--color-muted)] font-medium">Assembling dashboard analytics...</span>
        </div>
      </section>
    );
  }

  // Fallback default values if no data tracked
  const totalApplied = stats?.totalApplied ?? 0;
  const winRate = stats?.winRate ?? 0;
  const avgMatchScore = stats?.avgMatchScore ?? 0;
  const grantsBookmarked = stats?.grantsBookmarked ?? 0;
  const totalWonAmount = stats?.totalWonAmount ?? 0;
  const totalAppliedAmount = stats?.totalAppliedAmount ?? 0;
  const upcomingDeadlines = stats?.upcomingDeadlines ?? [];
  const recentActivities = stats?.recentActivities ?? [];

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* Visual background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.08),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-35" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(240,240,255,0.04)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-bold text-emerald-400 border border-emerald-500/20">D</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Analytics Dashboard</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Academic Dashboard
            </h1>
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Welcome back. Real-time overview of your matches, deadlines, and aggregate funding success.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" asChild className="rounded-xl text-xs border-[rgba(240,240,255,0.1)] hover:bg-[rgba(240,240,255,0.045)] text-white">
              <Link href="/tracker">View Kanban Board</Link>
            </Button>
            <Button asChild className="rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
              <Link href="/grants"><Plus className="mr-1 h-3.5 w-3.5" /> Match Grants</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid Widget */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Total Applied */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5.5 hover:border-[rgba(108,71,255,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Active Tracked</span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
                <FolderOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{grantsBookmarked}</span>
              <span className="text-xs text-[var(--color-muted)]">grants saved</span>
            </div>
            <div className="mt-2 text-[10px] text-[var(--color-muted)]">
              Applied & Reviewing: <strong className="text-white">{totalApplied}</strong>
            </div>
          </motion.div>

          {/* Card 2: Win Rate */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5.5 hover:border-[rgba(0,212,170,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Success Win Rate</span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {winRate > 0 ? `${winRate.toFixed(0)}%` : "0%"}
              </span>
              <span className="text-xs text-[var(--color-muted)]">win factor</span>
            </div>
            <div className="mt-2 text-[10px] text-[var(--color-muted)]">
              Ratio of won to rejected applications.
            </div>
          </motion.div>

          {/* Card 3: Avg Match Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5.5 hover:border-[rgba(245,158,11,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Avg Match Score</span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {avgMatchScore > 0 ? `${avgMatchScore}%` : "55%"}
              </span>
              <span className="text-xs text-[var(--color-muted)]">suitability</span>
            </div>
            <div className="mt-2 text-[10px] text-[var(--color-muted)]">
              Calculated from academic profile keywords.
            </div>
          </motion.div>

          {/* Card 4: Total Won Funding */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5.5 hover:border-[rgba(16,185,129,0.3)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Aggregate Funding</span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-400">
                {formatAmount(totalWonAmount)}
              </span>
              <span className="text-xs text-[var(--color-muted)]">won</span>
            </div>
            <div className="mt-2 text-[10px] text-[var(--color-muted)]">
              Applied for: <strong className="text-white">{formatAmount(totalAppliedAmount)}</strong>
            </div>
          </motion.div>

        </div>

        {/* Dynamic Section: Timeline and Activities split-pane */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Timeline - takes 2 columns */}
          <Card variant="glass" className="md:col-span-2 overflow-hidden rounded-3xl border border-[var(--border-default)]">
            <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Deadlines</CardTitle>
                  <CardDescription className="text-[10px] mt-0.5">Application due dates within the next 30 days.</CardDescription>
                </div>
                <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingDeadlines.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border-default)] bg-[rgba(240,240,255,0.005)] rounded-2xl">
                  <Clock className="h-8 w-8 text-slate-600 mb-2.5" />
                  <p className="text-xs font-semibold text-slate-400">No deadlines in the next 30 days</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-1">Deadlines of active pipeline grants will appear in this timeline track.</p>
                </div>
              ) : (
                <div className="relative border-l border-[rgba(240,240,255,0.06)] pl-6.5 space-y-7 ml-3.5 my-2">
                  {upcomingDeadlines.map((event) => {
                    // Determine deadline color
                    const isUrgent = event.daysLeft < 7;
                    const isWarning = event.daysLeft <= 14;

                    return (
                      <div key={event.trackerId} className="relative group">
                        
                        {/* Chronological Circle Indicator */}
                        <span className={`absolute -left-10 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border bg-[#05050c] transition-all duration-300 group-hover:scale-110 ${
                          isUrgent 
                            ? "border-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                            : isWarning 
                              ? "border-amber-500 text-amber-500" 
                              : "border-purple-500 text-purple-500"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isUrgent ? "bg-red-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-purple-500"
                          }`} />
                        </span>

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white hover:text-purple-300 transition-colors">
                              <Link href="/tracker">{event.grantTitle}</Link>
                            </h4>
                            <span className="text-[10px] text-[var(--color-muted)] font-medium mt-0.5 block">{event.provider}</span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                            <span className={`rounded-md px-2.5 py-0.5 text-[9px] font-semibold border ${
                              isUrgent 
                                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                : isWarning 
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }`}>
                              {event.daysLeft === 0 ? "Due Today" : event.daysLeft === 1 ? "1 Day Left" : `${event.daysLeft} Days Left`}
                            </span>
                            <span className="text-[9px] text-slate-500 font-semibold">{event.deadline}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed - takes 1 column */}
          <Card variant="glass" className="overflow-hidden rounded-3xl border border-[var(--border-default)]">
            <CardHeader className="border-b border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="mt-0.5 rounded-lg bg-[rgba(240,240,255,0.03)] border border-[rgba(240,240,255,0.06)] p-1.5 h-fit text-[var(--color-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] leading-normal text-[rgba(240,240,255,0.85)]">{act.description}</p>
                      <span className="text-[9px] font-medium text-[var(--color-muted)]">{act.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Global Guide CTA */}
        <div className="relative overflow-hidden rounded-3xl border border-[rgba(108,71,255,0.15)] bg-gradient-to-r from-[rgba(108,71,255,0.06)] via-[rgba(5,5,12,0.6)] to-transparent p-6 sm:p-8">
          <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-[radial-gradient(circle,_rgba(108,71,255,0.15),_transparent_70%)]" />
          
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" /> Accelerate Your Grant Defense
            </h3>
            <p className="text-xs text-[var(--color-muted)] mt-2 leading-relaxed">
              We match your user profile builder metadata against thousands of federal, university, and foundation indexes. Build beautiful cover letters customized with professional tone emphasis in our Cover Letter AI Generator and track submissions in real-time.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button asChild className="rounded-xl text-xs h-8.5 bg-purple-600 hover:bg-purple-500 text-white">
                <Link href="/tracker">View Tracker <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}