"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Sparkles, Building, X, Check } from "lucide-react";
import { searchGrants, GrantSummaryApi, TrackerCreatePayload } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnStatus: string; // The status column the + was clicked in
  onCreate: (payload: TrackerCreatePayload) => Promise<void>;
}

export default function AddApplicationModal({ isOpen, onClose, columnStatus, onCreate }: AddApplicationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GrantSummaryApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<GrantSummaryApi | null>(null);
  const [creating, setCreating] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger search when query changes with debouncing
  useEffect(() => {
    if (!isOpen) return;

    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchGrants({ q: searchQuery, page: 0, size: 10 });
        setResults(response.items || []);
      } catch (err) {
        console.error("Failed to search grants:", err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isOpen]);

  // Clean values on open/close
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setResults([]);
      setSelectedGrant(null);
      setLoading(false);
      setCreating(false);
    }
  }, [isOpen]);

  const handleSelect = (grant: GrantSummaryApi) => {
    setSelectedGrant(selectedGrant?.id === grant.id ? null : grant);
  };

  const handleTrack = async () => {
    if (!selectedGrant) return;
    setCreating(true);
    try {
      await onCreate({
        grantId: selectedGrant.id,
        status: columnStatus,
        notes: "",
      });
      onClose();
    } catch (err) {
      alert((err as Error).message || "Failed to track grant application.");
    } finally {
      setCreating(false);
    }
  };

  // Format currency
  const formatAmount = (amount: string | number | null, currency: string | null) => {
    if (!amount) return "Not specified";
    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col w-full max-w-xl max-h-[85vh] rounded-3xl border border-[var(--border-default)] bg-[rgba(10,10,18,0.96)] p-6 shadow-2xl backdrop-blur-xl md:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[rgba(240,240,255,0.05)] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="pb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Kanban Board Integration
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Track New Application
          </h3>
          <p className="text-xs text-[var(--color-muted)] mt-1.5">
            Search our global directory to select a grant. It will be pre-added to the <strong className="text-purple-300">&quot;{columnStatus}&quot;</strong> column.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Type grant title, provider, or keyword (e.g. 'STEM', 'Climate')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            autoFocus
          />
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto min-h-[250px] space-y-3.5 my-5 pr-1 custom-scrollbar">
          {loading && (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)]" />
              <span className="text-xs text-[var(--color-muted)]">Searching verified grants directory...</span>
            </div>
          )}

          {!loading && results.length === 0 && searchQuery.trim().length >= 2 && (
            <div className="flex h-40 flex-col items-center justify-center text-center p-4">
              <p className="text-sm font-semibold text-slate-400">No matching grants found</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">Try searching with a broader keyword like &quot;CS&quot; or &quot;Research&quot;</p>
            </div>
          )}

          {!loading && results.length === 0 && searchQuery.trim().length < 2 && (
            <div className="flex h-40 flex-col items-center justify-center text-center p-4 border border-dashed border-[var(--border-default)] rounded-2xl bg-[rgba(240,240,255,0.01)]">
              <p className="text-xs text-slate-400">Start typing above to search the global grants index</p>
            </div>
          )}

          {!loading && results.map((grant) => {
            const isSelected = selectedGrant?.id === grant.id;
            return (
              <div
                key={grant.id}
                onClick={() => handleSelect(grant)}
                className={`relative flex items-start justify-between rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[rgba(108,71,255,0.065)] shadow-[0_4px_20px_rgba(108,71,255,0.15)]"
                    : "border-[var(--border-default)] bg-[rgba(240,240,255,0.015)] hover:border-[rgba(240,240,255,0.1)] hover:bg-[rgba(240,240,255,0.035)]"
                }`}
              >
                <div className="space-y-1.5 max-w-[80%]">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{grant.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                    <Building className="h-3.5 w-3.5 text-purple-400" />
                    <span>{grant.provider}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-slate-300 bg-[rgba(240,240,255,0.04)] rounded-md px-2 py-0.5 border border-[rgba(240,240,255,0.06)]">
                      {formatAmount(grant.amount, grant.currency)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300 bg-[rgba(240,240,255,0.04)] rounded-md px-2 py-0.5 border border-[rgba(240,240,255,0.06)]">
                      Deadline: {grant.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Select check or Score badge */}
                  {isSelected ? (
                    <div className="rounded-full bg-[var(--color-primary)] p-1 text-white shadow-lg">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      <Sparkles className="h-3 w-3" />
                      <span>{grant.matchScore}% Match</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 border-t border-[var(--border-default)] pt-4.5">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl"
            disabled={!selectedGrant || creating}
            onClick={handleTrack}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tracking...
              </>
            ) : (
              "Add to Tracker"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
