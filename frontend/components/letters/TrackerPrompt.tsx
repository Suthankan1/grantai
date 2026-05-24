"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackerPromptProps {
  onAdd: () => void;
}

export function TrackerPrompt({ onAdd }: TrackerPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 flex items-center justify-between rounded-2xl border border-[rgba(0,212,170,0.25)] bg-[rgba(0,212,170,0.08)] p-3"
    >
      <div>
        <div className="text-sm font-medium text-[var(--color-text)]">
          Add to Application Tracker?
        </div>
        <div className="text-xs text-[var(--color-muted)]">
          Keep this grant and cover letter linked in your workflow.
        </div>
      </div>
      <Button size="sm" variant="accent" onClick={onAdd}>
        <PlusCircle className="h-4 w-4" />
        Add
      </Button>
    </motion.div>
  );
}
