"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, CheckCircle, Sparkles, Building, Globe, Award, ArrowRight } from "lucide-react";
import { TrackerEntryApi, TrackerUpdatePayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface DetailDrawerProps {
  card: TrackerEntryApi | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: TrackerUpdatePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function DetailDrawer({ card, isOpen, onClose, onUpdate, onDelete }: DetailDrawerProps) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize values when drawer opens/card changes
  useEffect(() => {
    if (card) {
      setStatus(card.status);
      setNotes(card.notes || "");
      setAppliedDate(card.appliedDate || "");
      setSaveStatus("idle");
    }
  }, [card]);

  // Debounced auto-save effect for notes
  const saveNotes = useCallback(
    async (latestNotes: string) => {
      if (!card) return;
      setSaveStatus("saving");
      try {
        await onUpdate(card.id, { notes: latestNotes });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
      }
    },
    [card, onUpdate]
  );

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);

    // Clear old timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    // Set new timer for debounced save (1.5 seconds after user stops typing)
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(value);
    }, 1500);
  };

  // Immediate save on blur
  const handleNotesBlur = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (card && notes !== card.notes) {
      saveNotes(notes);
    }
  };

  // Save changes to status or date immediately
  const handleStatusChange = async (newStatus: string) => {
    if (!card) return;
    setStatus(newStatus);
    setSaveStatus("saving");
    try {
      const payload: TrackerUpdatePayload = { status: newStatus };
      // If moving to Applied and appliedDate is empty, set today's date
      if (newStatus === "Applied" && !appliedDate) {
        const todayStr = new Date().toISOString().split("T")[0];
        payload.appliedDate = todayStr;
        setAppliedDate(todayStr);
      }
      await onUpdate(card.id, payload);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Status update failed:", err);
      setSaveStatus("error");
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setAppliedDate(newDate);
    if (!card) return;
    setSaveStatus("saving");
    try {
      await onUpdate(card.id, { appliedDate: newDate || "" });
      setSaveStatus("saved");
    } catch (err) {
      console.error("Date change failed:", err);
      setSaveStatus("error");
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

  const isGeneratingLetter = card?.coverLetterStatus === "GENERATING";

  return (
    <AnimatePresence>
      {isOpen && card && (
        <>
          {/* Drawer Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[var(--border-default)] bg-[rgba(10,10,18,0.96)] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] font-semibold">
                  Application Details
                </span>
                <h3 className="line-clamp-1 text-base font-bold text-white mt-0.5">
                  {card.grantTitle}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[rgba(240,240,255,0.05)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto space-y-6 py-6 custom-scrollbar pr-1">
              
              {/* Grant Quick Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[rgba(240,240,255,0.04)] bg-[rgba(240,240,255,0.02)] p-4">
                <div className="flex items-start gap-2.5">
                  <Building className="h-4 w-4 mt-0.5 text-purple-400" />
                  <div>
                    <span className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Provider</span>
                    <span className="text-xs font-semibold text-white">{card.grantProvider}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Award className="h-4 w-4 mt-0.5 text-emerald-400" />
                  <div>
                    <span className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Funding</span>
                    <span className="text-xs font-semibold text-white">{formatAmount(card.grantAmount, card.grantCurrency)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 mt-0.5 text-amber-400" />
                  <div>
                    <span className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Deadline</span>
                    <span className="text-xs font-semibold text-white">{card.grantDeadline || "No deadline"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Globe className="h-4 w-4 mt-0.5 text-blue-400" />
                  <div>
                    <span className="block text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold">Type</span>
                    <span className="text-xs font-semibold text-white">Tracked Grant</span>
                  </div>
                </div>
              </div>

              {/* Status and Applied Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Status</Label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.03)] px-3 py-2 text-xs font-medium text-white focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    {["Draft", "Applied", "Under Review", "Won", "Rejected"].map((s) => (
                      <option key={s} value={s} className="bg-slate-950 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Applied Date</Label>
                  <div className="relative">
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={handleDateChange}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.03)] px-3 py-2 text-xs text-white focus:border-[var(--color-primary)] focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Letter Integration */}
              <div className="space-y-2 border-t border-[rgba(240,240,255,0.04)] pt-5">
                <Label className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold block">AI Cover Letter</Label>
                
                {card.coverLetterId ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Cover Letter is Ready</div>
                        <span className="text-[10px] text-[var(--color-muted)] font-medium">Auto-generated with GrantAI</span>
                      </div>
                    </div>
                    <Button size="sm" asChild className="h-8.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                      <Link href={`/letters/${card.coverLetterId}`}>View Letter</Link>
                    </Button>
                  </div>
                ) : isGeneratingLetter ? (
                  <div className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Generating cover letter...</div>
                        <span className="text-[10px] text-[var(--color-muted)] font-medium">Assembling research variables</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.01)] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[rgba(240,240,255,0.03)] p-2 text-[var(--color-muted)]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[rgba(240,240,255,0.85)]">No Cover Letter Found</div>
                        <span className="text-[10px] text-[var(--color-muted)] font-medium">Optimize your submission</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="h-8.5 rounded-lg text-xs border-[rgba(240,240,255,0.1)] hover:bg-[rgba(240,240,255,0.045)] text-white">
                      <Link href={`/grants/${card.grantId}`}>Generate with AI</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Notes Textarea (with Auto-save indicator) */}
              <div className="space-y-2 border-t border-[rgba(240,240,255,0.04)] pt-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes" className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">Personal Notes</Label>
                  
                  {/* Status Indicator */}
                  <div className="text-[10px] font-medium transition-all duration-300">
                    {saveStatus === "saving" && (
                      <span className="flex items-center gap-1 text-purple-400">
                        <svg className="animate-spin h-3.5 w-3.5 text-purple-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving changes...
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        All changes saved
                      </span>
                    )}
                    {saveStatus === "error" && (
                      <span className="text-red-400">⚠️ Error auto-saving</span>
                    )}
                  </div>
                </div>
                
                <textarea
                  id="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  onBlur={handleNotesBlur}
                  placeholder="Record application requirements, document checklists, follow-ups, or notes on your application package. Autosaves as you type..."
                  className="h-32 w-full rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] p-4 text-xs leading-relaxed text-white placeholder-slate-500 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Extra Utilities (Interview Prep Link) */}
              <div className="space-y-3 border-t border-[rgba(240,240,255,0.04)] pt-5">
                <Label className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold block">Interview Prep</Label>
                <div className="group/btn relative rounded-2xl border border-[rgba(108,71,255,0.15)] bg-gradient-to-r from-[rgba(108,71,255,0.06)] to-transparent p-4 hover:border-[rgba(108,71,255,0.3)] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-purple-300">Grant Simulation Interview</h5>
                      <p className="text-xs text-[var(--color-muted)] mt-1.5 leading-normal max-w-sm">
                        Practice critical panel defense questions tailored specifically for the <strong className="text-white">&quot;{card.grantTitle}&quot;</strong> panel criteria.
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-400 group-hover/btn:translate-x-1 transition-transform">
                      <ArrowRight className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Operations */}
            <div className="border-t border-[var(--border-default)] pt-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl"
                onClick={async () => {
                  if (confirm("Are you sure you want to untrack this grant? Your notes will be lost.")) {
                    await onDelete(card.id);
                    onClose();
                  }
                }}
              >
                Untrack Application
              </Button>
              <Button className="flex-1 rounded-xl" onClick={onClose}>
                Done
              </Button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
