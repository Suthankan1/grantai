"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Download,
  RefreshCw,
  Save,
  Sparkles,
  WandSparkles,
  ArrowLeft,
  CalendarDays,
  PlusCircle,
  Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  API_BASE_URL,
  getGrantById,
  getLetterById,
  type CoverLetterGeneratePayload,
  updateLetter,
} from "@/lib/api";

type EditorState = "IDLE" | "GENERATING" | "READY";

type GrantSnapshot = {
  id: string;
  title: string;
  provider: string;
  amount: number | string | null;
  currency: string | null;
  deadline: string | null;
  description: string;
};

const TONE_OPTIONS = ["Professional", "Warm", "Academic"] as const;
const LENGTH_OPTIONS = ["Short 300w", "Standard 500w", "Detailed 800w"] as const;
const EMPHASIS_OPTIONS = ["research experience", "personal story", "achievements"] as const;
const REGENERATE_OPTIONS = ["default", "more formal", "more personal", "shorter", "longer"] as const;

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

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHtml(input: string) {
  return escapeHtml(input).replace(/\n/g, "<br />");
}

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
  const routeId = params?.id;

  const grantQuery = useQuery({
    queryKey: ["grant", routeId],
    queryFn: () => getGrantById(routeId),
    enabled: !!routeId,
    retry: false,
  });

  const letterQuery = useQuery({
    queryKey: ["letter", routeId],
    queryFn: () => getLetterById(routeId),
    enabled: !!routeId,
    retry: false,
  });

  const [editorState, setEditorState] = React.useState<EditorState>("IDLE");
  const [tone, setTone] = React.useState<(typeof TONE_OPTIONS)[number]>("Professional");
  const [length, setLength] = React.useState<(typeof LENGTH_OPTIONS)[number]>("Standard 500w");
  const [emphasis, setEmphasis] = React.useState<string[]>(["achievements"]);
  const [customPrompt, setCustomPrompt] = React.useState("");
  const [regenerateStyle, setRegenerateStyle] = React.useState<(typeof REGENERATE_OPTIONS)[number]>("default");
  const [letterId, setLetterId] = React.useState<string | null>(null);
  const [streamingText, setStreamingText] = React.useState("");
  const [editorHtml, setEditorHtml] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showTrackerPrompt, setShowTrackerPrompt] = React.useState(false);

  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const queueRef = React.useRef("");
  const isStreamDoneRef = React.useRef(false);
  const streamingTextRef = React.useRef("");

  React.useEffect(() => {
    streamingTextRef.current = streamingText;
  }, [streamingText]);

  React.useEffect(() => {
    if (!letterQuery.data) return;

    const letter = letterQuery.data;
    if (letter.tone && TONE_OPTIONS.includes(letter.tone as (typeof TONE_OPTIONS)[number])) {
      setTone(letter.tone as (typeof TONE_OPTIONS)[number]);
    }
    if (letter.length && LENGTH_OPTIONS.includes(letter.length as (typeof LENGTH_OPTIONS)[number])) {
      setLength(letter.length as (typeof LENGTH_OPTIONS)[number]);
    }
    if (Array.isArray(letter.emphasis) && letter.emphasis.length > 0) {
      setEmphasis(letter.emphasis);
    }
    if (letter.customPrompt) {
      setCustomPrompt(letter.customPrompt);
    }
    if (letter.regenerationStyle && REGENERATE_OPTIONS.includes(letter.regenerationStyle as (typeof REGENERATE_OPTIONS)[number])) {
      setRegenerateStyle(letter.regenerationStyle as (typeof REGENERATE_OPTIONS)[number]);
    }

    setLetterId(letter.id);

    if (letter.content) {
      const content = letter.content.includes("<") ? letter.content : textToHtml(letter.content);
      setEditorHtml(content);
      setEditorState("READY");
    }
  }, [letterQuery.data]);

  React.useEffect(() => {
    if (editorState !== "GENERATING") return;

    const interval = window.setInterval(() => {
      if (queueRef.current.length > 0) {
        const nextChar = queueRef.current[0];
        queueRef.current = queueRef.current.slice(1);
        setStreamingText((prev) => prev + nextChar);
        return;
      }

      if (isStreamDoneRef.current) {
        isStreamDoneRef.current = false;
        const finalText = streamingTextRef.current;
        setEditorHtml(textToHtml(finalText));
        setEditorState("READY");
        setStatusMessage("Generation complete. You can edit and save.");
      }
    }, 14);

    return () => window.clearInterval(interval);
  }, [editorState]);

  React.useEffect(() => {
    if (editorState === "READY" && editorRef.current) {
      editorRef.current.innerHTML = editorHtml;
    }
  }, [editorHtml, editorState]);

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

  const streamTokens = React.useMemo(() => {
    return (streamingText.match(/\S+\s*/g) ?? []).map((token, index) => ({
      id: `${index}-${token.length}`,
      token,
    }));
  }, [streamingText]);

  const generateLetter = React.useCallback(
    async (overrideStyle?: string) => {
      if (!grant) return;

      setStatusMessage(null);
      setShowTrackerPrompt(false);
      setEditorState("GENERATING");
      setStreamingText("");
      setEditorHtml("");
      queueRef.current = "";
      isStreamDoneRef.current = false;

      const payload: CoverLetterGeneratePayload = {
        grantId: grant.id,
        tone,
        length,
        emphasis,
        customPrompt,
        regenerationStyle: overrideStyle ?? regenerateStyle,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/letters/generate`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok || !response.body) {
          throw new Error("Unable to start letter generation.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let eventName = "message";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
              continue;
            }

            if (line.startsWith("data:")) {
              const raw = line.slice(5).trim();
              if (!raw) continue;

              if (eventName === "meta") {
                const meta = JSON.parse(raw) as { letterId?: string };
                if (meta.letterId) {
                  setLetterId(meta.letterId);
                }
              } else if (eventName === "chunk") {
                const chunk = JSON.parse(raw) as { delta?: string };
                if (chunk.delta) {
                  queueRef.current += chunk.delta;
                }
              } else if (eventName === "done") {
                isStreamDoneRef.current = true;
              } else if (eventName === "error") {
                const errorData = JSON.parse(raw) as { message?: string };
                throw new Error(errorData.message ?? "Generation failed.");
              }
            }

            if (!line.trim()) {
              eventName = "message";
            }
          }
        }

        isStreamDoneRef.current = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate letter.";
        setStatusMessage(message);
        setEditorState("IDLE");
      }
    },
    [customPrompt, emphasis, grant, length, regenerateStyle, tone]
  );

  const applyCommand = React.useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current.innerHTML);
  }, []);

  const copyToClipboard = React.useCallback(async () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setStatusMessage("Copied cover letter to clipboard.");
  }, []);

  const downloadPdf = React.useCallback(async () => {
    if (!editorRef.current || !grant) return;
    const text = editorRef.current.innerText.trim();
    if (!text) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const lines = doc.splitTextToSize(text, 500);

    let y = 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`${grant.title} — Cover Letter`, 50, y);
    y += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    lines.forEach((line: string) => {
      if (y > 780) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, 50, y);
      y += 17;
    });

    doc.save("grantai-cover-letter.pdf");
    setStatusMessage("PDF downloaded.");
  }, [grant]);

  const saveLetter = React.useCallback(async () => {
    if (!letterId || !editorRef.current) return;

    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateLetter(letterId, {
        content: editorRef.current.innerHTML,
      });
      setShowTrackerPrompt(true);
      setStatusMessage("Cover letter saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save letter.";
      setStatusMessage(message);
    } finally {
      setIsSaving(false);
    }
  }, [letterId]);

  const addToTracker = React.useCallback(async () => {
    if (!grant) return;

    const tracker = JSON.parse(window.localStorage.getItem("grantai-tracker") ?? "[]") as string[];
    const next = tracker.includes(grant.id) ? tracker : [...tracker, grant.id];
    window.localStorage.setItem("grantai-tracker", JSON.stringify(next));

    if (letterId) {
      await updateLetter(letterId, { addToTracker: true });
    }

    setShowTrackerPrompt(false);
    setStatusMessage("Added to application tracker.");
  }, [grant, letterId]);

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
          <p className="mt-3 text-sm text-[var(--color-muted)]">Open this page from a grant card or use an existing letter ID.</p>
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

        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-[rgba(240,240,255,0.05)] px-4 bg-[rgba(8,8,16,0.5)] backdrop-blur-md md:hidden shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4AA] flex items-center justify-center shadow-glow-sm">
              <span className="text-[10px] font-bold text-white">G</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">GrantAI</span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,240,255,0.06)] text-[var(--color-muted)] hover:text-white"
            aria-label="Open Menu"
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

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
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-3 py-1.5 text-xs text-[var(--color-muted)]">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Regenerate style</span>
                <select
                  className="rounded-md border border-[var(--border-default)] bg-[rgba(15,15,26,0.9)] px-2 py-1 text-[var(--color-text)]"
                  value={regenerateStyle}
                  onChange={(event) => setRegenerateStyle(event.target.value as (typeof REGENERATE_OPTIONS)[number])}
                >
                  {REGENERATE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="outline" size="sm" onClick={() => generateLetter(regenerateStyle)}>
                <WandSparkles className="h-4 w-4" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPdf}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button size="sm" onClick={saveLetter} loading={isSaving}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
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
                <div className="grid gap-4 overflow-y-auto pr-1">
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="space-y-1 text-sm text-[var(--color-muted)]">
                      <span>Tone</span>
                      <select
                        value={tone}
                        onChange={(event) => setTone(event.target.value as (typeof TONE_OPTIONS)[number])}
                        className="w-full rounded-xl border border-[var(--border-default)] bg-[rgba(15,15,26,0.85)] px-3 py-2 text-sm text-[var(--color-text)]"
                      >
                        {TONE_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-sm text-[var(--color-muted)]">
                      <span>Length</span>
                      <select
                        value={length}
                        onChange={(event) => setLength(event.target.value as (typeof LENGTH_OPTIONS)[number])}
                        className="w-full rounded-xl border border-[var(--border-default)] bg-[rgba(15,15,26,0.85)] px-3 py-2 text-sm text-[var(--color-text)]"
                      >
                        {LENGTH_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-sm text-[var(--color-muted)]">
                      <span>Regeneration profile</span>
                      <select
                        value={regenerateStyle}
                        onChange={(event) => setRegenerateStyle(event.target.value as (typeof REGENERATE_OPTIONS)[number])}
                        className="w-full rounded-xl border border-[var(--border-default)] bg-[rgba(15,15,26,0.85)] px-3 py-2 text-sm text-[var(--color-text)]"
                      >
                        {REGENERATE_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-[var(--color-muted)]">Emphasis</div>
                    <div className="flex flex-wrap gap-2">
                      {EMPHASIS_OPTIONS.map((item) => {
                        const active = emphasis.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${
                              active
                                ? "border-[rgba(108,71,255,0.6)] bg-[rgba(108,71,255,0.22)] text-[var(--color-text)]"
                                : "border-[var(--border-default)] bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]"
                            }`}
                            onClick={() => {
                              setEmphasis((prev) =>
                                prev.includes(item)
                                  ? prev.filter((value) => value !== item)
                                  : [...prev, item]
                              );
                            }}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="space-y-1 text-sm text-[var(--color-muted)]">
                    <span>Additional instructions</span>
                    <textarea
                      value={customPrompt}
                      onChange={(event) => setCustomPrompt(event.target.value)}
                      placeholder="Include specific achievements, preferred structure, or voice cues."
                      className="h-28 w-full rounded-2xl border border-[var(--border-default)] bg-[rgba(15,15,26,0.85)] px-3 py-2 text-sm text-[var(--color-text)]"
                    />
                  </label>

                  <div>
                    <Button size="lg" variant="glow" onClick={() => generateLetter()}>
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
              )}

              {editorState === "GENERATING" && (
                <div className="relative h-full overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[rgba(12,12,22,0.75)] p-5 leading-8">
                  <AnimatePresence>
                    <motion.div
                      key="stream"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-pre-wrap text-[15px] text-[var(--color-text)]"
                    >
                      {streamTokens.map((item, index) => (
                        <motion.span
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut", delay: Math.min(index * 0.002, 0.25) }}
                        >
                          {item.token}
                        </motion.span>
                      ))}
                      <motion.span
                        className="inline-block h-5 w-[2px] translate-y-1 bg-[var(--color-accent)]"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
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
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between rounded-2xl border border-[rgba(0,212,170,0.25)] bg-[rgba(0,212,170,0.08)] p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text)]">Add to Application Tracker?</div>
                    <div className="text-xs text-[var(--color-muted)]">Keep this grant and cover letter linked in your workflow.</div>
                  </div>
                  <Button size="sm" variant="accent" onClick={addToTracker}>
                    <PlusCircle className="h-4 w-4" />
                    Add
                  </Button>
                </motion.div>
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
