"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  EMPHASIS_OPTIONS,
  REGENERATE_OPTIONS,
} from "@/hooks/useLetterEditor";

interface GenerationControlsProps {
  tone: (typeof TONE_OPTIONS)[number];
  setTone: (tone: (typeof TONE_OPTIONS)[number]) => void;
  length: (typeof LENGTH_OPTIONS)[number];
  setLength: (length: (typeof LENGTH_OPTIONS)[number]) => void;
  regenerateStyle: (typeof REGENERATE_OPTIONS)[number];
  setRegenerateStyle: (style: (typeof REGENERATE_OPTIONS)[number]) => void;
  emphasis: string[];
  setEmphasis: React.Dispatch<React.SetStateAction<string[]>>;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  onGenerate: () => void;
}

export function GenerationControls({
  tone,
  setTone,
  length,
  setLength,
  regenerateStyle,
  setRegenerateStyle,
  emphasis,
  setEmphasis,
  customPrompt,
  setCustomPrompt,
  onGenerate,
}: GenerationControlsProps) {
  return (
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
        <Button size="lg" variant="glow" onClick={onGenerate}>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </div>
    </div>
  );
}
