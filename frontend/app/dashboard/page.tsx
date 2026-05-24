"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/layout/MobileHeader";


import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StatCards } from "@/components/dashboard/StatCards";
import { SuitabilityTrendsChart } from "@/components/dashboard/SuitabilityTrendsChart";
import { ApplicationFunnelChart } from "@/components/dashboard/ApplicationFunnelChart";
import { DeadlinesTimeline } from "@/components/dashboard/DeadlinesTimeline";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProfileRadarChart } from "@/components/dashboard/ProfileRadarChart";

export default function DashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    loading,
    totalBookmarked,
    totalApplied,
    winRate,
    totalWonAmount,
    upcomingDeadlines,
    upcomingDeadlinesCount,
    matchChartData,
    funnelData,
    showFallbackFunnel,
    radarData,
    activityTimeline,
    timeAgo,
  } = useDashboardData();

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar navigation component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Dashboard Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Sleek radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dash Content Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          
          {/* Welcome Dashboard Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(240,240,255,0.04)] pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/10 text-[9px] font-bold text-purple-400 border border-purple-500/20">A</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Command Center</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Command Dashboard
              </h1>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Overview of match vectors, active deadlines, and aggregate pipeline success.
              </p>
            </div>
            
            {/* Quick Actions (Deep-links) */}
            <div className="flex flex-wrap gap-2.5">
              <Button asChild variant="outline" className="rounded-xl text-xs border-[rgba(240,240,255,0.1)] hover:bg-[rgba(240,240,255,0.05)] text-white h-9">
                <Link href="/grants">Find New Grants</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl text-xs border-[rgba(240,240,255,0.1)] hover:bg-[rgba(240,240,255,0.05)] text-white h-9">
                <Link href="/letters">Generate Letter</Link>
              </Button>
              <Button asChild className="rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-9">
                <Link href="/interview">Practice Interview</Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-8">
              
              {/* STATS ROW (4 Cards) with mount animations & count-ups */}
              <StatCards
                totalBookmarked={totalBookmarked}
                totalApplied={totalApplied}
                totalWonAmount={totalWonAmount}
                winRate={winRate}
                upcomingDeadlinesCount={upcomingDeadlinesCount}
              />

              {/* DYNAMIC MIDDLE CHARTS GRID */}
              <div className="grid gap-6 lg:grid-cols-3">
                
                {/* A. LineChart: match score trends (takes 2 columns) */}
                <SuitabilityTrendsChart matchChartData={matchChartData} />

                {/* B. FunnelChart: Application Pipeline Funnel (takes 1 column) */}
                <ApplicationFunnelChart
                  funnelData={funnelData}
                  showFallbackFunnel={showFallbackFunnel}
                />

              </div>

              {/* BOTTOM SECTION: TIMELINE, ACTIVITY, RADAR PANELS */}
              <div className="grid gap-6 lg:grid-cols-3">
                
                {/* 1. Upcoming DeadlinesTimeline Widget (takes 1 col) */}
                <DeadlinesTimeline upcomingDeadlines={upcomingDeadlines} />

                {/* 2. Dynamic Activity Feed Timeline (takes 1 col) */}
                <ActivityFeed activityTimeline={activityTimeline} timeAgo={timeAgo} />

                {/* 3. AI Insights Panel - Radar Chart Profile Strength (takes 1 col) */}
                <ProfileRadarChart radarData={radarData} />

              </div>

              {/* GLOBAL PLATFORM GUIDE BANNER */}
              <div className="relative overflow-hidden rounded-3xl border border-[rgba(108,71,255,0.15)] bg-gradient-to-r from-[rgba(108,71,255,0.06)] via-[rgba(5,5,12,0.6)] to-transparent p-6 sm:p-8">
                <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-[radial-gradient(circle,_rgba(108,71,255,0.15),_transparent_70%)]" />
                <div className="max-w-2xl space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" /> Complete Onboarding Settings
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    By completing all fields in your **Profile Settings Wizard**, your AI profile insights match vector will increase, generating significantly higher suitability scoring metrics against live foundation pipelines.
                  </p>
                  <div className="pt-2">
                    <Button asChild size="sm" variant="glow" className="rounded-xl h-8.5 text-xs text-white">
                      <Link href="/onboarding">Complete My Profile <ChevronRight className="ml-0.5 h-3.5 w-3.5" /></Link>
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}