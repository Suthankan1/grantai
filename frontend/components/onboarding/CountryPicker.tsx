"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries } from "@/lib/onboarding-constants";

interface CountryPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}

export function CountryPicker({ value, onChange, label, error }: CountryPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return countries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(search)
    );
  }, [query]);

  const selected = countries.find((country) => country.name === value);

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
            <span>{selected ? selected.flag : "🌍"}</span>
            {selected ? selected.name : value || "Search and select a country"}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-3 shadow-card-hover">
            <Input
              autoFocus
              variant="filled"
              placeholder="Search countries"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-3"
            />
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {matches.length > 0 ? (
                matches.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(country.name);
                      setQuery("");
                      setTimeout(() => setOpen(false), 50);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[rgba(108,71,255,0.08)]"
                  >
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      {country.name}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">{country.code}</span>
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
                  <span>🌍</span>
                  <span>Use &quot;{query.trim()}&quot; as custom country</span>
                </button>
              ) : (
                <p className="px-3 py-2 text-sm text-[var(--color-muted)]">No matching countries.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
