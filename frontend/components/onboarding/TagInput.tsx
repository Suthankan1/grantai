"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label: string;
  description: string;
  error?: string;
}

export function TagInput({ tags, onChange, label, description, error }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();
    if (!value || tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      return;
    }
    onChange([...tags, value]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="primary" className="gap-1 pr-1.5">
              {tag}
              <button
                type="button"
                className="rounded-full p-0.5 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => onChange(tags.filter((value) => value !== tag))}
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
              if (event.key === "Backspace" && !input && tags.length > 0) {
                onChange(tags.slice(0, -1));
              }
            }}
            placeholder="Type an interest and press Enter"
            className="min-w-56 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{description}</span>
        <span>{tags.length} / 3 required</span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
