"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Coins, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listLetters, type CoverLetterApi } from "@/lib/api";
import { formatAmount } from "@/lib/format-helpers";

export default function LettersListPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTone, setSelectedTone] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical">("newest");

  // Fetch letters via React Query
  const { data: letters = [], isLoading, isError, error } = useQuery<CoverLetterApi[]>({
    queryKey: ["letters-list"],
    queryFn: listLetters,
    refetchInterval: 30000, // refresh list every 30 seconds
  });

  // Filter and sort cover letters
  const filteredAndSortedLetters = useMemo(() => {
    let result = [...letters];

    // Filter by search query (title, provider, content)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.grantTitle?.toLowerCase().includes(query) ||
          l.grantProvider?.toLowerCase().includes(query) ||
          l.content?.toLowerCase().includes(query)
      );
    }

    // Filter by tone
    if (selectedTone !== "All") {
      result = result.filter((l) => l.tone?.toLowerCase() === selectedTone.toLowerCase());
    }

    // Sort letters
    result.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "alphabetical") {
        return (a.grantTitle ?? "").localeCompare(b.grantTitle ?? "");
      }
      return 0;
    });

    return result;
  }, [letters, searchQuery, selectedTone, sortBy]);

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Decorative radial lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Content Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(240,240,255,0.04)] pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/10 text-[9px] font-bold text-purple-400 border border-purple-500/20">L</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Assistant Suite</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Cover Letters
              </h1>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Manage, refine, and view all AI-generated application letters.
              </p>
            </div>
            <div>
              <Button asChild className="rounded-xl text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-9 shadow-lg">
                <Link href="/grants">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Generate New Letter
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          {!isLoading && !isError && letters.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card variant="glass" padding="sm" className="bg-[rgba(240,240,255,0.015)] border-[rgba(240,240,255,0.04)]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Total Letters</div>
                <div className="text-xl font-bold mt-1 text-white">{letters.length}</div>
              </Card>
              <Card variant="glass" padding="sm" className="bg-[rgba(240,240,255,0.015)] border-[rgba(240,240,255,0.04)]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Professional Tone</div>
                <div className="text-xl font-bold mt-1 text-purple-400">
                  {letters.filter((l) => l.tone?.toLowerCase() === "professional").length}
                </div>
              </Card>
              <Card variant="glass" padding="sm" className="bg-[rgba(240,240,255,0.015)] border-[rgba(240,240,255,0.04)]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Warm Tone</div>
                <div className="text-xl font-bold mt-1 text-orange-400">
                  {letters.filter((l) => l.tone?.toLowerCase() === "warm").length}
                </div>
              </Card>
              <Card variant="glass" padding="sm" className="bg-[rgba(240,240,255,0.015)] border-[rgba(240,240,255,0.04)]">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Academic Tone</div>
                <div className="text-xl font-bold mt-1 text-emerald-400">
                  {letters.filter((l) => l.tone?.toLowerCase() === "academic").length}
                </div>
              </Card>
            </div>
          )}

          {/* Filtering and Search Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search letters, providers, keywords..."
                className="h-10 rounded-xl border-[rgba(108,71,255,0.2)] bg-[rgba(240,240,255,0.02)] pl-10 text-sm shadow-sm"
              />
            </div>

            {/* Filter Pills and Sorters */}
            <div className="flex flex-wrap gap-3 items-center justify-end w-full md:w-auto">
              <div className="flex rounded-xl bg-[rgba(240,240,255,0.02)] border border-[rgba(240,240,255,0.06)] p-0.5">
                {["All", "Professional", "Warm", "Academic"].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTone === tone
                        ? "bg-[var(--color-primary)] text-white shadow-glow-sm"
                        : "text-[var(--color-muted)] hover:text-white"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>

              {/* Sorting Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "alphabetical")}
                className="h-9 rounded-xl border border-[rgba(240,240,255,0.06)] bg-[rgba(15,15,26,0.95)] px-3 py-1 text-xs text-[var(--color-muted)] transition-colors hover:text-white outline-none focus:border-[rgba(108,71,255,0.4)]"
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="alphabetical">Sort Alphabetically</option>
              </select>
            </div>
          </div>

          {/* Loading, Error and Grid Views */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-muted)]">Retrieving cover letter vault...</span>
            </div>
          ) : isError ? (
            <Card variant="glass-strong" className="p-8 text-center max-w-xl mx-auto border-red-500/20 bg-red-500/5">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <CardTitle className="text-red-400">Failed to load letters</CardTitle>
              <CardDescription className="mt-2 text-sm text-[var(--color-muted)]">
                {error instanceof Error ? error.message : "An unexpected server error occurred."}
              </CardDescription>
              <Button onClick={() => window.location.reload()} className="mt-4 text-xs">
                Retry Connection
              </Button>
            </Card>
          ) : filteredAndSortedLetters.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAndSortedLetters.map((letter) => (
                <Card 
                  key={letter.id} 
                  variant="interactive" 
                  padding="none" 
                  className="flex flex-col overflow-hidden group border-[rgba(240,240,255,0.04)] bg-[rgba(10,10,18,0.25)] hover:border-[rgba(108,71,255,0.3)] shadow-lg"
                >
                  <CardHeader className="border-b border-[rgba(240,240,255,0.03)] px-5 py-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-subtle)] truncate">
                        {letter.grantProvider || "Unknown Provider"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {letter.tone && (
                          <Badge variant="primary" size="sm">
                            {letter.tone}
                          </Badge>
                        )}
                        {letter.status && (
                          <Badge 
                            variant={letter.status === "READY" ? "success" : "warning"} 
                            size="sm"
                            dot
                          >
                            {letter.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-1 text-white group-hover:text-[rgba(155,115,255,1)] transition-colors">
                      {letter.grantTitle || "Untitled Cover Letter"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 px-5 py-4 flex flex-col gap-3">
                    {/* Snippet of content */}
                    {letter.content ? (
                      <p 
                        className="text-xs text-[var(--color-muted)] line-clamp-3 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: letter.content.replace(/<[^>]*>/g, "").slice(0, 180) + "..."
                        }}
                      />
                    ) : (
                      <p className="text-xs text-[var(--color-muted)] italic">No content generated yet.</p>
                    )}

                    {/* Metadata details */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(240,240,255,0.02)] text-[10px] text-[var(--color-muted)]">
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-3 w-3 text-emerald-400" />
                        <span>{formatAmount(letter.grantAmount, letter.grantCurrency)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="h-3 w-3 text-purple-400" />
                        <span>Created {formatDate(letter.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-5 py-3 border-t border-[rgba(240,240,255,0.03)] bg-[rgba(240,240,255,0.01)] flex justify-between items-center">
                    <span className="text-[10px] text-[var(--color-subtle)]">
                      {letter.length || "Standard 500w"}
                    </span>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-purple-400 hover:text-white hover:bg-[rgba(108,71,255,0.1)] rounded-lg">
                      <Link href={`/letters/${letter.id}`}>
                        Edit Letter <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="glass-strong" className="p-12 text-center max-w-2xl mx-auto border-[rgba(108,71,255,0.1)] bg-[rgba(10,10,18,0.15)] rounded-[2rem]">
              <div className="h-12 w-12 rounded-2xl bg-[rgba(108,71,255,0.08)] flex items-center justify-center mx-auto mb-4 border border-[rgba(108,71,255,0.15)] shadow-glow-sm">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-lg font-bold">No cover letters found</CardTitle>
              <CardDescription className="mt-2 text-sm text-[var(--color-muted)] max-w-md mx-auto leading-relaxed">
                {searchQuery || selectedTone !== "All"
                  ? "No letters match your search parameters. Try adjusting your query or tone filter."
                  : "You haven't generated any cover letters yet. Find matching grants first to generate tailor-made cover letters."}
              </CardDescription>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {(searchQuery || selectedTone !== "All") ? (
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTone("All");
                    }}
                    variant="outline"
                    className="rounded-xl text-xs h-9"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild variant="glow" className="rounded-xl text-xs h-9">
                    <Link href="/grants">
                      Find Grants to Start <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
