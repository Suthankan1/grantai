"use client";

import { motion } from "framer-motion";
import { FolderOpen, TrendingUp, Award, Clock } from "lucide-react";
import { CountUp } from "./CountUp";
import { CircularProgress } from "./CircularProgress";

interface StatCardsProps {
  totalBookmarked: number;
  totalApplied: number;
  totalWonAmount: number;
  winRate: number;
  upcomingDeadlinesCount: number;
}

export function StatCards({
  totalBookmarked,
  totalApplied,
  totalWonAmount,
  winRate,
  upcomingDeadlinesCount,
}: StatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Grants Applied */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5 hover:border-[rgba(108,71,255,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Tracked Pipelines
          </span>
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
            <FolderOpen className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white">
            <CountUp value={totalBookmarked} />
          </span>
          <span className="text-xs text-[var(--color-muted)]">saved opportunities</span>
        </div>
        <div className="mt-2 text-[10px] text-[var(--color-muted)] flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">+18% this month</span>
          <span className="text-slate-500">• {totalApplied} active submissions</span>
        </div>
      </motion.div>

      {/* 2. Won Amount */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5 hover:border-[rgba(16,185,129,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Total Won Funding
          </span>
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <Award className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-emerald-400">
            {totalWonAmount > 0 ? <CountUp value={totalWonAmount} prefix="$" /> : "$0"}
          </span>
          <span className="text-[10px] text-[var(--color-muted)]">awarded</span>
        </div>
        <div className="mt-2 text-[10px] text-[var(--color-muted)]">
          Incentives & research fellowships.
        </div>
      </motion.div>

      {/* 3. Win Rate % */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5 hover:border-[rgba(0,212,170,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-md flex items-center justify-between"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] block">
            Pipeline Win Rate
          </span>
          <span className="text-xs text-[var(--color-subtle)] font-medium block">
            Ratio of won proposals.
          </span>
          <span className="text-[9px] text-[var(--color-muted)] block mt-1.5 font-medium">
            Updated in real-time
          </span>
        </div>
        <CircularProgress percentage={Math.round(winRate)} />
      </motion.div>

      {/* 4. Upcoming Deadlines count */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="group relative rounded-2xl border border-[var(--border-default)] bg-[rgba(10,10,20,0.4)] p-5 hover:border-[rgba(245,158,11,0.25)] hover:bg-[rgba(12,12,28,0.55)] transition-all duration-300 shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Urgent Tasks
          </span>
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-500">
            <CountUp value={upcomingDeadlinesCount} />
          </span>
          <span className="text-xs text-[var(--color-muted)]">deadlines within 30d</span>
        </div>
        <div className="mt-2 text-[10px] text-[var(--color-muted)]">
          Keep submissions updated on the board.
        </div>
      </motion.div>
    </div>
  );
}
