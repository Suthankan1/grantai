"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionSaveBarProps {
  answeredCount: number;
  totalCount: number;
  savingSession: boolean;
  saveSuccess: boolean;
  handleSaveSession: () => void;
}

export function SessionSaveBar({
  answeredCount,
  totalCount,
  savingSession,
  saveSuccess,
  handleSaveSession,
}: SessionSaveBarProps) {
  if (answeredCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl"
    >
      <div className="text-sm text-[var(--color-text)]/90 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <span>
          You have answered <strong>{answeredCount}</strong> / {totalCount} questions.
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleSaveSession}
          disabled={savingSession || saveSuccess}
          variant={saveSuccess ? "accent" : "glow"}
          size="sm"
        >
          {savingSession ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Practice Session"}
        </Button>
      </div>
    </motion.div>
  );
}
