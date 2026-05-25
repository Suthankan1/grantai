"use client";

import * as React from "react";
import {
  authFetch,
  updateLetter,
  createTracker,
  type CoverLetterGeneratePayload,
} from "@/lib/api";

export type EditorState = "IDLE" | "GENERATING" | "READY";

export type GrantSnapshot = {
  id: string;
  title: string;
  provider: string;
  amount: number | string | null;
  currency: string | null;
  deadline: string | null;
  description: string;
};

export const TONE_OPTIONS = ["Professional", "Warm", "Academic"] as const;
export const LENGTH_OPTIONS = ["Short 300w", "Standard 500w", "Detailed 800w"] as const;
export const EMPHASIS_OPTIONS = ["research experience", "personal story", "achievements"] as const;
export const REGENERATE_OPTIONS = ["default", "more formal", "more personal", "shorter", "longer"] as const;

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function textToHtml(input: string) {
  return escapeHtml(input).replace(/\n/g, "<br />");
}

interface UseLetterEditorProps {
  grant: GrantSnapshot | null;
  initialLetterData: any; // Using any for flexible type compatibility with letters API responses
}

export function useLetterEditor({ grant, initialLetterData }: UseLetterEditorProps) {
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
    setEditorState("IDLE");
    setStreamingText("");
    setEditorHtml("");
    setStatusMessage(null);
    setShowTrackerPrompt(false);
  }, [initialLetterData?.id]);

  React.useEffect(() => {
    if (!initialLetterData) return;

    const letter = initialLetterData;
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
  }, [initialLetterData]);

  React.useEffect(() => {
    if (editorState !== "GENERATING") return;

    const interval = window.setInterval(() => {
      if (queueRef.current.length > 0) {
        const batch = queueRef.current.slice(0, 8);
        queueRef.current = queueRef.current.slice(8);
        setStreamingText((prev) => prev + batch);
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

  const streamTokens = React.useMemo(() => {
    return (streamingText.match(/\S+\s*/g) ?? []).map((token, index) => ({
      id: `${index}-${token.length}`,
      token,
    }));
  }, [streamingText]);

  const generateLetter = React.useCallback(
    async (overrideStyle?: string) => {
      if (!grant) return;
      const selectedRegenerateStyle = REGENERATE_OPTIONS.includes(
        overrideStyle as (typeof REGENERATE_OPTIONS)[number]
      )
        ? (overrideStyle as (typeof REGENERATE_OPTIONS)[number])
        : regenerateStyle;

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
        regenerationStyle: selectedRegenerateStyle,
      };

      try {
        const response = await authFetch("/api/letters/generate", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          setStatusMessage(err.message || err.error || "Generation failed. Please try again.");
          setEditorState("IDLE");
          return;
        }

        if (!response.body) {
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
        if (!streamingTextRef.current && queueRef.current) {
          setStreamingText(queueRef.current);
        }
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

    // A4 dimensions: 210 × 297 mm
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 16; // space reserved for footer
    const contentWidth = pageWidth - marginLeft - marginRight;
    const footerY = pageHeight - 8;

    const addFooter = () => {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 180);
      doc.text("Generated by GrantAI", pageWidth / 2, footerY, { align: "center" });
      // reset colour for body text
      doc.setTextColor(30, 30, 30);
    };

    // ── Title ──────────────────────────────────────────────────────────────────
    let y = marginTop;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 30);
    doc.text(grant.title, marginLeft, y);
    y += 7;

    // ── Provider sub-heading ───────────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 120);
    doc.text(grant.provider, marginLeft, y);
    y += 3;

    // ── Divider rule ───────────────────────────────────────────────────────────
    doc.setDrawColor(200, 200, 220);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 6;

    // ── Body content ───────────────────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    const lineHeight = 6; // mm per line at 11pt
    const maxY = pageHeight - marginBottom;

    const lines = doc.splitTextToSize(text, contentWidth) as string[];

    addFooter(); // footer on first page

    for (const line of lines) {
      if (y + lineHeight > maxY) {
        doc.addPage();
        y = marginTop;
        addFooter();
      }
      doc.text(line, marginLeft, y);
      y += lineHeight;
    }

    // ── Save ───────────────────────────────────────────────────────────────────
    const safeTitle = grant.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    doc.save(`${safeTitle}-cover-letter.pdf`);
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

    try {
      await createTracker({ grantId: grant.id });
      if (letterId) {
        await updateLetter(letterId, { addToTracker: true });
      }
      setShowTrackerPrompt(false);
      setStatusMessage("Added to application tracker.");
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes("already tracked")) {
        if (letterId) {
          await updateLetter(letterId, { addToTracker: true });
        }
        setShowTrackerPrompt(false);
        setStatusMessage("Added to application tracker.");
      } else {
        console.error("Failed to add to tracker:", err);
        const msg = err instanceof Error ? err.message : "Request failed.";
        setStatusMessage(`Failed to add to tracker: ${msg}`);
      }
    }
  }, [grant, letterId]);

  return {
    editorState,
    setEditorState,
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
    letterId,
    streamingText,
    editorHtml,
    setEditorHtml,
    statusMessage,
    setStatusMessage,
    isSaving,
    showTrackerPrompt,
    setShowTrackerPrompt,
    editorRef,
    streamTokens,
    generateLetter,
    applyCommand,
    copyToClipboard,
    downloadPdf,
    saveLetter,
    addToTracker,
  };
}
