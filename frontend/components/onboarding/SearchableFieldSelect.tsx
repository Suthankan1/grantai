"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldsOfStudy } from "@/lib/onboarding-constants";

interface SearchableFieldSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}

export function SearchableFieldSelect({
  value,
  onChange,
  label,
  error,
}: SearchableFieldSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return fieldsOfStudy.filter((field) => field.toLowerCase().includes(search));
  }, [query]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 py-3 text-left text-sm text-[var(--color-text)] hover:border-[var(--border-strong)]"
          onClick={() => setOpen((state) => !state)}
        >
          <span className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[var(--color-muted)]" />
            {value || "Search field of study"}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-3 shadow-card-hover">
            <Input
              autoFocus
              variant="filled"
              placeholder="Search field of study"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-3"
            />
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {matches.length > 0 ? (
                matches.map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(field);
                      setQuery("");
                      setTimeout(() => setOpen(false), 50);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[rgba(108,71,255,0.08)]"
                  >
                    {field}
                  </button>
                ))
              ) : query.trim() ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(query.trim());
                    setQuery("");
                    setTimeout(() => setOpen(false), 50);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#00D4AA] hover:bg-[rgba(0,212,170,0.08)]"
                >
                  <span>Use &quot;{query.trim()}&quot; as custom field</span>
                </button>
              ) : (
                <p className="px-3 py-2 text-sm text-[var(--color-muted)]">No matching fields.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
