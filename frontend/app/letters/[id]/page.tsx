"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { getGrantById, getLetterById } from "@/lib/api";
import { formatAmount } from "@/lib/format-helpers";
import { useLetterEditor, type GrantSnapshot } from "@/hooks/useLetterEditor";
import { LetterToolbar } from "@/components/letters/LetterToolbar";
import { GenerationControls } from "@/components/letters/GenerationControls";
import { StreamingPreview } from "@/components/letters/StreamingPreview";
import { TrackerPrompt } from "@/components/letters/TrackerPrompt";

function normalizeGrantFromLetter(letter: Awaited<ReturnType<typeof getLetterById>>): GrantSnapshot {
  return {
    id: letter.grantId,
    title: letter.grantTitle,
    provider: letter.grantProvider,
    amount: letter.grantAmount,
    currency: letter.grantCurrency,
    deadline: letter.grantDeadline,
    description: letter.grantDescription ?? "",
  };
}

export default function LetterEditorPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const routeId = params?.id;
  const source = searchParams.get("source");
  const isGrantSource = source === "grant";
  const isLetterSource = source === "letter";

  const grantQuery = useQuery({
    queryKey: ["grant", routeId],
    queryFn: () => getGrantById(routeId),
    enabled: !!routeId && !isLetterSource,
    retry: false,
  });

  const letterQuery = useQuery({
    queryKey: ["letter", routeId],
    queryFn: () => getLetterById(routeId),
    enabled: !!routeId && !isGrantSource,
    retry: false,
  });

  const grant: GrantSnapshot | null = React.useMemo(() => {
    if (grantQuery.data) {
      return {
        id: grantQuery.data.id,
        title: grantQuery.data.title,
        provider: grantQuery.data.provider,
        amount: grantQuery.data.amount,
        currency: grantQuery.data.currency,
        deadline: grantQuery.data.deadline,
        description: grantQuery.data.description,
      };
    }

    if (letterQuery.data) {
      return normalizeGrantFromLetter(letterQuery.data);
    }

    return null;
  }, [grantQuery.data, letterQuery.data]);

  const {
    editorState,
    tone,
    setTone,
    length,
    setLength,
    emphasis,
    setEmphasis,
    customPrompt,
    setCustomPrompt,
    regenerateStyle,
    setRegenerateStyle,
    setEditorHtml,
    statusMessage,
    isSaving,
    showTrackerPrompt,
    editorRef,
    streamTokens,
    generateLetter,
    applyCommand,
    copyToClipboard,
    downloadPdf,
    saveLetter,
    addToTracker,
  } = useLetterEditor({ grant, initialLetterData: letterQuery.data });

  if (grantQuery.isLoading && letterQuery.isLoading) {
    return (
      <section className="min-h-[calc(100svh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid h-[calc(100svh-8rem)] max-w-7xl gap-5 lg:grid-cols-[1.8fr_2.2fr]">
          <div className="shimmer rounded-[2rem]" />
          <div className="shimmer rounded-[2rem]" />
        </div>
      </section>
    );
  }

  if (!grant) {
    return (
      <section className="min-h-[calc(100svh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <Card variant="glass-strong" className="mx-auto max-w-2xl p-8 text-center">
          <CardTitle>Letter context not found</CardTitle>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Open this page from a grant card or use an existing letter ID.
          </p>
          <Button asChild className="mt-6">
            <Link href="/grants">
              <ArrowLeft className="h-4 w-4" />
              Back to grants
            </Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-obsidian)] text-white overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Sleek radial lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.06),_transparent_32%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid opacity-25 -z-10" aria-hidden="true" />

        {/* Reusable Mobile Header */}
        <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />

        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,71,255,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.14),_transparent_24%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
          <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-[calc(100svh-6rem)] max-w-[1500px] flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/grants">
                  <ArrowLeft className="h-4 w-4" />
                  Back to grants
                </Link>
              </Button>

              {editorState === "READY" && (
                <LetterToolbar
                  regenerateStyle={regenerateStyle}
                  setRegenerateStyle={setRegenerateStyle}
                  onRegenerate={generateLetter}
                  onCopy={copyToClipboard}
                  onDownload={downloadPdf}
                  onSave={saveLetter}
                  isSaving={isSaving}
                />
              )}
            </div>

            <div className="grid h-full gap-5 overflow-hidden lg:grid-cols-[1.8fr_2.2fr]">
              <Card variant="glass-strong" padding="none" className="h-full overflow-hidden">
                <CardHeader className="border-b border-[var(--border-default)] px-5 py-4">
                  <CardTitle>Grant Details</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[calc(100%-4.25rem)] flex-col gap-4 overflow-y-auto px-5 py-5">
                  <div className="space-y-2">
                    <h1 className="font-display text-3xl leading-tight tracking-tight">{grant.title}</h1>
                    <p className="text-base text-[var(--color-muted)]">{grant.provider}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="solid-accent">{formatAmount(grant.amount, grant.currency)}</Badge>
                    {grant.deadline && (
                      <Badge variant="warning">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Deadline {grant.deadline}
                      </Badge>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-4">
                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--color-subtle)]">Description</div>
                    <p className="text-sm leading-7 text-[var(--color-text)]/90">{grant.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass-strong" padding="none" className="h-full overflow-hidden">
                <CardHeader className="border-b border-[var(--border-default)] px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>Cover Letter Editor</CardTitle>
                    {editorState === "GENERATING" && (
                      <Badge variant="primary" className="gap-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        Generating
                        <span className="inline-flex w-5 justify-between">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              className="h-1 w-1 rounded-full bg-current"
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                            />
                          ))}
                        </span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex h-[calc(100%-4.25rem)] flex-col overflow-hidden px-5 py-5">
                  {editorState === "IDLE" && (
                    <GenerationControls
                      tone={tone}
                      setTone={setTone}
                      length={length}
                      setLength={setLength}
                      regenerateStyle={regenerateStyle}
                      setRegenerateStyle={setRegenerateStyle}
                      emphasis={emphasis}
                      setEmphasis={setEmphasis}
                      customPrompt={customPrompt}
                      setCustomPrompt={setCustomPrompt}
                      onGenerate={() => generateLetter()}
                    />
                  )}

                  {editorState === "GENERATING" && (
                    <StreamingPreview streamTokens={streamTokens} />
                  )}

                  {editorState === "READY" && (
                    <>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => applyCommand("bold")}>Bold</Button>
                        <Button variant="outline" size="sm" onClick={() => applyCommand("italic")}>Italic</Button>

                        <select
                          className="h-8 rounded-lg border border-[var(--border-default)] bg-[rgba(15,15,26,0.9)] px-2 text-sm text-[var(--color-text)]"
                          defaultValue="3"
                          onChange={(event) => applyCommand("fontSize", event.target.value)}
                        >
                          <option value="2">Font small</option>
                          <option value="3">Font normal</option>
                          <option value="4">Font large</option>
                          <option value="5">Font extra large</option>
                        </select>

                        <select
                          className="h-8 rounded-lg border border-[var(--border-default)] bg-[rgba(15,15,26,0.9)] px-2 text-sm text-[var(--color-text)]"
                          defaultValue="P"
                          onChange={(event) => applyCommand("formatBlock", `<${event.target.value}>`)}
                        >
                          <option value="P">Paragraph</option>
                          <option value="H2">Heading</option>
                          <option value="BLOCKQUOTE">Quote</option>
                        </select>
                      </div>

                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="h-full overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[rgba(12,12,22,0.75)] p-5 text-[15px] leading-8 text-[var(--color-text)]"
                        onInput={() => {
                          if (!editorRef.current) return;
                          setEditorHtml(editorRef.current.innerHTML);
                        }}
                      />
                    </>
                  )}

                  {showTrackerPrompt && (
                    <TrackerPrompt onAdd={addToTracker} />
                  )}

                  {statusMessage && <div className="mt-3 text-sm text-[var(--color-muted)]">{statusMessage}</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
