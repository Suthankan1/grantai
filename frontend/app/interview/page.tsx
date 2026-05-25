"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { SessionsList } from "@/components/interview/SessionsList";
import { SessionReviewModal } from "@/components/interview/SessionReviewModal";
import { listInterviewSessions } from "@/lib/api";
import type { InterviewSessionResponseApi } from "@/lib/api";

export default function InterviewHubPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedPastSession, setSelectedPastSession] = useState<InterviewSessionResponseApi | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: () => listInterviewSessions(),
  });

  const sessions = sessionsQuery.data;
  const isLoading = sessionsQuery.isLoading;

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar navigation component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Sleek radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Content Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(240,240,255,0.04)] pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/10 text-[9px] font-bold text-purple-400 border border-purple-500/20">I</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Simulator</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Interview Prep
              </h1>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Practice grant interviews and review AI feedback.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <Button asChild className="rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-9">
                <Link href="/grants">Browse Grants</Link>
              </Button>
            </div>
          </div>

          {/* Sessions List or Empty State */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 shimmer rounded-2xl w-full" />
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <SessionsList
              isLoading={isLoading}
              sessions={sessions}
              setSelectedPastSession={setSelectedPastSession}
            />
          ) : (
            <Card variant="glass-strong" padding="xl" className="text-center border-[var(--border-default)] flex flex-col items-center justify-center min-h-[300px]">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">No practice sessions yet</CardTitle>
              <p className="text-sm text-[var(--color-muted)] max-w-md mx-auto mb-6">
                No practice sessions yet. Visit a grant page to start your first interview.
              </p>
              <Button asChild className="rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-10 px-6">
                <Link href="/grants">Browse Grants</Link>
              </Button>
            </Card>
          )}

          {/* Session Review Modal */}
          <AnimatePresence>
            {selectedPastSession && (
              <SessionReviewModal
                selectedPastSession={selectedPastSession}
                setSelectedPastSession={setSelectedPastSession}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
