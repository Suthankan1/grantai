"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, Copy, ExternalLink, FileText, Loader2, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGrantById, createTracker, listTracker, generateLetter } from "@/lib/api";

function splitReasoning(reasoning: string | null | undefined) {
  if (!reasoning) return [];
  return reasoning
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
      <svg viewBox="0 0 88 88" className="h-28 w-28 -rotate-90">
        <circle cx="44" cy="44" r={radius} stroke="rgba(240,240,255,0.08)" strokeWidth="7" fill="none" />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          stroke="url(#grant-detail-gradient)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="grant-detail-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C47FF" />
            <stop offset="100%" stopColor="#00D4AA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-display text-4xl font-semibold text-[var(--color-text)]">{clamped}%</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">Match</div>
      </div>
    </div>
  );
}

function formatAmount(amount: number | string | null, currency: string | null) {
  if (amount === null || amount === undefined || amount === "") {
    return "Funding available";
  }

  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) {
    return `${currency ?? "USD"} funding`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-2 text-sm leading-6 text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function readChecklist(storageKey: string, requiredDocuments: string[]) {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return [] as string[];
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .filter((item) => requiredDocuments.includes(item));
  } catch {
    return [] as string[];
  }
}

export default function GrantDetailPage() {
  const params = useParams<{ id: string }>();
  const grantId = params?.id;
  const router = useRouter();

  const grantQuery = useQuery({
    queryKey: ["grant", grantId],
    queryFn: () => getGrantById(grantId),
    enabled: !!grantId,
  });

  const [saved, setSaved] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [checkedDocuments, setCheckedDocuments] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!grantId) return;
    const checkTracked = async () => {
      try {
        const list = await listTracker();
        const isTracked = list.some((entry) => entry.grantId === grantId);
        setSaved(isTracked);
      } catch (err) {
        console.error("Failed to check tracker status:", err);
      }
    };
    void checkTracked();
  }, [grantId]);

  React.useEffect(() => {
    if (!grantId || typeof window === "undefined") return;

    const storageKey = `grantai-checklist:${grantId}`;
    setCheckedDocuments(readChecklist(storageKey, grantQuery.data?.documentsRequired ?? []));
  }, [grantId, grantQuery.data?.documentsRequired]);

  React.useEffect(() => {
    if (!grantId || typeof window === "undefined") return;

    const storageKey = `grantai-checklist:${grantId}`;
    window.localStorage.setItem(storageKey, JSON.stringify(checkedDocuments));
  }, [checkedDocuments, grantId]);

  const grant = grantQuery.data;
  const insights = splitReasoning(grant?.matchReasoning);
  const requiredDocuments = grant?.documentsRequired ?? [];
  const completedDocuments = checkedDocuments.filter((item) => requiredDocuments.includes(item));
  const documentsReadyCount = completedDocuments.length;
  const allDocumentsReady = requiredDocuments.length > 0 && documentsReadyCount === requiredDocuments.length;

  const toggleDocument = (documentName: string) => {
    setCheckedDocuments((current) =>
      current.includes(documentName)
        ? current.filter((item) => item !== documentName)
        : [...current, documentName]
    );
  };

  const copyChecklist = async () => {
    if (requiredDocuments.length === 0) return;

    const checklistText = requiredDocuments.map((documentName) => {
      const checked = checkedDocuments.includes(documentName) ? "[x]" : "[ ]";
      return `${checked} ${documentName}`;
    }).join("\n");

    try {
      await navigator.clipboard.writeText(`Application Checklist for ${grant?.title ?? "this grant"}\n\n${checklistText}`);
      setStatusMessage("Checklist copied to clipboard.");
    } catch (err) {
      console.error("Failed to copy checklist:", err);
      setStatusMessage("Unable to copy the checklist right now.");
    }
  };

  const handleGenerateLetter = async () => {
    if (!grant?.id) return;
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const letterId = await generateLetter({ grantId: grant.id });
      router.push(`/letters/${letterId}?source=grant`);
    } catch (err) {
      console.error("Failed to generate cover letter:", err);
      const msg = err instanceof Error ? err.message : "Failed to generate cover letter.";
      setStatusMessage(msg);
      setIsGenerating(false);
    }
  };

  if (grantQuery.isLoading) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-52 shimmer rounded-full" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
            <div className="space-y-4">
              <div className="h-72 shimmer rounded-[2rem]" />
              <div className="h-64 shimmer rounded-[2rem]" />
            </div>
            <div className="h-[520px] shimmer rounded-[2rem]" />
          </div>
        </div>
      </section>
    );
  }

  if (!grant) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <Card variant="glass-strong" className="mx-auto max-w-2xl p-8 text-center">
          <CardTitle>Grant not found</CardTitle>
          <p className="mt-3 text-sm text-[var(--color-muted)]">The grant you requested is no longer available.</p>
          <Button asChild className="mt-6">
            <Link href="/grants">
              <ChevronLeft className="h-4 w-4" />
              Back to search
            </Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.12),_transparent_24%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl pb-10 pt-4">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/grants">
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-6">
            <Card variant="glass-strong" padding="none" className="overflow-hidden">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">{grant.grantType}</Badge>
                  <Badge variant="accent">{grant.field}</Badge>
                  <Badge variant="outline">{grant.countryName}</Badge>
                </div>

                <div className="space-y-3">
                  <h1 className="font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.95] tracking-tight">{grant.title}</h1>
                  <p className="text-lg text-[var(--color-muted)]">{grant.provider}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
                  <Badge variant="solid-accent" size="lg">
                    {formatAmount(grant.amount, grant.currency)}
                  </Badge>
                  <Badge variant="warning" size="lg">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Deadline {grant.deadline}
                  </Badge>
                  {grant.sourceUrl && (
                    <Badge variant="info" size="lg">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Source
                    </Badge>
                  )}
                </div>

                <p className="max-w-4xl text-base leading-7 text-[var(--color-text)]/90">{grant.description}</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailRow label="Eligibility" value={grant.eligibility ?? "Eligibility details were not provided."} />
              <DetailRow label="Timeline" value={grant.timeline ?? "Timeline details were not provided."} />
              <DetailRow
                label="Documents required"
                value={grant.documentsRequired.length > 0 ? `${grant.documentsRequired.length} documents listed` : "No document list available."}
              />
              <DetailRow label="Application URL" value={grant.applicationUrl ? <a className="text-[#00D4AA] underline-offset-4 hover:underline" href={grant.applicationUrl} target="_blank" rel="noreferrer">Open application</a> : "Not available"} />
            </div>

            <Card variant="glass-strong" padding="none" className="overflow-hidden">
              <CardHeader className="border-b border-[var(--border-default)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Application Checklist</CardTitle>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {requiredDocuments.length > 0
                        ? `${documentsReadyCount} of ${requiredDocuments.length} documents ready`
                        : "No required documents were listed for this grant."}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={copyChecklist} disabled={requiredDocuments.length === 0}>
                    <Copy className="h-4 w-4" />
                    Copy Checklist
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {requiredDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {requiredDocuments.map((documentName) => {
                      const checked = checkedDocuments.includes(documentName);

                      return (
                        <label
                          key={documentName}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4 transition-colors hover:border-[rgba(0,212,170,0.35)]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDocument(documentName)}
                            className="mt-1 h-4 w-4 rounded border-[var(--border-default)] text-[#00D4AA] focus:ring-[#00D4AA]"
                          />
                          <span className={checked ? "text-[var(--color-text)] line-through decoration-[#00D4AA]" : "text-[var(--color-text)]"}>
                            {documentName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4 text-sm text-[var(--color-muted)]">
                    No checklist items were provided for this grant.
                  </div>
                )}

                {allDocumentsReady && grant.applicationUrl && (
                  <div className="rounded-2xl border border-[rgba(0,212,170,0.35)] bg-[rgba(0,212,170,0.1)] p-4 text-sm text-white shadow-[0_0_0_1px_rgba(0,212,170,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-semibold">
                        <Check className="h-4 w-4 text-[#00D4AA]" />
                        You&apos;re ready to apply! ✓
                      </div>
                      <Button asChild variant="glow" size="sm">
                        <a href={grant.applicationUrl} target="_blank" rel="noreferrer">
                          Open application
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card variant="glass-strong" padding="none" className="overflow-hidden">
              <CardContent className="space-y-6 p-6">
                <div className="text-center">
                  <ScoreRing score={grant.matchScore} />
                  <div className="mt-4 text-sm text-[var(--color-muted)]">Profile fit based on your saved onboarding data and live AI scoring.</div>
                </div>

                <div className="grid gap-3">
                  <Button
                    variant="glow"
                    size="lg"
                    className="w-full"
                    disabled={isGenerating}
                    onClick={handleGenerateLetter}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Cover Letter
                      </>
                    )}
                  </Button>

                  <Button asChild variant="outline" size="lg" className="w-full border-primary/40 hover:border-primary/80">
                    <Link href={`/interview/${grant.id}`}>
                      <Sparkles className="h-4 w-4 text-[#00D4AA] animate-pulse" />
                      Start Interview Prep
                    </Link>
                  </Button>

                  <Button
                    variant={saved ? "accent" : "outline"}
                    size="lg"
                    className="w-full"
                    onClick={async () => {
                      if (!grantId || saved) return;
                      try {
                        await createTracker({ grantId });
                        setSaved(true);
                        setStatusMessage('Grant added to your tracker!');
                      } catch (err: unknown) {
                        if (err instanceof Error && err.message?.includes('already tracked')) {
                          setSaved(true);
                        } else {
                          console.error('Tracker add failed:', err);
                        }
                      }
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {saved ? "Added to Tracker" : "Add to Tracker"}
                  </Button>

                  {statusMessage && (
                    <div className="mt-3 text-center text-sm text-[var(--color-muted)]">
                      {statusMessage}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass-strong" padding="none">
              <CardHeader className="border-b border-[var(--border-default)]">
                <CardTitle>Match reasoning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <div key={index} className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4 text-sm leading-6 text-[var(--color-text)]">
                      {insight}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4 text-sm text-[var(--color-muted)]">
                    No reasoning text was returned for this grant.
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
