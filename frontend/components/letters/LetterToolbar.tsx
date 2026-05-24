"use client";

import * as React from "react";
import { Copy, Download, RefreshCw, Save, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGENERATE_OPTIONS } from "@/hooks/useLetterEditor";

interface LetterToolbarProps {
  regenerateStyle: (typeof REGENERATE_OPTIONS)[number];
  setRegenerateStyle: (style: (typeof REGENERATE_OPTIONS)[number]) => void;
  onRegenerate: (style: (typeof REGENERATE_OPTIONS)[number]) => void;
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function LetterToolbar({
  regenerateStyle,
  setRegenerateStyle,
  onRegenerate,
  onCopy,
  onDownload,
  onSave,
  isSaving,
}: LetterToolbarProps) {
  return (
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

      <Button variant="outline" size="sm" onClick={() => onRegenerate(regenerateStyle)}>
        <WandSparkles className="h-4 w-4" />
        Regenerate
      </Button>
      <Button variant="outline" size="sm" onClick={onCopy}>
        <Copy className="h-4 w-4" />
        Copy to Clipboard
      </Button>
      <Button variant="outline" size="sm" onClick={onDownload}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      <Button size="sm" onClick={onSave} loading={isSaving}>
        <Save className="h-4 w-4" />
        Save
      </Button>
    </div>
  );
}
